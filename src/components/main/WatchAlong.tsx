import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {type Event} from "@tauri-apps/api/event";
import {TauriApi} from "@/lib/tauri";

export default function WatchAlong() {
    
    const [episode, setEpisode] = useState<number>(1);
    const [minutes, setMinutes] = useState<number>(0);
    const [seconds, setSeconds] = useState<number>(0);
    const [start, setStart] = useState<boolean>(false);
    const [addEpisode, setAddEpisode] = useState<boolean>(false);
    const [decEpisode, setDecEpisode] = useState<boolean>(false);
    
    const {TauriTimerApi, TimerEventListener} = TauriApi.Timer;
    
    const handleTimerEvent = (event: Event<unknown>) => {
        const [minutes, seconds] = (event.payload as string).split(":").map(Number);
        setMinutes(minutes);
        setSeconds(seconds);
    };


    async function handleStart() {
        const timerEventListener = new TimerEventListener("time_update", handleTimerEvent);

        TauriTimerApi.TauriStartTimer().catch((err) => {
            console.error("Error starting timer:", err);
        });
        timerEventListener.listen();
    }

    async function handleStop() {
        TauriTimerApi.TauriStopTimer().then(() => {
            console.log("Timer stopped successfully");
        }).catch((err) => {
            console.error("Error stopping timer:", err);
        });
    }

    useEffect(() => {
        if (addEpisode) {
            TauriTimerApi.TauriAddEpisode().then(() => {
                setAddEpisode(false);
                setEpisode((prev) => prev + 1);
            }).catch((err) => {
                console.error("Error adding episode:", err);
            });
        } else if (decEpisode) {
            TauriTimerApi.TauriDecEpisode().then(() => {
                setDecEpisode(false);
                setEpisode((prev) => prev - 1);
            }).catch((err) => {
                console.error("Error removing episode:", err);
            });
        }
    }, [addEpisode, decEpisode, episode]);
    
    useEffect(() => {
        TauriTimerApi.TauriReadFile().then((data: string[]) => {
            const [episode, time] = data;
            setEpisode(parseInt(episode, 10));
            const [minutes, seconds] = time.split(":").map(Number);
            setMinutes(minutes);
            setSeconds(seconds);
        })
    }, [])
    
    const handleResetTimer = () => {
        TauriTimerApi.TauriResetTimer()
            .then(() => {
                console.log("Timer reset successful");
                // Update UI state after reset
                return TauriTimerApi.TauriReadFile();
            })
            .then((data: string[]) => {
                const [episode, time] = data;
                setEpisode(parseInt(episode, 10));
                const [minutes, seconds] = time.split(":").map(Number);
                setMinutes(minutes);
                setSeconds(seconds);
            })
            .catch((err) => {
                console.error("Error resetting timer:", err);
            });
    };
    
    const handleResetFile = () => {
        TauriTimerApi.TauriResetFile()
            .then(() => {
                console.log("File reset successful");
                // Update UI state after reset
                return TauriTimerApi.TauriReadFile();
            })
            .then((data: string[]) => {
                const [episode, time] = data;
                setEpisode(parseInt(episode, 10));
                const [minutes, seconds] = time.split(":").map(Number);
                setMinutes(minutes);
                setSeconds(seconds);
            })
            .catch((err) => {
                console.error("Error resetting file:", err);
            });
    };
    
    return (
        <div className="bg-background rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">WatchAlong Timer</h2>
            <p className="text-muted-foreground">
                Aqui você pode gerenciar o tempo de seus WatchAlongs
            </p>
            <div className="mt-6 h-[400px] w-full bg-background rounded-lg border flex flex-col justify-start">
                <div className={"m-2 flex flex-col justify-start items-center h-full"}>
                    
                    <div className={"h-1/2 w-full ml-2 flex flex-col justify-center items-start select-none"}>
                        {/*  Tempo and Episode tracker  */}
                        <div className={"w-full flex flex-col justify-center items-center"}>
                            <span className={"text-2xl"}>Episódio: {
                                episode
                            }</span>
                            <span className={"text-2xl"}>
                                {`${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`}
                            </span>
                        </div>
                    </div>
                    <div className={"h-1/2 w-full border-t flex flex-col justify-center items-center"}>
                        <div className={"flex justify-center items-center"}>
                            <Button
                                variant={"ghost"}
                                onClick={() => {
                                    setStart((prev) => !prev)
                                    if (!start) handleStart();
                                }}
                                className="shrink-0"
                                disabled={start}
                            >
                                Iniciar
                            </Button>
                            <Button
                                variant={"ghost"}
                                onClick={() => {
                                    setStart(false)
                                    handleStop();
                                }}
                                className="shrink-0"
                            >
                                Parar
                            </Button>
                        </div>
                        <div className={"flex justify-center items-center"}>
                            <Button
                                variant={"ghost"}
                                onClick={() => setAddEpisode(true)}
                                className="shrink-0"
                                disabled={start}
                            >
                                + Episódio
                            </Button>
                            <Button
                                variant={"ghost"}
                                onClick={() => {
                                    if (episode === 1) return;
                                    setDecEpisode(true)
                                }}
                                disabled={start}
                                className="shrink-0"
                            >
                                - Episódio
                            </Button>
                        </div>
                        <div className={"flex justify-center items-center"}>
                            <Button
                                variant={"ghost"}
                                onClick={() => handleResetTimer()}
                                disabled={start}
                                className="shrink-0"
                            >
                                Resetar Timer
                            </Button>
                            <Button
                                variant={"ghost"}
                                onClick={() => handleResetFile()}
                                disabled={start}
                                className="shrink-0"
                            >
                                Resetar Arquivo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}