import type {Event} from "@tauri-apps/api/event";

class TauriTimerApi {
    private static async command<T>(command: string, args: any): Promise<T> {
        const { invoke } = await import('@tauri-apps/api/core');
        return invoke(command, args);
    }
    
    static async TauriReadFile(path: string): Promise<string[]> {
 
        console.log("Reading file")
        return this.command("read_file", {path});
    }
    
    static async TauriStartTimer(path: string) {
 
        console.log("Starting timer")
        return this.command("start_timer", {path});
    }
    
    static async TauriStopTimer(path: string) {
 
        console.log("Stopping timer")
        return this.command("stop_timer", {path});
    }
    
    static async TauriAddEpisode(path: string) {
 
        console.log("Adding episode")
        return this.command("add_episode", {path});
    }
    
    static async TauriDecEpisode(path: string) {
 
        console.log("Removing episode")
        return this.command("dec_episode", {path});
    }
    
    // This is bugged as fuck lol, will revisit it later, for now we'll have to continue using the reset file function for the reset
    // Why is this marked as "bugged"? I don't see the bug, old me and I know you weren't high when you made this.
    static async TauriResetTimer(path: string) {
 
        console.log("Resetting timer")
        // This here should be "reset_timer"
        return this.command("reset_timer", {path});
    }
    
    static async TauriResetFile(path: string) {
 
        console.log("Resetting file a")
        return this.command("reset_file", {path});
    }
}

class TimerEventListener {
    private unlisten: (() => void) | null = null;
    
    constructor(public event: "time_update" | "episode_update", public callback: (event: Event<unknown>) => void) {
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

export default class TimerApi {
    public static TauriTimerApi = TauriTimerApi;
    public static TimerEventListener = TimerEventListener;
}