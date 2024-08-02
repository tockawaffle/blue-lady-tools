use std::error::Error;
use std::fs;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::os::windows::process::CommandExt;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use regex::Regex;
use tauri::{Emitter, Window};
use tokio::sync::mpsc;
use winapi::um::winbase::CREATE_NO_WINDOW;

#[derive(Debug, PartialEq)]
enum VideoType {
    Clip,
    Playlist, // <-- Will not support it yet due to complexity
    Livestream,
    Video,
}

#[derive(Debug, PartialEq)]
enum VideoFormats {
    AudioOnly,     // mp3
    VideoOnly,     // mp4
    VideoAndAudio, // Selected by default
}

#[derive(Debug)]
struct DownloadStructure {
    url: String,
    video_type: VideoType,
    title: String,
    thumbnail: String,
    formats: Option<VideoFormats>,
}

#[derive(PartialEq, Debug)]
pub(crate) struct VideoInfo {
    pub(crate) title: String,
    pub(crate) ext: String,
    pub(crate) thumbnail: String,
    pub(crate) uploader: String,
}

fn get_video_type(url: &str) -> Result<VideoType, Box<dyn Error>> {
    let patterns = vec![
        (r"https?://(www\.)?youtube\.com/clip/", VideoType::Clip),
        (
            r"https?://(www\.)?youtube\.com/playlist\?list=",
            VideoType::Playlist,
        ),
        (
            r"https?://(www\.)?youtube\.com/watch\?v=[^&]+&live",
            VideoType::Livestream,
        ),
        (r"https?://(www\.)?youtube\.com/watch\?v=", VideoType::Video),
    ];

    for (pattern, video_type) in patterns {
        let re = Regex::new(pattern)?;
        if re.is_match(url) {
            return Ok(video_type);
        }
    }

    Err("Invalid URL format".into())
}

fn get_video_formats(user_format: Option<&str>) -> VideoFormats {
    match user_format {
        Some("audio") => VideoFormats::AudioOnly,
        Some("video") => VideoFormats::VideoOnly,
        _ => VideoFormats::VideoAndAudio,
    }
}

pub(crate) async fn download_video(
    url: &str,
    format: Option<&str>,
    path: String,
    unique_folders: bool,
    download_thumbnail: bool,
    write_url_link: bool,
    ytdlp_path: &str,
    ffmpeg_path: &str,
    window: &Window,
) -> Result<bool, Box<dyn Error>> {
    let video_type = get_video_type(url).unwrap();
    let formats = get_video_formats(format);

    if video_type == VideoType::Playlist {
        return Err("Playlist download is not supported yet".into());
    }

    let mut ytdlp_args: Vec<String> = Vec::new();

    // Check which format to download and set the appropriate flags
    match formats {
        VideoFormats::AudioOnly => {
            ytdlp_args.push("--extract-audio".into());
            ytdlp_args.push("--audio-format".into());
            ytdlp_args.push("mp3".into());
            // Needs to be added to the args if the format is audio only
            ytdlp_args.push("--ffmpeg-location".into());
            ytdlp_args.push(ffmpeg_path.into());
        }
        VideoFormats::VideoOnly => {
            ytdlp_args.push("--format".into());
            ytdlp_args.push("bestvideo[ext=mp4]".into());
        }
        VideoFormats::VideoAndAudio => {
            println!("Downloading video and audio");
            // This downloads the best video with audio as a mp4 file. Might edit this later to support other formats (if supported by yt-dlp)
            ytdlp_args.push("--format".into());
            ytdlp_args.push("bestvideo+bestaudio/mp4".into());
        }
    }

    let video_info =
        get_video_info(url, &ytdlp_path, ffmpeg_path).expect("Failed to get video info");

    let mut output_path = PathBuf::from(path);

    if unique_folders && video_type != VideoType::Playlist {
        output_path.push(&video_info.title);
    }

    // I might not support playlist downloads yet, but I will keep this here for future reference
    if video_type == VideoType::Playlist {
        output_path.push("%(playlist)s");
        output_path.push("%(title)s.%(ext)s");
    } else {
        output_path.push("%(title)s.%(ext)s");
    }

    // This sets the output path for the video. Frontend handles retrieving the default path if a custom path is not set.
    ytdlp_args.push("--output".into());
    ytdlp_args.push(output_path.to_str().unwrap().into());

    if download_thumbnail {
        ytdlp_args.push("--write-thumbnail".into());
    }

    if write_url_link {
        ytdlp_args.push("--write-url-link".into());
    }

    if url.contains("clip") {
        //Check if ffmpeg was already added to args
        if !ytdlp_args.contains(&"--ffmpeg-location".to_string()) {
            ytdlp_args.push("--ffmpeg-location".into());
            ytdlp_args.push(ffmpeg_path.into());
        }

        //Add metadata to the clip because why not? Also, might add this as a general flag for all downloads
        ytdlp_args.push("--add-metadata".into());
    }

    ytdlp_args.push("--progress".into());
    ytdlp_args.push("--newline".into());
    ytdlp_args.push("--verbose".into());
    ytdlp_args.push(url.into());

    let mut process = Command::new(ytdlp_path)
        .args(&ytdlp_args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .expect("Failed to start yt-dlp");

    let stdout = process.stdout.take().expect("Failed to capture stdout");
    let stderr = process.stderr.take().expect("Failed to capture stderr");

    let (tx, mut rx) = mpsc::channel::<String>(100);

    // Read stdout in a separate thread
    let tx_clone = tx.clone();
    tokio::spawn(async move {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            let line = line.unwrap();
            tx_clone.send(line).await.unwrap();
        }
    });

    // Read stderr in a separate thread
    tokio::spawn(async move {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            let line = line.unwrap();
            tx.send(line).await.unwrap();
        }
    });

    let app_resource_path = dirs::config_dir()
        .expect("Failed to get config directory").join("Blue Lady's Tools");
    let ytdlp_log_path = app_resource_path.join("logs");

    // Create the ytdlp.log file
    fs::create_dir_all(&ytdlp_log_path).expect("Failed to create FFMPEG directory");
    let ytdlp_log_path = ytdlp_log_path.join("ytdlp.log");
    File::create(&ytdlp_log_path).expect("Failed to create ytdlp.log");

    let mut ytdlp_log = OpenOptions::new()
        .write(true)
        .open(&ytdlp_log_path)
        .unwrap();

    // Process the output lines
    while let Some(line) = rx.recv().await {
        if line.contains("[download]") && line.contains("of") && line.contains("ETA") {
            println!("{}", line);
            window.emit("download_progress", line.clone()).unwrap();
        }

        // Write ytdlp.log to the resources folder for debugging purposes with new lines for each log entry
        ytdlp_log.write_all(format!("{}\n", line).as_bytes()).unwrap();
    }

    match process.wait_with_output() {
        Ok(output) => {
            if output.status.success() {
                Ok(true)
            } else {
                Err(format!("Error downloading video: Stdout {:?}", output.stdout).into())
            }
        }
        Err(e) => Err(e.to_string().into()),
    }
}

pub(crate) fn get_video_info(
    url: &str,
    ytdlp_path: &str,
    ffmpeg_path: &str,
) -> Result<VideoInfo, Box<dyn Error>> {
    let video_info = Command::new(ytdlp_path)
        .arg("--print")
        .arg("title")
        .arg("--print")
        .arg("ext")
        .arg("--print")
        .arg("thumbnail")
        .arg("--print")
        .arg("uploader")
        .arg("--ffmpeg-location")
        .arg(ffmpeg_path)
        .arg(url)
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .expect("Failed to get video info");

    if !video_info.status.success() {
        return Err("Failed to get video info".into());
    }

    let video_info = String::from_utf8_lossy(&video_info.stdout);
    let video_info = video_info.split("\n").collect::<Vec<&str>>();

    Ok(VideoInfo {
        title: video_info[0].to_string(),
        ext: video_info[1].to_string(),
        thumbnail: video_info[2].to_string(),
        uploader: video_info[3].to_string(),
    })
}
