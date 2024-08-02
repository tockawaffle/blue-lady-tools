use std::{fs, thread};
use std::io::Write;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use tauri::{Emitter, Window};

/// Struct representing a Timer.
pub(crate) struct Timer {
    path: String,
    stop_flag: Arc<Mutex<bool>>,
    is_running: Arc<Mutex<bool>>,
}

impl Timer {
    /// Creates a new Timer instance.
    ///
    /// # Arguments
    ///
    /// * `path` - A string slice that holds the path to the watchalong file.
    ///
    /// # Returns
    ///
    /// A new instance of `Timer`.
    pub(crate) fn new(path: &str) -> Self {
        Timer {
            path: path.to_string(),
            stop_flag: Arc::new(Mutex::new(false)),
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    /// Starts the timer.
    ///
    /// # Arguments
    ///
    /// * `window` - A `Window` instance to emit events to the frontend.
    pub(crate) fn start(&self, window: Window) {
        let mut is_running = self.is_running.lock().unwrap();
        if *is_running {
            return; // If already running, do nothing
        }

        // Mark as running
        *is_running = true;
        drop(is_running); // Release the lock

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

    /// Reads the watchalong file and extracts the episode and time.
    ///
    /// # Returns
    ///
    /// A `Result` containing `FileContent` on success or an error on failure.
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

    /// Increments the episode number in the watchalong file and emits an event.
    ///
    /// # Arguments
    ///
    /// * `window` - A `Window` instance to emit events to the frontend.
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

    /// Decrements the episode number in the watchalong file and emits an event.
    ///
    /// # Arguments
    ///
    /// * `window` - A `Window` instance to emit events to the frontend.
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

    /// Resets the watchalong file to the default content.
    ///
    /// # Returns
    ///
    /// A `Result` indicating success or failure.
    pub(crate) fn reset_file(&self) -> Result<(), std::io::Error> {
        // Create the watchalong if it doesn't exist
        fs::File::create(&self.path).unwrap();
        // Set the default content of the watchalong
        let default_label = "Episodio: 1\nTempo: 00:00";
        let mut file = fs::OpenOptions::new().write(true).open(&self.path).unwrap();
        file.write_all(default_label.as_bytes()).unwrap();
        Ok(())
    }

    /// Resets the timer in the watchalong file to 00:00.
    ///
    /// # Returns
    ///
    /// A `Result` indicating success or failure.
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

    /// Stops the timer.
    pub(crate) fn stop(&self) {
        *self.stop_flag.lock().unwrap() = true;
    }
}

/// Writes content to the watchalong file.
///
/// # Arguments
///
/// * `path` - The path to the watchalong file.
/// * `content` - The content to write to the file.
///
/// # Returns
///
/// A `Result` indicating success or failure.
fn write_file(path: &str, content: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Write content to the watchalong
    fs::write(path, content)?;
    Ok(())
}

/// Parses a time string into minutes and seconds.
///
/// # Arguments
///
/// * `time` - A string slice representing the time in "MM:SS" format.
///
/// # Returns
///
/// A tuple containing minutes and seconds as `u32`.
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

/// Struct representing the content of the watchalong file.
pub(crate) struct FileContent {
    pub(crate) episode: String,
    pub(crate) time: String,
}