use std::process::Command;
use serde::{Deserialize, Serialize};
use tauri::Window;

#[derive(Serialize, Deserialize, Clone)]
struct Progress {
    step: String,
    percentage: f64,
    eta: String,
    error: Option<ProgressError>,
}

#[derive(Serialize, Deserialize, Clone)]
struct ProgressError {
    step: String,
    error: String,
}

pub fn emit_progress(window: &Window, step: &str, percentage: f64, eta: &str) {
    let progress = Progress {
        step: step.to_string(),
        percentage,
        eta: eta.to_string(),
        error: None,
    };
    window.emit("ytdlp_deps_progress", progress).unwrap();
}

pub fn emit_error(window: &Window, step: &str, error_message: &str) {
    let error = ProgressError {
        step: step.to_string(),
        error: error_message.to_string(),
    };
    let progress = Progress {
        step: step.to_string(),
        percentage: 0.0,
        eta: "0s".to_string(),
        error: Some(error),
    };
    window.emit("ytdlp_deps_progress", progress).unwrap();
}

pub fn install_chocolatey(window: &Window) -> bool {
    emit_progress(window, "Installing Chocolatey", 0.0, "2min");

    let status = Command::new("powershell")
        .arg("-Command")
        .arg("Start-Process powershell -Verb RunAs -ArgumentList \"-Command Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))\"")
        .status();

    match status {
        Ok(_) => {
            // Sleep for a minute to allow the installation to complete
            std::thread::sleep(std::time::Duration::from_secs(60));

            // Check if Chocolatey was installed successfully
            let choco = Command::new("choco")
                .arg("--version")
                .stderr(std::process::Stdio::piped())
                .output();

            match choco {
                Ok(_) => {
                    emit_progress(window, "Chocolatey installed", 33.33, "1min 12s");
                    true
                }
                Err(_) => {
                    emit_error(window, "Chocolatey installation", "Failed to install Chocolatey");
                    false
                }
            }
        }
        Err(_) => {
            emit_error(window, "Chocolatey installation", "Failed to execute installation process");
            false
        }
    }
}

pub fn install_package(window: &Window, package: &str, percentage: f64, eta: &str) {
    emit_progress(window, &format!("Installing {}", package), percentage, eta);

    let status = Command::new("powershell")
        .arg("-Command")
        .arg(format!("Start-Process powershell -Verb RunAs -ArgumentList \"-Command choco install {} -y\"", package))
        .status();

    match status {
        Ok(_) => {
            // Sleep for a minute to allow the installation to complete
            std::thread::sleep(std::time::Duration::from_secs(60));
            emit_progress(window, &format!("{} installed", package), percentage + 33.33, "30s");
        }
        Err(_) => {
            emit_error(window, &format!("{} installation", package), "Failed to execute installation process");
        }
    }
}

pub(crate) fn check_and_install(window: &Window, package: &str, check_arg: &str, percentage: f64, eta: &str) {
    let output = Command::new(package)
        .arg(check_arg)
        .stderr(std::process::Stdio::piped())
        .output();

    match output {
        Ok(_) => {
            emit_progress(window, &format!("{} is already installed", package), percentage, eta);
        }
        Err(_) => {
            install_package(window, package, percentage, eta);
        }
    }
}