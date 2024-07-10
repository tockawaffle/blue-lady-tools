import {useEffect, useState} from "react";
import {YtdlpApi} from "@/lib/tauri/TauriApi";

export default function YtDlp() {
    
    const [deps, setDeps] = useState<{
        step: String,
        percentage: Number,
        eta: String
    }>({
        step: "Verifying",
        percentage: 0,
        eta: "None"
    })
    
    const Ytdlp = YtdlpApi
    useEffect(() => {
        const listener = new Ytdlp.YtdlpEventListener("ytdlp_deps_progress", (event) => {
            const new_event = event.payload as {
                step: String,
                percentage: Number,
                eta: String
            }
            
            setDeps(new_event)
        })
        listener.listen()
        
        Ytdlp.TauriYtdlpApi.GetDependencies()
        
        return () => {
            listener.stop()
        }
    }, [])
    
    return (
        <div>
            <h1>Ytdl Dependencies</h1>
            <p>Step: {deps.step}</p>
            <p>Percentage: {deps.percentage.toString()}%</p>
            <p>ETA: {deps.eta}</p>
        </div>
    )
}