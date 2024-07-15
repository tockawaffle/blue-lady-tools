use std::error::Error;
use std::path::PathBuf;
use std::process::Command;

use regex::Regex;

#[derive(Debug, PartialEq)]
enum VideoType {
    Clip,
    Playlist, // <-- Will not support it yet due to complexity
    Livestream,
    Video,
}

#[derive(Debug)]
#[derive(PartialEq)]
enum VideoFormats {
    AudioOnly, // mp3
    VideoOnly, // mp4
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
        (r"https?://(www\.)?youtube\.com/playlist\?list=", VideoType::Playlist),
        (r"https?://(www\.)?youtube\.com/watch\?v=[^&]+&live", VideoType::Livestream),
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


pub(crate) fn download_video(url: &str, format: Option<&str>, path: String, unique_folders: bool, download_thumbnail: bool, write_url_link: bool) -> Result<bool, Box<dyn Error>> {
    let video_type = get_video_type(url).unwrap();
    let formats = get_video_formats(format);

    if video_type == VideoType::Playlist {
        return Err("Playlist download is not supported yet".into());
    }

    let mut ytdlp_args: Vec<String> = Vec::new();

    match formats {
        VideoFormats::AudioOnly => {
            ytdlp_args.push("--extract-audio".into());
            ytdlp_args.push("--audio-format".into());
            ytdlp_args.push("mp3".into());
        }
        VideoFormats::VideoOnly => {
            ytdlp_args.push("--format".into());
            ytdlp_args.push("mp4".into());
        }
        VideoFormats::VideoAndAudio => {
            // Since this is the default, we don't need to do anything
        }
    }

    let video_info = get_video_info(url).expect("Failed to get video info");

    let mut output_path = PathBuf::from(path);

    if unique_folders && video_type != VideoType::Playlist {
        output_path.push(&video_info.title);
    }

    if video_type == VideoType::Playlist {
        output_path.push("%(playlist)s");
        output_path.push("%(title)s.%(ext)s");
    } else {
        output_path.push("%(title)s.%(ext)s");
    }

    ytdlp_args.push("--output".into());
    ytdlp_args.push(output_path.to_str().unwrap().into());

    if download_thumbnail {
        ytdlp_args.push("--write-thumbnail".into());
    }

    if write_url_link {
        ytdlp_args.push("--write-url-link".into());
    }

    ytdlp_args.push(url.into());

    let output = Command::new("yt-dlp")
        .args(&ytdlp_args)
        .output()
        .unwrap();

    if output.status.success() {
        Ok(true)
    } else {
        println!("{}", String::from_utf8_lossy(&output.stderr));
        Err("Failed to download video".into())
    }
}


pub(crate) fn get_video_info(url: &str) -> Result<VideoInfo, Box<dyn Error>> {
    let video_info = Command::new("yt-dlp")
        .arg("--print")
        .arg("title")
        .arg("--print")
        .arg("ext")
        .arg("--print")
        .arg("thumbnail")
        .arg("--print")
        .arg("uploader")
        .arg(url)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_video_type() {
        let url = "https://www.youtube.com/watch?v=1234";
        let result = get_video_type(url).unwrap();
        assert_eq!(result, VideoType::Video);

        let url = "https://www.youtube.com/clip/1234";
        let result = get_video_type(url).unwrap();
        assert_eq!(result, VideoType::Clip);

        let url = "https://www.youtube.com/playlist?list=1234";
        let result = get_video_type(url).unwrap();
        assert_eq!(result, VideoType::Playlist);

        let url = "https://www.youtube.com/watch?v=1234&live";
        let result = get_video_type(url).unwrap();
        assert_eq!(result, VideoType::Livestream);
    }

    #[test]
    fn test_get_video_formats() {
        let result = get_video_formats(Some("audio"));
        assert_eq!(result, VideoFormats::AudioOnly);

        let result = get_video_formats(Some("video"));
        assert_eq!(result, VideoFormats::VideoOnly);

        let result = get_video_formats(None);
        assert_eq!(result, VideoFormats::VideoAndAudio);
    }

    #[test]
    /// We'll not test for playlist because it's a bit more complex
    fn test_get_video_info() {
        let clip = "https://youtube.com/clip/UgkxUVRndkzoPrtR7k-LBWrm9aHaK2x4VKdn?si=YxoHjaMSAjX53Q_I";
        let video = "https://www.youtube.com/watch?v=oIr9e6x6qUw";

        let result = get_video_info(clip);
        let should_result_in = VideoInfo {
            title: "Sendo um cachorrinho desgramado - Doronko Wanko".to_string(),
            ext: "mkv".to_string(),
            thumbnail: "https://i.ytimg.com/vi/-qr9HbVPG4s/maxresdefault.jpg".to_string(),
            uploader: "Ritsu Matsuno".to_string(),
        };

        assert_eq!(result.unwrap(), should_result_in);
    }

    #[test]
    fn test_download_video() {
        let url = "https://www.youtube.com/watch?v=oIr9e6x6qUw";
        let format = Some("audio");
        let path = "test";
        let unique_folders = false;
        let download_thumbnail = false;
        let write_url_link = false;

        let result = download_video(url, format, path.to_string(), unique_folders, download_thumbnail, write_url_link);
        assert_eq!(result.unwrap(), true);
    }
}