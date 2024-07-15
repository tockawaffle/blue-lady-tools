use std::process::Command;
use std::sync::{Arc, Mutex};

use tauri::{State, Window};
use tauri::async_runtime::spawn;

use crate::ytdl::downloads::{download_video, get_video_info};
use crate::ytdl::get_deps::{check_and_install, emit_error, emit_progress, install_chocolatey};

#[derive(Default)]
pub(crate) struct AppState {
    download_in_progress: Arc<Mutex<bool>>,
}
#[tauri::command]
pub(crate) fn get_dependencies(window: Window) {
    let window_clone = window.clone();

    spawn(async move {
        emit_progress(&window_clone, "Checking Chocolatey", 0.0, "2min");

        let choco = Command::new("choco")
            .arg("--version")
            .stderr(std::process::Stdio::piped())
            .output();

        match choco {
            Ok(output) => {
                if !output.status.success() {
                    match install_chocolatey(&window_clone) {
                        Ok(_) => {}
                        Err(e) => {
                            emit_error(&window_clone, "Chocolatey installation", &e.to_string());
                            emit_progress(&window_clone, "Exiting...", 100.0, "0s");
                        }
                    }
                }
            }
            Err(e) => {
                emit_error(&window_clone, "Chocolatey check", &e.to_string());
                match install_chocolatey(&window_clone) {
                    Ok(_) => {}
                    Err(e) => {
                        emit_error(&window_clone, "Chocolatey installation", &e.to_string());
                        emit_progress(&window_clone, "Exiting...", 100.0, "0s");
                    }
                }
            }
        }

        let install_ffmpeg = check_and_install(&window_clone, "ffmpeg", "-version", 33.33, "1min 12s");
        match install_ffmpeg {
            Ok(_) => emit_progress(&window_clone, "FFmpeg installed", 33.33, "1min 12s"),
            Err(e) => {
                emit_error(&window_clone, "FFmpeg installation", &e.to_string());
                emit_progress(&window_clone, "FFmpeg installation failed", 33.33, "1min 12s");
                emit_progress(&window_clone, "Exiting...", 100.0, "0s");
                return;
            }
        }

        let install_ytdlp = check_and_install(&window_clone, "yt-dlp", "--version", 66.66, "30s");
        match install_ytdlp {
            Ok(_) => emit_progress(&window_clone, "yt-dlp installed", 66.66, "30s"),
            Err(e) => {
                emit_error(&window_clone, "yt-dlp installation", &e.to_string());
                emit_progress(&window_clone, "yt-dlp installation failed", 66.66, "30s");
                emit_progress(&window_clone, "Exiting...", 100.0, "0s");
                return;
            }
        }

        // Ensure the final progress reaches 100%
        emit_progress(&window_clone, "All installations completed", 100.0, "0s");
    });
}


#[tauri::command]
pub(crate) fn fetch_video(url: String) -> Result<(String, String, String, String), String> {
    let video_info = get_video_info(&url);
    match video_info {
        Ok(video_info) => Ok((
            video_info.title,
            video_info.ext,
            video_info.thumbnail,
            video_info.uploader,
        )),
        Err(e) => {
            Err(*Box::from(e.to_string()))
        }
    }
}

#[tauri::command]
pub(crate) async fn download_video_command(
    url: String,
    format: Option<String>,
    path: String,
    unique_folders: bool,
    download_thumbnail: bool,
    write_url_link: bool,
    state: State<'_, AppState>, // Ensure the same AppState is used
    window: tauri::Window,
) -> Result<bool, String> {
    let download_in_progress = Arc::clone(&state.download_in_progress);

    {
        let mut in_progress = download_in_progress.lock().unwrap();
        if *in_progress {
            return Err("Another download is already in progress".to_string());
        }
        *in_progress = true;
    }

    let window_clone = window.clone();
    let download_in_progress_clone = Arc::clone(&download_in_progress);

    spawn(async move {
        let result = download_video(&url, format.as_deref(), path, unique_folders, download_thumbnail, write_url_link);
        match result {
            Ok(_) => window_clone.emit("download_complete", true).unwrap(),
            Err(e) => window_clone.emit("download_error", e.to_string()).unwrap(),
        }

        let mut in_progress = download_in_progress_clone.lock().unwrap();
        *in_progress = false;
    });

    Ok(true)
}

#[tauri::command]
pub(crate) fn resize_window(width: f64, height: f64, window: Window) {
    window.set_size(
        tauri::LogicalSize {
            width,
            height,
        }
    ).expect("Failed to resize window");
}

#[tauri::command]
pub(crate) fn get_default_download_path() -> String {
    dirs::download_dir().unwrap().to_str().unwrap().to_string()
}
