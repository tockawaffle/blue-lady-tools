// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use crate::watchalong::commands::{
    add_episode, dec_episode, read_file, reset_file, reset_timer, start_timer, stop_timer,
};
use crate::watchalong::timer::Timer;
use crate::ytdl::commands::AppState;
use crate::ytdl::commands::{
    download_video_command, fetch_video, get_default_download_path, resize_window,
};
use crate::ytdl::deps::{download_deps, verify_deps};

#[macro_use]
mod watchalong;

#[macro_use]
mod ytdl;

fn get_global_config_path(app_name: &str) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let mut config_path = dirs::config_dir().expect("Failed to get config directory");
    config_path.push(app_name);
    fs::create_dir_all(&config_path)?; // Ensure the directory exists
    Ok(config_path)
}

#[tauri::command]
fn invoke_main_window(app: AppHandle) {
    let splash_window = app.get_webview_window("splashscreen").unwrap();
    let main_window = app.get_webview_window("main").unwrap();
    splash_window.close().unwrap();
    main_window.show().unwrap();
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            read_file,
            reset_file,
            start_timer,
            reset_timer,
            stop_timer,
            add_episode,
            dec_episode,
            download_video_command,
            fetch_video,
            resize_window,
            get_default_download_path,
            download_deps,
            verify_deps,
            invoke_main_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
