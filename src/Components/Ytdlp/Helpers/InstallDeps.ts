import { TauriApi } from "@/lib/tauri/TauriApi";
import { Dispatch, SetStateAction } from "react";

export default function install_deps(
    Ytdlp: typeof TauriApi.Ytdlp,
    setDeps: Dispatch<SetStateAction<{ step: string; percentage: number; eta: string }>>,
    setError: Dispatch<SetStateAction<string>>,
    setCompleted: Dispatch<SetStateAction<boolean>>
) {
    const listener = new Ytdlp.YtdlpEventListener("ytdlp_deps_progress", (event) => {
        const new_event = event.payload as { step: string; percentage: number; eta: string };
        console.log("New event:", new_event);

        setDeps(new_event);

        // Check if installation is complete based on progress percentage or step
        if (new_event.percentage >= 100 || new_event.step === "All installations completed") {
            setCompleted(true);
            localStorage.setItem("deps_installation_info", JSON.stringify({ completed: true }));
            listener.stop();
        }
    });

    listener.listen();

    Ytdlp.TauriYtdlpApi.GetDependencies().catch((err) => {
        console.error("Error installing dependencies:", err);
        setError(err);
        listener.stop();
    });

    return () => {
        listener.stop();
    };
}
