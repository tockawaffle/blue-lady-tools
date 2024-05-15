'use client';
import {useEffect, useState} from "react"
import type {Event} from "@tauri-apps/api/event"
import TauriApi, {TauriEventListener} from "@/lib/tauri/TauriApi";

export default function HomePage() {

    const [episode, setEpisode] = useState(1);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    const [addEpisode, setAddEpisode] = useState(false);
    const [decEpisode, setDecEpisode] = useState(false);
    const [resetTimer, setResetTimer] = useState(false);

    const [start, setStart] = useState(false);
    const [stop, setStop] = useState(true);

    function updateTimer(event: Event<unknown>) {
        const [minutes, seconds] = (event.payload as any).toString().split(":").map(Number)
        setMinutes(minutes)
        setSeconds(seconds)
    }

    useEffect(() => {

        if (typeof window !== "undefined") {
            TauriApi.TauriReadFile("resources/watchalong.txt").then((data) => {
                const [episode, time, path] = data
                setEpisode(parseInt(episode))
                const [minutes, seconds] = time.split(":").map(Number)
                setMinutes(minutes)
                setSeconds(seconds)
            }).catch((err) => {
                console.error(err)
            })

            const timerEventListener = new TauriEventListener("time_update", updateTimer)
            if (start) {
                TauriApi.TauriStartTimer("resources/watchalong.txt").catch((err) => {
                    console.error(err)
                })
                // Start listener
                timerEventListener.listen();

                [
                    document.getElementById("reset"),
                    document.getElementById("start"),
                    document.getElementById("add"),
                    document.getElementById("dec"),
                ].forEach(btn => {
                    btn?.setAttribute("disabled", "true")
                });

                document.getElementById("stop")?.removeAttribute("disabled")

            } else if (!start && stop) {
                TauriApi.TauriStopTimer("resources/watchalong.txt").catch((err) => {
                    console.error(err)
                })
                // Stop listener
                timerEventListener.stop();

                [
                    document.getElementById("reset"),
                    document.getElementById("start"),
                    document.getElementById("add"),
                    document.getElementById("dec"),
                ].forEach(btn => {
                    btn?.removeAttribute("disabled")
                });

                document.getElementById("stop")?.setAttribute("disabled", "true")
            }

            const EpisodeUpdateEventListener = new TauriEventListener("episode_update", (event) => {
                const episode = (event.payload as any).toString()
                setEpisode(parseInt(episode))
            })

            if (addEpisode) {
                TauriApi.TauriAddEpisode("resources/watchalong.txt").then((data) => {
                    EpisodeUpdateEventListener.listen()
                })

                setAddEpisode(false)
            } else if (!addEpisode && decEpisode) {
                // Try to stop listener, even if it doesn't exist
                EpisodeUpdateEventListener.stop()
            }

            if (resetTimer) {
                TauriApi.TauriResetTimer("resources/watchalong.txt").then((data) => {
                    console.log("Timer Data", data)
                    TauriApi.TauriReadFile("resources/watchalong.txt").then((data) => {
                        const [episode, time, path] = data
                        setEpisode(parseInt(episode))
                        const [minutes, seconds] = time.split(":").map(Number)
                        setMinutes(minutes)
                        setSeconds(seconds)
                    }).catch((err) => {
                        console.error(err)
                    })
                }).catch((err) => {
                    console.error(err)
                })

                setResetTimer(false)
            }
        }

    }, [start, addEpisode, decEpisode, resetTimer, episode, setEpisode]);

    return (
        <div className={"flex flex-col justify-center items-center h-screen w-screen"}>
            <h1 id={"label"} className={"text-4xl m-12"}>
                Episódio: {episode}
                <br/> Tempo: {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </h1>
            <div className={"flex flex-col justify-center items-center"}>
                <div className={"flex flex-row justify-center items-center"}>
                    <button
                        id={"start"}
                        onClick={() => {
                            setStart(true)
                        }}
                        className={`bg-blue-500 text-white p-2 m-2 disabled:bg-gray-500`}
                    >
                        Iniciar
                    </button>
                    <button
                        id={"stop"}
                        onClick={() => {
                            setStart(false)
                        }}
                        className={"bg-red-500 text-white p-2 m-2 disabled:bg-gray-500"}
                    >
                        Parar
                    </button>
                </div>
                <div className={"flex flex-row justify-center items-center"}>
                    <button
                        id={"add"}
                        onClick={() => {
                            setAddEpisode(true)
                        }}
                        className={"bg-amber-500 text-white p-2 m-2 disabled:bg-gray-500"}
                    >
                        Adicionar Episódio
                    </button>
                    <button
                        id={"dec"}
                        onClick={() => {
                            TauriApi.TauriDecEpisode("resources/watchalong.txt")
                        }}
                        className={"bg-amber-700 text-white p-2 m-2 disabled:bg-gray-500"}
                    >
                        Remover Episódio
                    </button>
                </div>
                <div className={"flex flex-row justify-center items-center"}>
                    <button
                        id={"reset"}
                        onClick={() => {
                            setResetTimer(true)
                        }}
                        className={"bg-purple-500 text-white p-2 m-2 disabled:bg-gray-500"}
                    >
                        Resetar Timer
                    </button>
                </div>
            </div>
        </div>
    )
}