use std::io::Write;

pub(crate) fn reset_timer(path: &str) -> Result<(), std::io::Error> {
    // Get episode from the watchalong
    let file = crate::watchalong::read_file::read_file(path).unwrap();
    let episode = file.episode.parse::<i32>().unwrap();
    println!("Episode: {}", episode);
    // Set the default content of the watchalong
    let default_label = format!("Episodio: {}\nTempo: 00:00", episode);
    let mut file = std::fs::OpenOptions::new().write(true).open(path).unwrap();
    file.write_all(&default_label.as_bytes()).unwrap();
    Ok(())
}