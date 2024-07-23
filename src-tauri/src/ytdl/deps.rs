use std::fs;
use std::fs::File;
use std::io::{self, Cursor};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Duration;

use reqwest::blocking::Client;
use reqwest::header::USER_AGENT;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use zip_extract::extract;

pub fn invoke_ffmpeg_from_local(handle: tauri::AppHandle) -> Result<String, String> {
    // Resolve the resource path
    let resource_path = match handle.path_resolver().resolve_resource("resources/ffmpeg/ffmpeg.exe") {
        Some(path) => path,
        None => return Err("Failed to resolve the resource path.".into()),
    };

    // Execute the ffmpeg command to check if it works
    let output = Command::new(&resource_path)
        .arg("-version")
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                // If the command is successful, return the path
                Ok(resource_path.to_string_lossy().into_owned())
            } else {
                // If the command fails, return the stderr as an error message
                let stderr = String::from_utf8_lossy(&output.stderr);

                Err(format!("FFMPEG execution failed: {:?}", stderr))
            }
        }
        Err(e) => {
            // If the command cannot be executed, return the error message
            Err(format!("Failed to execute ffmpeg: {:?}", e))
        }
    }
}

pub fn invoke_ytdlp_from_local(handle: tauri::AppHandle) -> Result<String, String> {
    // Resolve the resource path
    let resource_path = match handle.path_resolver().resolve_resource("resources/yt-dlp/yt-dlp.exe") {
        Some(path) => path,
        None => return Err("Failed to resolve the resource path.".into()),
    };

    // Execute the ytdlp command to check if it works
    let output = Command::new(&resource_path)
        .arg("--version")
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                // If the command is successful, return the path
                Ok(resource_path.to_string_lossy().into_owned())
            } else {
                // If the command fails, return the stderr as an error message
                let stderr = String::from_utf8_lossy(&output.stderr);
                Err(format!("YTDLP execution failed: {:?}", stderr))
            }
        }
        Err(e) => {
            // If the command cannot be executed, return the error message
            Err(format!("Failed to execute ytdlp: {:?}", e))
        }
    }
}


/** Download Dependencies */
#[derive(Serialize, Deserialize)]
pub(crate) struct Deps {
    pub(crate) success: bool,
    pub(crate) message: String,
}

#[derive(Serialize, Deserialize)]
pub(crate) struct DownloadDepsResponse {
    pub(crate) ffmpeg: Deps,
    pub(crate) ytdlp: Deps,
}

#[derive(Serialize, Deserialize)]
pub(crate) struct VerifyDeps {
    pub(crate) ffmpeg: bool,
    pub(crate) ytdlp: bool,
}

#[tauri::command]
pub(crate) fn verify_deps(handle: AppHandle) -> VerifyDeps {
    let mut deps = VerifyDeps {
        ffmpeg: false,
        ytdlp: false,
    };

    match invoke_ffmpeg_from_local(handle.clone()) {
        Ok(ffmpeg_path) => {
            println!("FFMPEG path: {}", ffmpeg_path);
            deps.ffmpeg = true;
        }
        Err(e) => {
            println!("FFMPEG error: {}", e);
        }
    }

    match invoke_ytdlp_from_local(handle) {
        Ok(ytdlp_path) => {
            println!("YT-DLP path: {}", ytdlp_path);
            deps.ytdlp = true;
        }
        Err(e) => {
            println!("YT-DLP error: {}", e);
        }
    }

    deps
}

#[tauri::command]
pub(crate) fn download_deps() -> DownloadDepsResponse {
    // Create a custom client with a longer timeout
    let client = Client::builder()
        .timeout(Duration::from_secs(600)) // Set timeout to 600 seconds (10 minutes)
        .build()
        .expect("Failed to build client");

    // FFMPEG URL
    let ffmpeg_url = "https://github.com/yt-dlp/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-gpl.zip"; //<-- I hope this doesn't change...
    let ytdlp_url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";

    // Download FFMPEG
    let ffmpeg_response = client.get(ffmpeg_url)
        .header(USER_AGENT, "reqwest")
        .send()
        .expect("Failed to download FFMPEG");
    let ffmpeg_bytes = ffmpeg_response.bytes().expect("Failed to read FFMPEG bytes");
    let mut ffmpeg_out = File::create("resources/ffmpeg.zip").expect("Failed to create FFMPEG file");
    io::copy(&mut ffmpeg_bytes.as_ref(), &mut ffmpeg_out).expect("Failed to write FFMPEG bytes");

    extract(Cursor::new(ffmpeg_bytes), "resources/ffmpeg".as_ref(), false).expect("Failed to extract FFMPEG");

    let extracted_path = fs::read_dir("resources/ffmpeg")
        .expect("Failed to read extracted directory")
        .filter_map(|entry| {
            let entry = entry.expect("Failed to read directory entry");
            let path = entry.path();
            if path.is_dir() {
                Some(path)
            } else {
                None
            }
        })
        .next()
        .expect("Failed to find extracted directory");

    let target_path = Path::new("resources/ffmpeg");

    // Move all files from extracted_path to target_path
    for entry in fs::read_dir(extracted_path).expect("Failed to read extracted directory") {
        let entry = entry.expect("Failed to read entry");
        let dest = target_path.join(entry.file_name());
        fs::rename(entry.path(), dest).expect("Failed to move file");
    }

    // Download YT-DLP
    let ytdlp_response = client.get(ytdlp_url)
        .header(USER_AGENT, "reqwest")
        .header("Accept", "application/octet-stream")
        .send()
        .expect("Failed to download YT-DLP");
    let ytdlp_bytes = ytdlp_response.bytes().expect("Failed to read YT-DLP bytes");
    // Create dir if it doesn't exist
    fs::create_dir_all("resources/yt-dlp").expect("Failed to create YT-DLP directory");
    let mut ytdlp_out = File::create("resources/yt-dlp/yt-dlp.exe").expect("Failed to create YT-DLP file");
    io::copy(&mut ytdlp_bytes.as_ref(), &mut ytdlp_out).expect("Failed to write YT-DLP bytes");

    // Cleanup
    fs::remove_file("resources/ffmpeg.zip").expect("Failed to remove FFMPEG zip file");

    let ffmpeg_extracted_dir = find_extracted_ffmpeg_dir("resources/ffmpeg");
    if let Some(ffmpeg_extracted_dir) = ffmpeg_extracted_dir {
        fs::remove_dir_all(ffmpeg_extracted_dir).expect("Failed to remove extracted FFMPEG directory");
    }

    DownloadDepsResponse {
        ffmpeg: Deps {
            success: true,
            message: "FFMPEG downloaded successfully".to_string(),
        },
        ytdlp: Deps {
            success: true,
            message: "YT-DLP downloaded successfully".to_string(),
        },
    }
}

fn find_extracted_ffmpeg_dir(base_path: &str) -> Option<PathBuf> {
    for entry in fs::read_dir(base_path).expect("Failed to read base directory") {
        let entry = entry.expect("Failed to read directory entry");
        let path = entry.path();
        if path.is_dir() && path.file_name().unwrap().to_string_lossy().starts_with("ffmpeg-") {
            return Some(path);
        }
    }
    None
}