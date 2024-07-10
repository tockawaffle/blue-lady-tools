use std::fs;
use std::io::{Read, Write};
use crate::watchalong::timer::FileContent;

pub(crate) fn read_file(path: &str) ->Result<FileContent, Box<dyn std::error::Error>>{
     std::fs::File::open(path).unwrap_or_else(|_| {
        // Let's do a simple verify to check if it's a path like: "resources/test.txt"
        if path.contains("/") {
            // Create the directory if it doesn't exist
            std::fs::create_dir_all(path.split("/").next().unwrap()).unwrap();
        }
        
        // Create the watchalong if it doesn't exist
        std::fs::File::create(path).unwrap();
        // Set the default content of the watchalong
        let default_label = "Episodio: 1\nTempo: 00:00";
        let mut file = std::fs::OpenOptions::new().write(true).open(path).unwrap();
        file.write_all(default_label.as_bytes()).unwrap();

        // Open the watchalong again
        std::fs::File::open(path).unwrap()
    });

    let content = fs::read_to_string(path)?;
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
    
    Ok(crate::watchalong::timer::FileContent {
        episode: episode.to_string(),
        time: time.to_string(),
    })
}

// Test
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_file() {
        let path = "test.txt";
        let result = read_file(path).unwrap();
        assert_eq!(result.episode, "1");
        let (mut minutes, seconds) = crate::watchalong::timer::parse_time(&result.time);
        assert_eq!(minutes, 0);
        assert_eq!(seconds, 0);
        
    }
}