import type {Event} from "@tauri-apps/api/event";

class TauriYtdlpApi {
    private static async command<T>(command: string, args: any): Promise<T> {
        const { invoke } = await import('@tauri-apps/api/core');
        return invoke(command, args);
    }
    
    static async GetDependencies() {
        console.log("Verifying dependencies")
        return this.command("get_dependencies", {});
    }
    
    static async GetVideoInfo(url: string) {
        
        console.log("Getting video info")
        return this.command("fetch_video", {url});
    }
    
    
    // fn download_video(url: String, format: Option<String>, path: String, unique_folders: bool, download_thumbnail: bool, write_url_link: bool) -> Result<bool, Box<dyn Error>> {
    static async DownloadVideo(
        {
            url,
            path,
            uniqueFolders,
            downloadThumbnail,
            writeUrlLink,
            format,
        }: {
            url: string,
            path: string,
            uniqueFolders: boolean,
            downloadThumbnail: boolean,
            writeUrlLink: boolean,
            format?: string,
        }
    ) {
        
        console.log("Downloading video")
        return this.command("download_video_command", {url, format, path, uniqueFolders, downloadThumbnail, writeUrlLink});
    }
    
    static async GetDefaultPath() {
        
        console.log("Getting default path")
        return this.command("get_default_download_path", {});
        
    }
    
    static async VerifyDependencies() {
        
        console.log("Verifying dependencies")
        return this.command("verify_deps", {});
    }
    
    static async DownloadDependencies() {
        
        console.log("Downloading dependencies")
        return this.command("download_deps", {});
    }
    
    static async GetFfmpegPath() {
        
        console.log("Getting default path")
        return this.command("invoke_ffmpeg_from_local", {});
    }
}

class YtdlpEventListener {
    private unlisten: (() => void) | null = null;
    
    constructor(public event: "ytdlp_deps_progress" | "download_progress" | "download_complete" | "download_error", public callback: (event: Event<unknown>) => void) {
    }
    
    async listen() {
        
        const {listen} = await import("@tauri-apps/api/event")
        
        this.unlisten = await listen(this.event as string, (event) => {
            this.callback(event)
        })
    }
    
    async stop() {
        if (this.unlisten) {
            this.unlisten()
            this.unlisten = null
        } else {
            console.error("No listener to stop")
        }
    }
}

export default class YtdlpApi {
    public static TauriYtdlpApi = TauriYtdlpApi;
    public static YtdlpEventListener = YtdlpEventListener;
}