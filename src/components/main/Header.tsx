import Link from "next/link";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import React from "react";

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    )
}

export function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    )
}

export default function Header(
    {selectedTool, setSelectedTool}:
        {
            selectedTool: "ytdlp" | "watchalong" | "settings",
            setSelectedTool: (tool: "ytdlp" | "watchalong" | "settings") => void
        }
) {
    return (
        <div className="container flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
                <Link href="#" className="mr-6" prefetch={false}>
                    <CompassIcon className="h-6 w-6"/>
                    <span className="sr-only">Blue Lady's Tools</span>
                </Link>
                <Button
                    variant={selectedTool === "watchalong" ? "primary" : "ghost"}
                    onClick={() => setSelectedTool("watchalong")}
                    className="shrink-0"
                    disabled={selectedTool === "watchalong"}
                >
                    WatchAlong Timer
                </Button>
                <Button
                    variant={selectedTool === "ytdlp" ? "primary" : "ghost"}
                    onClick={() => setSelectedTool("ytdlp")}
                    className="shrink-0"
                    disabled={selectedTool === "ytdlp"}
                >
                    Youtube Downloader
                </Button>
                <Button
                    variant={selectedTool === "settings" ? "primary" : "ghost"}
                    onClick={() => setSelectedTool("settings")}
                    className="shrink-0"
                    disabled={selectedTool === "settings"}
                >
                    Configurações
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <SettingsIcon className="h-5 w-5"/>
                            <span className="sr-only">Settings</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => setSelectedTool("settings")}
                        >Configurações</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}