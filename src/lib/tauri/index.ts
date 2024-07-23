import TimerApi from "./Timer/";
import YtdlpApi from "./Ytdlp/"

class TauriApi {
    public static Timer = TimerApi;
    public static Ytdlp = YtdlpApi;
    
    public static async ResizeWindow(width: number, height: number) {
        const {invoke} = await import("@tauri-apps/api")
        return invoke("resize_window", {width, height});
    }
}

export {
    TauriApi
}