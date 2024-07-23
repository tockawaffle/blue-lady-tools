import type {SVGProps} from 'react';
import {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {TauriApi} from "@/lib/tauri";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import GetVideoType, {VideoType} from "@/helpers/GetVideoType";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Checkbox} from "@/components/ui/checkbox";
import * as Progress from '@radix-ui/react-progress';
import {Label} from "@/components/ui/label";
import {SettingsIcon} from "@/components/main/Header";

function SearchIcon(props: SVGProps<SVGSVGElement>) {
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
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
        </svg>
    )
}

export function SvgSpinnersBarsRotateFade(props: SVGProps<SVGSVGElement>) {
    return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <g>
            <rect width={2} height={5} x={11} y={1} fill="#E8EBE4" opacity={0.14}></rect>
            <rect width={2} height={5} x={11} y={1} fill="#E8EBE4" opacity={0.29} transform="rotate(30 12 12)"></rect>
            <rect width={2} height={5} x={11} y={1} fill="#E8EBE4" opacity={0.43} transform="rotate(60 12 12)"></rect>
            <rect width={2} height={5} x={11} y={1} fill="#E8EBE4" opacity={0.57} transform="rotate(90 12 12)"></rect>
            <rect width={2} height={5} x={11} y={1} fill="#E8EBE4" opacity={0.71} transform="rotate(120 12 12)"></rect>
            <rect width={2} height={5} x={11} y={1} fill="#E8EBE4" opacity={0.86} transform="rotate(150 12 12)"></rect>
            <rect width={2} height={5} x={11} y={1} fill="#E8EBE4" transform="rotate(180 12 12)"></rect>
            <animateTransform attributeName="transform" calcMode="discrete" dur="0.75s" repeatCount="indefinite"
                              type="rotate"
                              values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"></animateTransform>
        </g>
    </svg>);
}

type VideoInfo = {
    title: string;
    ext: string;
    thumbnail: string;
    uploader: string;
};

export default function Ytdlp() {
    
    const [url, setUrl] = useState<string>("");
    const [startSearch, setStartSearch] = useState<boolean>(false);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    
    const [error, setError] = useState<string | null>(null);
    
    const [downloadData, setDownloadData] = useState<{
        downloaded: string;
        percentage: number;
        total: string;
        speed: string;
        eta: string;
    }>({
        downloaded: "",
        percentage: 0,
        total: "",
        speed: "",
        eta: ""
    });
    const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
    
    const [customPath, setCustomPath] = useState<string>("");
    
    const [audioOnly, setAudioOnly] = useState<boolean>(false);
    const [videoOnly, setVideoOnly] = useState<boolean>(false);
    const [uniqueFolders, setUniqueFolders] = useState<boolean>(false);
    const [downloadThumbnail, setDownloadThumbnail] = useState<boolean>(false);
    
    useEffect(() => {
        const localStoragePath = localStorage.getItem("customPath");
        
        if (!localStoragePath) {
            TauriApi.Ytdlp.TauriYtdlpApi.GetDefaultPath().then((path) => {
                setCustomPath(path as string);
            });
        }
        
        setCustomPath(localStoragePath as string);
        
    }, []);
    
    useEffect(() => {
        if (!startSearch) return;
        
        const fetchVideoInfo = async () => {
            try {
                const info = await TauriApi.Ytdlp.TauriYtdlpApi.GetVideoInfo(url);
                const [title, ext, thumbnail, uploader] = info as [string, string, string, string];
                setVideoInfo({title, ext, thumbnail, uploader});
                setStartSearch(false)
            } catch (err) {
                console.error("Error fetching video info:", err);
                
            } finally {
                console.log("Finished fetching video info")
            }
        };
        
        fetchVideoInfo();
    }, [url, startSearch]);
    
    useEffect(() => {
        if (!url) return;
        
        const videoType = GetVideoType(url);
        
        if (!videoType || videoType === VideoType.Playlist) {
            setError("URL inválida");
            return;
        }
        
        setError(null);
    }, [url])
    
    async function handleDownload() {
        const format = audioOnly ? "audio" : videoOnly ? "video" : "";
        const opts = {
            url,
            path: customPath,
            uniqueFolders,
            downloadThumbnail,
            writeUrlLink: false,
            format
        };
        
        try {
            setDownloadStarted(true);
            
            await TauriApi.Ytdlp.TauriYtdlpApi.DownloadVideo(opts);
            
            const completeEventListener = new TauriApi.Ytdlp.YtdlpEventListener("download_complete", (data: any) => {
                setDownloadStarted(false);
                setDownloadData({
                    downloaded: "",
                    percentage: 0,
                    total: "",
                    speed: "",
                    eta: ""
                })
            });
            
            const errorEventListener = new TauriApi.Ytdlp.YtdlpEventListener("download_error", (data: any) => {
                console.error("Download error", data);
                setError("Não foi possível baixar o vídeo. Por favor, tente novamente.");
                setDownloadStarted(false);
            });
            
            const downloadProgressListener = new TauriApi.Ytdlp.YtdlpEventListener("download_progress", (data: any) => {
                
                const regex = /\[download]\s+([\d.]+%)\s+of\s+~\s+([\d.]+MiB)\s+at\s+([\d.]+MiB\/s)\s+ETA\s+(\d{2}:\d{2})/;
                const match = data.payload.match(regex);
                if (match) {
                    const percentage = match[1];
                    const fileSize = match[2];
                    const speed = match[3];
                    const eta = match[4];
                    
                    const percentageNumber = parseFloat(percentage.replace("%", ""));
                    
                    setDownloadData({
                        downloaded: percentage,
                        percentage: percentageNumber,
                        total: fileSize,
                        speed,
                        eta
                    });
                    
                    if (percentage.includes("100")) {
                        setDownloadStarted(false);
                    }
                } else {
                    console.log("No match found");
                }
            });
            
            await downloadProgressListener.listen();
            await completeEventListener.listen();
            await errorEventListener.listen();
            return;
        } catch (err: any) {
            console.error("Error downloading video:", err);
            setError("Não foi possível baixar o vídeo. Por favor, tente novamente.");
            return false;
        }
    }
    
    return (
        <div className="bg-background rounded-lg shadow-sm p-6">
            <div className={"flex flex-row justify-between items-start"}>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Youtube Downloader</h2>
                    <p className="text-muted-foreground">Aqui você pode baixar vídeos do Youtube.</p>
                </div>
                <div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <SettingsIcon className="h-5 w-5"/>
                                <span className="sr-only">Settings</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <div className="flex items-center justify-between">
                                <DialogHeader>
                                    <DialogTitle>
                                        Configurações de Download
                                    </DialogTitle>
                                </DialogHeader>
                            </div>
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col gap-2">
                                    {[
                                        {
                                            label: "Pastas Únicas",
                                            id: "uniqueFolders",
                                            state: uniqueFolders,
                                            setState: setUniqueFolders
                                        },
                                        {
                                            label: "Apenas Vídeo",
                                            id: "videoOnly",
                                            state: videoOnly,
                                            setState: setVideoOnly,
                                            disabled: audioOnly
                                        },
                                        {
                                            label: "Apenas Áudio",
                                            id: "audioOnly",
                                            state: audioOnly,
                                            setState: setAudioOnly,
                                            disabled: videoOnly
                                        },
                                        {
                                            label: "Baixar Thumbnail",
                                            id: "downloadThumbnail",
                                            state: downloadThumbnail,
                                            setState: setDownloadThumbnail,
                                        },
                                    
                                    ].map(({label, id, state, setState, disabled}) => (
                                        <div key={id} className="flex flex-col space-y-2">
                                            <div className="flex items-center space-x-3 m-2">
                                                <Label htmlFor={id}>{label}</Label>
                                                <Checkbox disabled={disabled} id={id} checked={state} onClick={() => setState(!state)}/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="mt-6 h-fit min-h-[400px] bg-background rounded-lg border">
                <div className="m-2 flex flex-col justify-start items-center h-fit">
                    <div className="h-fit w-full ml-2 flex flex-col justify-start items-start select-none">
                        <div className="w-full flex flex-col">
                            <label htmlFor="videoUrl" className="text-muted-foreground mb-1">
                                URL do Vídeo
                                {
                                    error && (
                                        <span className="text-red-500"> - {error}</span>
                                    )
                                }
                            </label>
                            <div className="relative">
                                <div className="relative w-full max-w-md">
                                    <Input type="text" placeholder="https://www.youtube.com/watch?v=..."
                                           className="pr-10"
                                           onChange={(e) => setUrl(e.target.value)}
                                           value={url}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-auto transition duration-150 ease-in-out hover:scale-110"
                                        onClick={() => {
                                            if (!url) return;
                                            setStartSearch(true);
                                        }}
                                        disabled={!url}
                                    >
                                        <SearchIcon/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        startSearch && (
                            <div className="mt-4 w-full h-fit max-w-md flex flex-col justify-center items-center">
                                <SvgSpinnersBarsRotateFade className="h-24 w-24"/>
                            </div>
                        )
                    }
                    {
                        (Object.keys(videoInfo || {}).length > 0 && !startSearch) && (
                            <div className="mt-4 w-full h-fit max-w-md flex flex-col justify-start items-start">
                                <div
                                    className={"flex flex-col justify-center items-center text-center w-full h-full border rounded"}>
                                    <h1 className="text-lg font-bold">{videoInfo?.title}</h1>
                                    <span className="text-muted-foreground">{videoInfo?.uploader}</span>
                                    <Image src={videoInfo?.thumbnail as string} alt={""} width={350} height={350}
                                           className={"rounded m-2"}/>
                                    <Button
                                        variant={"secondary"}
                                        className={"rounded m-1"}
                                        onClick={handleDownload}
                                        disabled={downloadStarted}
                                    >
                                        Baixar
                                    </Button>
                                    {
                                        downloadStarted && (
                                            <div className={"flex flex-col justify-center items-center m-2"}>
                                                <div className={"flex flex-row justify-start items-start m-1"}>
                                                    <span className={"text-muted-foreground"}>
                                                        Baixado: {downloadData.downloaded ?? "0%"} de {downloadData.total ?? ""} - {downloadData.speed ?? "? MB/s"} - ETA: {downloadData.eta ?? "?"}
                                                    </span>
                                                </div>
                                                <Progress.Root className="ProgressRoot" value={downloadData.percentage}>
                                                    <Progress.Indicator
                                                        className="ProgressIndicator"
                                                        style={{transform: `translateX(-${100 - downloadData.percentage}%)`}}
                                                    />
                                                </Progress.Root>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
