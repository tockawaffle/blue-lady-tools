import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {YtdlpApi} from "@/lib/tauri/TauriApi";
import {Box, Fade, InputAdornment, LinearProgress, TextField} from "@mui/material";
import Image from "next/image";

enum VideoType {
    Clip = "Clip",
    Playlist = "Playlist",
    Livestream = "Livestream",
    Video = "Video"
}

function install_deps(
    Ytdlp: typeof YtdlpApi,
    setDeps: Dispatch<
        SetStateAction<{
            step: string;
            percentage: number;
            eta: string;
        }>
    >,
    setCompleted: Dispatch<SetStateAction<boolean>>
) {
    const listener = new Ytdlp.YtdlpEventListener("ytdlp_deps_progress", (event) => {
        const new_event = event.payload as {
            step: string;
            percentage: number;
            eta: string;
        };
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

function getVideoType(url: string): VideoType | null {
    const patterns: [RegExp, VideoType][] = [
        [/https?:\/\/(www\.)?youtube\.com\/clip\//, VideoType.Clip],
        [/https?:\/\/(www\.)?youtube\.com\/playlist\?list=/, VideoType.Playlist],
        [/https?:\/\/(www\.)?youtube\.com\/watch\?v=[^&]+&live/, VideoType.Livestream],
        [/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, VideoType.Video]
    ];
    
    for (const [pattern, type] of patterns) {
        if (pattern.test(url)) {
            return type;
        }
    }
    return null;
}

export default function YtDlp() {
    const [deps, setDeps] = useState<{
        step: string;
        percentage: number;
        eta: string;
    }>({
        step: "Verifying",
        percentage: 0,
        eta: "None",
    });
    
    const [completed, setCompleted] = useState(false);
    const [url, setUrl] = useState("");
    const [error, setError] = useState<string>("");
    
    const Ytdlp = YtdlpApi;
    
    useEffect(() => {
        const get_installation_info = localStorage.getItem("deps_installation_info");
        if (get_installation_info) {
            const deps_installation_info = JSON.parse(get_installation_info);
            if (deps_installation_info.completed) {
                setCompleted(true);
                return;
            }
        }
        
        const cleanup = install_deps(Ytdlp, setDeps, setCompleted);
        return cleanup;
    }, []);
    
    return (
        <>
            {completed ? (
                <div className={"flex flex-col justify-center items-center w-full h-full"}>
                    <h2 className={"text-lg font-semibold text-brand-letters m-2"}>Youtube Downloader</h2>
                    <div className={"w-64 h-[2px] bg-brand-background-accent m-2"}/>
                    <div className={"flex flex-col justify-start items-center mt-4 w-fit"}>
                        <label htmlFor={"video_url"}
                               className={"text-sm font-semibold text-brand-letters text-start w-full mb-1 ml-1"}>
                            URL do Video
                        </label>
                        <TextField
                            error={!!error}
                            helperText={error}
                            className={"bg-brand-background-accent w-full rounded-lg"}
                            id="video_url"
                            variant="outlined"
                            placeholder="URL do Video"
                            value={url}
                            onChange={(e) => {
                                const videoType = getVideoType(e.target.value);
                                
                                if (!videoType || videoType === VideoType.Playlist) {
                                    return setError("Invalid URL or Playlist URL detected.");
                                } else {
                                    setError("");
                                }
                                
                                setUrl(e.target.value);
                            }}
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <button
                                            className={"w-10 h-10 bg-brand-background-accent-small flex justify-center items-center rounded-lg"}
                                            onClick={(e) => {
                                                if(url === "") {
                                                    return setError("URL is empty.");
                                                }
                                                
                                                Ytdlp.TauriYtdlpApi.GetVideoInfo(url).then((info) => {
                                                    console.log(info)
                                                })
                                            }}
                                        >
                                            <Image
                                                src={"/icons/search.svg"}
                                                className={"transition duration-300 ease-in-out hover:scale-110"}
                                                width={32}
                                                height={32}
                                                alt={"Search Icon"}
                                            />
                                        </button>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                </div>
            ) : (
                <Fade in={!completed}>
                    <Box
                        className={"flex flex-col justify-center items-center"}
                        sx={{
                            position: "absolute" as "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "#38A3A5",
                            width: 400,
                            boxShadow: 24,
                            borderRadius: "0.5rem",
                            p: 4,
                        }}
                    >
                        <h1 className={"text-2xl font-semibold text-brand-letters"}>Instalando Dependências</h1>
                        <Box className={"flex flex-col justify-center items-center"}>
                            <h2 className={"text-lg font-semibold text-brand-letters"}>{deps.step}</h2>
                            <h2 className={"text-lg font-semibold text-brand-letters"}>{deps.percentage.toString()}%</h2>
                            <LinearProgress variant={"determinate"} value={deps.percentage as number}/>
                        </Box>
                    </Box>
                </Fade>
            )}
        </>
    );
}
