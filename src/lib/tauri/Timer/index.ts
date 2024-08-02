import type {Event} from "@tauri-apps/api/event";

class TauriTimerApi {
    private static async command<T>(command: string, args: any): Promise<T> {
        const { invoke } = await import('@tauri-apps/api/core');
        return invoke(command, args);
    }
    
    static async TauriReadFile(): Promise<string[]> {
        console.log("Reading file")
        return this.command("read_file", {});
    }
    
    static async TauriStartTimer() {
        console.log("Starting timer")
        return this.command("start_timer", {});
    }
    
    static async TauriStopTimer() {
        console.log("Stopping timer")
        return this.command("stop_timer", {});
    }
    
    static async TauriAddEpisode() {
        console.log("Adding episode")
        return this.command("add_episode", {});
    }
    
    static async TauriDecEpisode() {
        console.log("Removing episode")
        return this.command("dec_episode", {});
    }
    
    // This is bugged as fuck lol, will revisit it later, for now we'll have to continue using the reset file function for the reset
    // Why is this marked as "bugged"? I don't see the bug, old me and I know you weren't high when you made this.
    static async TauriResetTimer() {
        console.log("Resetting timer")
        // This here should be "reset_timer"
        return this.command("reset_timer", {});
    }
    
    static async TauriResetFile() {
        console.log("Resetting file a")
        return this.command("reset_file", {});
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