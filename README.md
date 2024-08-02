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
    - You can either install on the default path or choose a custom path.
5.
    - Once installed, you can run the app from the start menu or the desktop shortcut.
6.
    - Open the app and enjoy!

#### Notes:

If using OBS, you can set the watchalong.txt file as a text source to display the watchalong time on your stream. You
can find the watchalong.txt file at "%APPDATA%/Roaming/Blue Lady's Tools/watchalong" OR "C:\Users\<YOUR_USER>\AppData\Roaming\Blue Lady's Tools\watchalong". If the file is not in there, open the "WatchAlong Timer" section on the app for it to create the paths.

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

- The `yt-dlp` and `ffmpeg` executables must be downloaded from the sources. You can use the button at settings to download them.

- The app is only available for Windows x64 systems. Support for other platforms may be added in the future.

- If the app keeps crashing, womp womp. . . JK. Please create an issue at the github page, and if you provide the steps you did it would help A LOT

- The download progress is kinda buggy. It sometimes doesn't show progress. If you encounter this, wait for the
  download to finish. The download will still be successful. You'll know it's done when the green text appears.

- The download sometimes might take some time to complete, I don't know why it's this slow but there's not really much I can do about that.
    I might review the code later to check if something is bottlenecking the download, but for now I'll leave at it is, so expect to wait a hot minute or two for your download to complete.

- It also forces every video+audio (default download option) to be converted to mp4 format. This can cause quality loss. This is going to be an option in the future.

- The default location for downloads is your download folders. You can change this in the app settings.

- There's also a bug that causes the app to not display the correct theme being used, this is a known issue and will be
  fixed in the next release.

- This app does not support downloading: Age restricted videos, Country restricted videos, Removed videos and Playlists (This last one will be added later)
    - - There are methods for downloading the first two, but it requires cookies/proxy and I'm not 100% sure how I would add support for this
  
- The app is still in development. If you encounter any bugs, please open an issue in the GitHub repository.

- This whole README is in english but the project is in portuguese (??? Sorry, I'm weird, I'll add english translation later...)

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

---

## License and Third-Party Licenses

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

This project requires and downloads the following dependencies:

- `yt-dlp` (YouTube-DL fork)
    - Website: [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
    - Source Code: [yt-dlp source](https://github.com/yt-dlp/yt-dlp)

- `ffmpeg`
    - Website: [FFmpeg](https://github.com/yt-dlp/FFmpeg-Builds)
    - Source Code: [FFmpeg source](https://github.com/yt-dlp/FFmpeg-Builds)

They are not bundled with the app anymore.

---
