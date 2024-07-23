// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::watchalong::commands::{add_episode, dec_episode, read_file, reset_file, reset_timer, start_timer, stop_timer};
use crate::ytdl::commands::{download_video_command, fetch_video, get_default_download_path, resize_window};
use crate::ytdl::commands::AppState;
use crate::ytdl::deps::{download_deps, verify_deps};

#[macro_use]
mod watchalong;

#[macro_use]
mod ytdl;

fn main() {
    tauri::Builder::default()
        .manage(AppState::default()) // Manage the AppState here
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
            verify_deps
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}