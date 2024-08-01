import TimerApi from "./Timer/";
import YtdlpApi from "./Ytdlp/"

class TauriApi {
    public static Timer = TimerApi;
    public static Ytdlp = YtdlpApi;
    
    private static async command<T>(command: string, args: any): Promise<T> {
        const {invoke} = await import('@tauri-apps/api/core');
        return invoke(command, args);
    }
    
}

export {
    TauriApi
}