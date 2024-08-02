use std::{fs, thread};
use std::io::Write;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use tauri::{Emitter, Window};

pub(crate) struct Timer {
    path: String,
    stop_flag: Arc<Mutex<bool>>,
    is_running: Arc<Mutex<bool>>,
}

impl Timer {
    pub(crate) fn new(path: &str) -> Self {
        Timer {
            path: path.to_string(),
            stop_flag: Arc::new(Mutex::new(false)),
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    pub(crate) fn start(&self, window: Window) {
        if *self.is_running.lock().unwrap() {
            return; // If already running, do nothing
        }

        // Mark as running
        *self.is_running.lock().unwrap() = true;

        let path = self.path.clone();
        let stop_flag = self.stop_flag.clone();
        let file_content = self.read_file().expect("Error reading watchalong");

        thread::spawn(move || {
            // Read the watchalong and extract episode and time
            let (mut minutes, mut seconds) = parse_time(&file_content.time);

            // Loop until the stop flag is set
            loop {
                // Check if the stop flag is set
                if *stop_flag.lock().unwrap() {
                    break; // Exit the loop if the stop flag is set
                }

                // Sleep for 1 second
                thread::sleep(Duration::from_secs(1));

                // Update minutes and seconds
                seconds += 1;
                if seconds == 60 {
                    minutes += 1;
                    seconds = 0;
                }

                // Format the new time
                let new_time = format!("{:02}:{:02}", minutes, seconds);

                // Write the updated time to the watchalong
                let new_content =
                    format!("Episodio: {}\nTempo: {}", file_content.episode, new_time);
                write_file(&path, &new_content).expect("Error writing watchalong");

                window.emit("time_update", Some(new_time.clone())).unwrap();
            }
        });
    }

    pub(crate) fn read_file(&self) -> Result<FileContent, Box<dyn std::error::Error>> {
        let path = self.path.clone();

        let content = fs::read_to_string(&path)?;
        let mut lines = content.lines();
        let episode_line = lines.next().expect("File is empty");
        let time_line = lines.next().expect("Missing time line");
        let episode = episode_line
            .split_whitespace()
            .nth(1)
            .expect("Invalid episode line");
        let time = time_line
            .split_whitespace()
            .nth(1)
            .expect("Invalid time line");

        Ok(FileContent {
            episode: episode.to_string(),
            time: time.to_string(),
        })
    }

    pub(crate) fn add_episode(&self, window: Window) {
        let file = self.read_file().expect("Error reading watchalong");
        let episode = file.episode.parse::<i32>().unwrap();
        let time = file.time;
        let new_episode = episode + 1;
        let new_time = format!(
            "Episodio: {}\nTempo: {}",
            new_episode, time
        );

        let mut file = std::fs::OpenOptions::new().write(true).open(&self.path).unwrap();
        file.write_all(new_time.as_bytes()).unwrap();
        // Close the watchalong
        drop(file);

        // Emit the new episode
        window
            .emit("episode_update", Some(new_episode.to_string()))
            .unwrap();
    }

    pub(crate) fn dec_episode(&self, window: Window) {
        let file = self.read_file().expect("Error reading watchalong");
        let path = self.path.clone();
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

    pub(crate) fn reset_file(&self) -> Result<(), std::io::Error> {
        // Create the watchalong if it doesn't exist
        fs::File::create(&self.path).unwrap();
        // Set the default content of the watchalong
        let default_label = "Episodio: 1\nTempo: 00:00";
        let mut file = fs::OpenOptions::new().write(true).open(&self.path).unwrap();
        file.write_all(default_label.as_bytes()).unwrap();
        Ok(())
    }

    pub(crate) fn reset_timer(&self) -> Result<(), std::io::Error> {
        // Get episode from the watchalong
        let file = &self.read_file().expect("Error reading watchalong");
        let episode = file.episode.parse::<i32>().unwrap();

        // Set the default content of the watchalong
        let default_label = format!("Episodio: {}\nTempo: 00:00", episode);
        let mut file = std::fs::OpenOptions::new().write(true).open(&self.path).unwrap();
        file.write_all(&default_label.as_bytes()).unwrap();
        Ok(())
    }

    pub(crate) fn stop(&self) {
        *self.stop_flag.lock().unwrap() = true;
    }
}

fn write_file(path: &str, content: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Write content to the watchalong
    fs::write(path, content)?;
    Ok(())
}

pub(crate) fn parse_time(time: &str) -> (u32, u32) {
    // Parse the time string into minutes and seconds
    let mut parts = time.split(":");
    let minutes = parts
        .next()
        .expect("Invalid time format")
        .parse()
        .expect("Invalid minutes");
    let seconds = parts
        .next()
        .expect("Invalid time format")
        .parse()
        .expect("Invalid seconds");
    (minutes, seconds)
}

pub(crate) struct FileContent {
    pub(crate) episode: String,
    pub(crate) time: String,
}
