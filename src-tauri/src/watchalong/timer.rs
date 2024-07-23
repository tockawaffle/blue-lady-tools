use std::{fs, thread};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use tauri::Window;

use crate::watchalong::read_file::read_file;

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

        thread::spawn(move || {
            // Read the watchalong and extract episode and time
            let file_content = read_file(&path).expect("Error reading watchalong");
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
