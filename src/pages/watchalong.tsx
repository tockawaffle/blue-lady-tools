'use client';
import React, {useEffect, useState} from "react";
import {Event} from "@tauri-apps/api/event";
import {TauriApi} from "@/lib/tauri/TauriApi";

export default function TimerPage() {
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
    
    useEffect(() => {
        const timerEventListener = new TimerEventListener("time_update", handleTimerEvent);
        
        if (start) {
            TauriTimerApi.TauriStartTimer("resources/watchalong.txt").catch((err) => {
                console.error("Error starting timer:", err);
            });
            timerEventListener.listen();
        } else {
            TauriTimerApi.TauriStopTimer("resources/watchalong.txt").catch((err) => {
                console.error("Error stopping timer:", err);
            });
            timerEventListener.stop();
        }
        
        return () => {
            timerEventListener.stop();
        };
    }, [start]);
    
    useEffect(() => {
        if (addEpisode) {
            TauriTimerApi.TauriAddEpisode("resources/watchalong.txt").then(() => {
                setAddEpisode(false);
                setEpisode((prev) => prev + 1);
            }).catch((err) => {
                console.error("Error adding episode:", err);
            });
        } else if (decEpisode) {
            TauriTimerApi.TauriDecEpisode("resources/watchalong.txt").then(() => {
                setDecEpisode(false);
                setEpisode((prev) => prev - 1);
            }).catch((err) => {
                console.error("Error removing episode:", err);
            });
        }
    }, [addEpisode, decEpisode, episode]);
    
    const handleResetTimer = () => {
        TauriTimerApi.TauriResetTimer("resources/watchalong.txt")
            .then(() => {
                console.log("Timer reset successful");
                // Update UI state after reset
                return TauriTimerApi.TauriReadFile("resources/watchalong.txt");
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
        TauriTimerApi.TauriResetFile("resources/watchalong.txt")
            .then(() => {
                console.log("File reset successful");
                // Update UI state after reset
                return TauriTimerApi.TauriReadFile("resources/watchalong.txt");
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
    
    
    useEffect(() => {
        TauriTimerApi.TauriReadFile("resources/watchalong.txt").then((data: string[]) => {
            const [episode, time] = data;
            setEpisode(parseInt(episode, 10));
            const [minutes, seconds] = time.split(":").map(Number);
            setMinutes(minutes);
            setSeconds(seconds);
        }).catch((err) => {
            console.error("Error reading file:", err);
        });
    }, []);
    
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center m-2">
                <p className="text-white text-2xl">Episódio: {episode}</p>
                <p className="text-white text-2xl">Tempo: {`${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`}</p>
            </div>
            <div className="flex flex-col justify-center items-center w-full h-fit">
                <div className="flex flex-row justify-center items-center">
                    <button id="start" onClick={() => {
                        setStart(true);
                    }} disabled={start}
                            className="bg-brand-background-accent border-brand-background-accent hover:bg-brand-background-accent-small timer-buttons">
                        Iniciar
                    </button>
                    <button id="stop" onClick={() => {
                        setStart(false);
                    }}
                            className="bg-brand-background-red-accent border-brand-background-red-accent hover:border-brand-background-red-even-redder hover:bg-brand-background-red-even-redder timer-buttons"
                            disabled={!start}>
                        Parar
                    </button>
                </div>
                <div className="flex flex-row justify-center items-center">
                    <button id="add" onClick={() => {
                        setAddEpisode(true);
                    }} className="timer-buttons" disabled={start}>
                        Adicionar Episódio
                    </button>
                    <button id="dec" onClick={() => {
                        setDecEpisode(true);
                    }}
                            className="timer-buttons" disabled={start}>
                        Remover Episódio
                    </button>
                </div>
                <div className="flex flex-row justify-center items-center">
                    <button id="resetTimer" onClick={handleResetTimer} className="timer-buttons" disabled={start}>
                        Resetar Timer
                    </button>
                    <button id="resetFile" onClick={handleResetFile} className="timer-buttons" disabled={start}>
                        Resetar Arquivo
                    </button>
                </div>
            </div>
        </div>
    );
}
