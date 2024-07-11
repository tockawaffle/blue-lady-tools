// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::sync::{Arc, Mutex};

use once_cell::sync::Lazy;
use tauri::Window;

use crate::ytdl::downloads::get_video_info;
use crate::ytdl::get_deps::{check_and_install, emit_progress, install_chocolatey};

static GLOBAL_TIMER: Lazy<Arc<Mutex<Option<watchalong::timer::Timer>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));
mod watchalong;
mod ytdl;

#[tauri::command]
fn read_file(path: String) -> Result<(String, String, String), String> {
    let file_content = watchalong::read_file::read_file(&path).expect("Error reading watchalong");
    Ok((file_content.episode, file_content.time, path.clone()))
}

#[tauri::command]
fn reset_file(path: String) {
    watchalong::reset_file::reset_file(&path).expect("Error resetting watchalong");
}

#[tauri::command]
fn reset_timer(path: String) {
    watchalong::reset_timer::reset_timer(&path).expect("Error resetting watchalong");
}

#[tauri::command]
fn start_timer(path: String, window: tauri::Window) -> Result<(), String> {
    // Initialize the Timer struct
    let timer = watchalong::timer::Timer::new(&path);
    // Store the Timer instance globally
    *GLOBAL_TIMER.lock().unwrap() = Some(timer);
    // Start the timer
    GLOBAL_TIMER.lock().unwrap().as_ref().unwrap().start(window);
    Ok(())
}

#[tauri::command]
fn stop_timer(_path: String) -> Result<(), String> {
    // Stop the timer
    if let Some(timer) = GLOBAL_TIMER.lock().unwrap().take() {
        // Call the stop method on the Timer instance
        timer.stop();
    }
    Ok(())
}

#[tauri::command]
fn add_episode(path: String, window: tauri::Window) {
    watchalong::episodes::add_episode(path, window);
}

#[tauri::command]
fn dec_episode(path: String, window: tauri::Window) {
    watchalong::episodes::dec_episode(path, window);
}

#[tauri::command]
fn get_dependencies(window: Window) {
    emit_progress(&window, "Checking Chocolatey", 0.0, "2min");

    let choco = Command::new("choco")
        .arg("--version")
        .stderr(std::process::Stdio::piped())
        .output();

    if choco.is_err() && !install_chocolatey(&window) {
        return;
    }

    check_and_install(&window, "ffmpeg", "-version", 33.33, "1min 12s");
    check_and_install(&window, "yt-dlp", "--version", 66.66, "30s");

    // Ensure the final progress reaches 100%
    emit_progress(&window, "All installations completed", 100.0, "0s");
}

#[tauri::command]
fn fetch_video(url: String) -> Result<(String, String, String, String), String> {
    let video_info = get_video_info(&url);
    Ok((video_info.title, video_info.ext, video_info.thumbnail, video_info.uploader))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            reset_file,
            start_timer,
            reset_timer,
            stop_timer,
            add_episode,
            dec_episode,
            get_dependencies,
            fetch_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
