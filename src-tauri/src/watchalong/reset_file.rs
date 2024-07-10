use std::io::Write;

pub(crate) fn reset_file(path: &str) -> Result<(), std::io::Error> {
    // Create the watchalong if it doesn't exist
    std::fs::File::create(path).unwrap();
    println!("File created: {}", path);
    // Set the default content of the watchalong
    let default_label = "Episodio: 1\nTempo: 00:00";
    let mut file = std::fs::OpenOptions::new().write(true).open(path).unwrap();
    file.write_all(default_label.as_bytes()).unwrap();
    Ok(())
}