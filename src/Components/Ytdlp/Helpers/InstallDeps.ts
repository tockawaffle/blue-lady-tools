import {TauriApi} from "@/lib/tauri/TauriApi";
import {Dispatch, SetStateAction} from "react";

export default function install_deps(
    Ytdlp: typeof TauriApi.Ytdlp,
    setDeps: Dispatch<SetStateAction<{ step: string; percentage: number; eta: string }>>,
    setCompleted: Dispatch<SetStateAction<boolean>>
) {
    const listener = new Ytdlp.YtdlpEventListener("ytdlp_deps_progress", (event) => {
        const new_event = event.payload as { step: string; percentage: number; eta: string };
        setDeps(new_event);
    });
    
    listener.listen();
    
    Ytdlp.TauriYtdlpApi.GetDependencies()
        .then(() => {
            setCompleted(true);
            localStorage.setItem("deps_installation_info", JSON.stringify({completed: true}));
            listener.stop();
        })
        .catch((err) => {
            console.error("Error installing dependencies:", err);
            listener.stop();
        });
    
    return () => {
        listener.stop();
    };
}