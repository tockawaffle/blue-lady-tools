use std::io::Write;

use tauri::{Emitter, Window};

pub(crate) fn add_episode(path: String, window: Window) {
    let file = crate::watchalong::read_file::read_file(&path).unwrap();
    let episode = file.episode.parse::<i32>().unwrap();
    let time = file.time;
    let new_episode = episode + 1;
    let new_time = format!(
        "Episodio: {}\nTempo: {}",
        new_episode, time
    );

    let mut file = std::fs::OpenOptions::new().write(true).open(path).unwrap();
    file.write_all(new_time.as_bytes()).unwrap();
    // Close the watchalong
    drop(file);

    // Emit the new episode
    window
        .emit("episode_update", Some(new_episode.to_string()))
        .unwrap();
}

pub(crate) fn dec_episode(path: String, window: Window) {
    let file = crate::watchalong::read_file::read_file(&path).unwrap();
    let episode = file.episode.parse::<i32>().unwrap();
    let time = file.time;
    let new_episode = episode - 1;
    let new_time = format!(
        "Episodio: {}\nTempo: {}",
        new_episode, time
    );

    let mut file = std::fs::OpenOptions::new().write(true).open(path).unwrap();
    file.write_all(new_time.as_bytes()).unwrap();
    // Close the watchalong
    drop(file);

    // Emit the new episode
    window
        .emit("episode_update", Some(new_episode.to_string()))
        .unwrap();
}
