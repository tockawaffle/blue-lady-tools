import type {Event} from "@tauri-apps/api/event";

class TauriYtdlpApi {
    static async GetDependencies() {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Verifying dependencies")
        return invoke("get_dependencies");
    }
    
    static async GetVideoInfo(url: string) {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Getting video info")
        return invoke("fetch_video", {url});
    }
}

class YtdlpEventListener {
    private unlisten: (() => void) | null = null;
    
    constructor(public event: "ytdlp_deps_progress", public callback: (event: Event<unknown>) => void) {
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