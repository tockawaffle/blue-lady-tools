use std::sync::{Arc, Mutex};

use once_cell::sync::Lazy;

use crate::watchalong;

static GLOBAL_TIMER: Lazy<Arc<Mutex<Option<watchalong::timer::Timer>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

#[tauri::command]
pub(crate) fn read_file(path: String) -> Result<(String, String, String), String> {
    let file_content = watchalong::read_file::read_file(&path).expect("Error reading watchalong");
    Ok((file_content.episode, file_content.time, path.clone()))
}

#[tauri::command]
pub(crate) fn reset_file(path: String) {
    watchalong::reset_file::reset_file(&path).expect("Error resetting watchalong");
}

#[tauri::command]
pub(crate) fn reset_timer(path: String) {
    watchalong::reset_timer::reset_timer(&path).expect("Error resetting watchalong");
}

#[tauri::command]
pub(crate) fn start_timer(path: String, window: tauri::Window) -> Result<(), String> {
    // Initialize the Timer struct
    let timer = watchalong::timer::Timer::new(&path);
    // Store the Timer instance globally
    *GLOBAL_TIMER.lock().unwrap() = Some(timer);
    // Start the timer
    GLOBAL_TIMER.lock().unwrap().as_ref().unwrap().start(window);
    Ok(())
}

#[tauri::command]
pub(crate) fn stop_timer(_path: String) -> Result<(), String> {
    // Stop the timer
    if let Some(timer) = GLOBAL_TIMER.lock().unwrap().take() {
        // Call the stop method on the Timer instance
        timer.stop();
    }
    Ok(())
}

#[tauri::command]
pub(crate) fn add_episode(path: String, window: tauri::Window) {
    watchalong::episodes::add_episode(path, window);
}

#[tauri::command]
pub(crate) fn dec_episode(path: String, window: tauri::Window) {
    watchalong::episodes::dec_episode(path, window);
}