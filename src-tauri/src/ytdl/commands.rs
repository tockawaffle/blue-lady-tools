use std::sync::{Arc, Mutex};

use tauri::{AppHandle, State, Window};
use tauri::async_runtime::spawn;

use crate::ytdl::deps::{invoke_ffmpeg_from_local, invoke_ytdlp_from_local};
use crate::ytdl::downloads::{download_video, get_video_info};

#[derive(Default)]
pub(crate) struct AppState {
    download_in_progress: Arc<Mutex<bool>>,
}


#[tauri::command]
pub(crate) fn fetch_video(url: String, handle: AppHandle) -> Result<(String, String, String, String), String> {
    let ffmpeg_path = match invoke_ffmpeg_from_local(handle.clone()) {
        Ok(path) => path,
        Err(e) => {
            return Err(e);
        }
    };

    let ytdlp_path = match invoke_ytdlp_from_local(handle) {
        Ok(path) => path,
        Err(e) => {
            return Err(e);
        }
    };


    let video_info = get_video_info(&url, &ytdlp_path, &ffmpeg_path);

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
    window: Window,
    handle: AppHandle,
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

    // Get the path to the ffmpeg executable
    let ffmpeg_path = match invoke_ffmpeg_from_local(handle.clone()) {
        Ok(path) => path,
        Err(e) => {
            let mut in_progress = download_in_progress.lock().unwrap();
            *in_progress = false;
            return Err(e);
        }
    };

    let ytdlp_path = match invoke_ytdlp_from_local(handle) {
        Ok(path) => path,
        Err(e) => {
            let mut in_progress = download_in_progress.lock().unwrap();
            *in_progress = false;
            return Err(e);
        }
    };

    spawn(async move {
        let result = download_video(&url, format.as_deref(), path, unique_folders, download_thumbnail, write_url_link, &ytdlp_path, &ffmpeg_path, &window_clone);
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
