use rusty_ytdl::{Video, VideoOptions, VideoQuality, VideoSearchOptions};

async fn download(url: String) {
    use std::process::{Command, Stdio};

    // PowerShell script to install Chocolatey
    let powershell_script = r#"
        # Chocolatey installation script
        Set-ExecutionPolicy Bypass -Scope Process -Force;
        iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'));
    "#;

    // Command to execute PowerShell with admin privileges
    let output = Command::new("powershell")
        .arg("-Command")
        .arg(powershell_script)
        .stdout(Stdio::inherit()) // Redirect stdout/stderr to parent process
        .stderr(Stdio::inherit())
        .arg("-Verb")
        .arg("runas") // Request admin privileges
        .output()
        .expect("Failed to execute PowerShell command");

    if output.status.success() {
        println!("Chocolatey installed successfully!");
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        eprintln!("Failed to install Chocolatey: {}", stderr);
    }
}

// test
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_download() {
        download("https://youtube.com/clip/UgkxijjA3elP_XNP3rQAv_iaXcu_DDRZ1ObP".to_string()).await;
    }
}
