// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use once_cell::sync::Lazy;
use std::sync::{Arc, Mutex};

static GLOBAL_TIMER: Lazy<Arc<Mutex<Option<file::timer::Timer>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));
mod file;

#[tauri::command]
fn read_file(path: String) -> Result<(String, String, String), String> {
    let file_content = file::read_file::read_file(&path).expect("Error reading file");
    Ok((file_content.episode, file_content.time, path.clone()))
}

#[tauri::command]
fn reset_file(path: String) {
    file::reset_file::reset_file(&path).expect("Error resetting file");
}

#[tauri::command]
fn start_timer(path: String, window: tauri::Window) -> Result<(), String> {
    // Initialize the Timer struct
    let timer = file::timer::Timer::new(&path);
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
    file::episodes::add_episode(path, window);
}

#[tauri::command]
fn dec_episode(path: String, window: tauri::Window) {
    file::episodes::dec_episode(path, window);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            reset_file,
            start_timer,
            stop_timer,
            add_episode,
            dec_episode
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}