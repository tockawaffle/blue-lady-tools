import Image from "next/image";
import {ReactElement, useEffect, useState} from "react";
import TimerPage from "@/pages/watchalong";
import YtDlp from "@/pages/ytdl";

export default function HomePage() {
    const [tool, setTool] = useState<"watchalong" | "ytdl" | null>(null);
    const [selectedTool, setSelectedTool] = useState<ReactElement | null>(null);
    
    useEffect(() => {
        if (tool === "watchalong") {
            setSelectedTool(<TimerPage/>);
        } else if (tool === "ytdl") {
            setSelectedTool(<YtDlp/>);
        } else {
            setSelectedTool(null);
        }
    }, [tool]);
    
    return (
        <div className="flex flex-col w-screen h-screen bg-brand-background-blue">
            <header
                className="flex flex-row justify-center items-center w-full border-b-2 border-b-brand-background-accent fixed top-0 h-16 bg-brand-background-blue">
                <div className="flex flex-row justify-center items-center hover:cursor-default select-none m-2">
                    <Image src="/logos/blue_rose.svg" width={50} height={50} alt="Logo"/>
                    <span
                        className="text-brand-letters font-semibold text-sm italic text-center">Blue Lady's Tools</span>
                </div>
                <div className="flex flex-row justify-end items-center w-full">
                    {[
                        {name: "Timer Watchalong", item: "watchalong"},
                        {name: "Youtube Downloader", item: "ytdl"},
                    ].map((item, index) => (
                        <button
                            key={index}
                            disabled={tool === item.item}
                            onClick={(e) => {
                                e.preventDefault();
                                setTool(item.item as "watchalong" | "ytdl");
                            }}
                            className={"primary-button"}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            </header>
            <main className={`flex flex-col justify-center items-center w-full h-${
               (tool === "watchalong") ? "full" : "fit"
            } mt-16 mb-8`}>
                {selectedTool}
            </main>
            <footer
                className="select-none flex flex-row justify-center items-center w-full border-t-2 border-t-brand-background-accent fixed bottom-0 h-8 bg-brand-background-blue">
                <div className={"flex justify-start items-center "}>
                    <span className="text-brand-letters font-semibold text-2xs italic text-center ml-1">
                        v0.1.0
                    </span>
                </div>
                <div className="flex flex-row justify-center items-center w-full">
                    <span className="text-brand-letters font-semibold text-xs italic text-center">
                        where imagination blooms in rare hues.
                    </span>
                </div>
            </footer>
        </div>
    );
}
