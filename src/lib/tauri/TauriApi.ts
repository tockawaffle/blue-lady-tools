import type {Event} from "@tauri-apps/api/event";

export default class TauriApi {
    static async TauriReadFile(path: string): Promise<string[]> {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Reading file")
        return invoke("read_file", {path});
    }

    static async TauriStartTimer(path: string) {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Starting timer")
        return invoke("start_timer", {path});
    }

    static async TauriStopTimer(path: string) {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Stopping timer")
        return invoke("stop_timer", {path});
    }

    static async TauriAddEpisode(path: string) {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Adding episode")
        return invoke("add_episode", {path});
    }

    static async TauriDecEpisode(path: string) {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Removing episode")
        return invoke("dec_episode", {path});
    }

    // This is bugged as fuck lol, will revisit it later, for now we'll have to contiune using the reset file function for the reset
    static async TauriResetTimer(path: string) {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Resetting timer")
        // This here should be "reset_timer"
        return invoke("reset_file", {path});
    }

    static async TauriResetFile(path: string) {
        const {invoke} = await import("@tauri-apps/api")
        console.log("Resetting file")
        return invoke("reset_file", {path});
    }
}

export class TauriEventListener {
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