use std::sync::{Arc, Mutex};

use once_cell::sync::Lazy;
use tokio::fs;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

use crate::watchalong;

pub(crate) static GLOBAL_TIMER: Lazy<Arc<Mutex<Option<watchalong::timer::Timer>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

#[tauri::command]
pub(crate) async fn read_file() -> Result<(String, String, String), String> {
    let path_cfg_dir = dirs::config_dir().unwrap().join("Blue Lady's Tools");
    let path_watchalong = path_cfg_dir.join("watchalong");
    fs::create_dir_all(&path_watchalong).await.expect("Error creating config directory");
    let path = path_watchalong.join("watchalong.txt");

    if !path.exists() {
        File::create(&path).await.expect("Error creating watchalong file");
        let default_label = "Episodio: 1\nTempo: 00:00";
        let mut file = fs::OpenOptions::new().write(true).open(&path).await.expect("Error opening watchalong file");
        file.write_all(default_label.as_bytes()).await.expect("Error writing to watchalong file");
    }

    let timer = watchalong::timer::Timer::new(&path.to_str().unwrap());

    *GLOBAL_TIMER.lock().unwrap() = Some(timer);
    let file_content = GLOBAL_TIMER.lock().unwrap().as_ref().unwrap().read_file().map_err(|e| e.to_string())?;

    Ok((file_content.episode, file_content.time, path.clone().to_str().unwrap().parse().unwrap()))
}

#[tauri::command]
pub(crate) fn reset_file() {
    let timer = GLOBAL_TIMER.lock().unwrap();
    timer.as_ref().unwrap().reset_file().expect("Error resetting file");
}

#[tauri::command]
pub(crate) fn reset_timer() {
    let timer = GLOBAL_TIMER.lock().unwrap();
    timer.as_ref().unwrap().reset_timer().expect("Error resetting timer");
}

#[tauri::command]
pub(crate) fn start_timer(window: tauri::Window) -> Result<(), String> {
    GLOBAL_TIMER.lock().unwrap().as_ref().unwrap().start(window);
    Ok(())
}

#[tauri::command]
pub(crate) fn stop_timer() -> Result<(), String> {
    // Stop the timer
    GLOBAL_TIMER.lock().unwrap().as_ref().unwrap().stop();
    Ok(())
}

#[tauri::command]
pub(crate) fn add_episode(window: tauri::Window) {
    let timer = GLOBAL_TIMER.lock().unwrap();
    watchalong::timer::Timer::add_episode(timer.as_ref().unwrap(), window)
}

#[tauri::command]
pub(crate) fn dec_episode(window: tauri::Window) {
    let timer = GLOBAL_TIMER.lock().unwrap();
    watchalong::timer::Timer::dec_episode(timer.as_ref().unwrap(), window)
}