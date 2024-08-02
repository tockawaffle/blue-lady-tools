import {useState} from "react"

import Settings from "@/components/main/Settings";
import Ytdlp from "@/components/main/Ytdlp";
import WatchAlong from "@/components/main/WatchAlong";
import Header from "@/components/main/Header";
import Footer from "@/components/main/Footer";

type Tools = "ytdlp" | "watchalong" | "settings"

export default function HomePage() {
    
    const [selectedTool, setSelectedTool] = useState<Tools>("ytdlp")
    
    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-background border-b">
                <Header selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
            </header>
            <main className="flex-1 bg-muted/40 py-8">
                <div className="container px-4 sm:px-6">
                    {selectedTool === "watchalong" && (
                        <WatchAlong/>
                    )}
                    {selectedTool === "ytdlp" && (
                        <Ytdlp/>
                    )}
                    {selectedTool === "settings" && (
                        <Settings/>
                    )}
                </div>
            </main>
            <footer className="bg-background border-t select-none">
                <Footer/>
            </footer>
        </div>
    )
}


