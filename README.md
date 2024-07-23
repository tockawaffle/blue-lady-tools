# Blue Lady Tools

Blue Lady Tools is a Rust-based tool for downloading YouTube videos with customizable options, such as downloading only
audio, only video, or both, and saving them in unique folders. This tool leverages `yt-dlp` for video downloads and
provides progress updates via the Tauri window.

It also has a timer function that allows you to track your watchalong time for your stream.

---

## Features

- Download YouTube videos as audio (MP3) or video (MP4).
- Support for downloading video with both video and audio streams.
- Ability to create unique folders for each downloaded video.
- Option to download video thumbnails.
- Option to write URL links.
- Progress updates are emitted to the Tauri window.

---

## Installing

To install Blue Lady Tools, follow these steps:

1.
    - Download the latest release from the [Releases](https://github.com/tockawaffle/blue-lady-tools/releases) page.
2.
    - There'll be only one version: for windows x64. Download it.
3.
    - Use the .msi to install the app.
4.
    - You can either install on the default path or choose a custom path (recommended).
5.
    - Once installed, you can run the app from the start menu or the desktop shortcut.
6.
    - Open the app and enjoy!

#### Notes:

If you choose to install on the default path, be sure to open the app as an administrator since it requires access
to the Program Files directory for the resources folder.

If using OBS, you can set the watchalong.txt file as a text source to display the watchalong time on your stream. You
can find the watchalong.txt file in the resources folder of the app located in the Program Files directory (default
path) or the custom path you chose during installation.

---

## Building from Source

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Rust and Cargo: [Install Rust](https://www.rust-lang.org/tools/install)
- Tauri: [Install Tauri](https://tauri.app/v1/guides/getting-started/prerequisites)
- Node.js: [Install Node.js](https://nodejs.org/en/download/)
- `yt-dlp`: [Install yt-dlp](https://github.com/yt-dlp/yt-dlp#installation)
- `ffmpeg`: [Install ffmpeg](https://ffmpeg.org/download.html)

---

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/blue-lady-tools.git
    cd blue-lady-tools
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Ensure `yt-dlp` and `ffmpeg` are set on the [/src-tauri/resources](/src-tauri/resources) directory.


4. Run the development server:
    ```sh
    npm run tauri dev
    ```

## Usage

### Command Invokers

The project includes several command invokers for downloading videos, getting video info, and more.

— `download_video`: Download a video from YouTube based on the provided options.
— `get_video_info`: Retrieve information about a YouTube video.

### Example

Here is an example of how to use the `download_video` function:

```rust
use tauri::Window;

fn main() {
    let window: Window; // Initialize your Tauri window

    let result = download_video(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        Some("video"),
        "downloads".to_string(),
        true,
        true,
        true,
        "path/to/yt-dlp",
        "path/to/ffmpeg",
        &window,
    );

    match result {
        Ok(_) => println!("Download successful!"),
        Err(e) => eprintln!("Error: {}", e),
    }
}
```

## Functions

### `download_video`

Downloads a video from YouTube with the specified options.

#### Parameters

- `url`: The URL of the YouTube video.
- `format`: The format to download (`audio`, `video`, or `videoandaudio`).
- `path`: The download path.
- `unique_folders`: Whether to create unique folders for each video.
- `download_thumbnail`: Whether to download the video thumbnail.
- `write_url_link`: Whether to write the URL link.
- `ytdlp_path`: Path to the `yt-dlp` executable.
- `ffmpeg_path`: Path to the `ffmpeg` executable.
- `window`: The Tauri window to emit progress updates to.

#### Returns

- `Result<bool, Box<dyn Error>>`: The result of the download operation.

### `get_video_info`

Retrieves information about a YouTube video.

#### Parameters

- `url`: The URL of the YouTube video.
- `ytdlp_path`: Path to the `yt-dlp` executable.
- `ffmpeg_path`: Path to the `ffmpeg` executable.

#### Returns

- `Result<VideoInfo, Box<dyn Error>>`: The video information.

---

## Considerations and Limitations

- The `yt-dlp` and `ffmpeg` executables must be present in the `/src-tauri/resources` directory.

- If installed on the default path, the app must be run as an administrator to access the Program Files directory.

- The app is only available for Windows x64 systems. Support for other platforms may be added in the future.


- If the app keeps crashing, check your Program Files directory for the resources folder. In there, you should find the
  yt-dlp and ffmpeg executables. If they are not there, you can download them from the official websites and place them
  there.

- If you have everything in the resources folder, run the app as administrator. This is because the app needs access to
  the Program Files directory to access the resources' folder. Might fix this later on.


- The download progress is kinda buggy. It sometimes doesn't show progress. If you encounter this, wait for the
  download to finish. The download will still be successful. You'll know it's done when the progress bar disappears.


- The default location for downloads is your download folders. You can change this in the app settings.

- Also, the buttons for checking and reinstalling dependencies are not functional yet. You can check the resources
  folder in the Program Files directory to see if the dependencies are there.

- There's also a bug that causes the app to not display the correct theme being used, this is a known issue and will be
  fixed in the next release.
- The app is still in development. If you encounter any bugs, please open an issue in the GitHub repository.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

---

## License and Third-Party Licenses

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

This project includes binaries of third-party tools which are stored in the `/resources` folder. These tools are:

- `yt-dlp` (YouTube-DL fork)
    - Website: [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
    - Source Code: [yt-dlp source](https://github.com/yt-dlp/yt-dlp)

- `ffmpeg`
    - Website: [FFmpeg](https://ffmpeg.org)
    - Source Code: [FFmpeg source](https://ffmpeg.org/download.html)

---