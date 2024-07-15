import {TextField, Tooltip} from "@mui/material";
import Image from "next/image";

type MainContentProps = {
    videoUrl: string,
    setVideoUrl: (value: string) => void,
    error: string | null,
    videoInfo: { title: string; thumbnail: string; uploader: string } | null,
    loading: boolean,
    setSettingsOpen: (value: boolean) => void,
    handleDownload: () => void
    downloadInProgress: boolean
    downloadComplete: boolean
}

export default function MainContent(
    {
        videoUrl,
        setVideoUrl,
        error,
        videoInfo,
        loading,
        setSettingsOpen,
        handleDownload,
        downloadInProgress,
        downloadComplete
    }: MainContentProps
) {
    return (
        <div className={"flex flex-col justify-center items-center w-full h-full"}>
            <h2 className={"text-lg font-semibold text-brand-letters m-2"}>Youtube Downloader</h2>
            <div className={"w-64 h-[2px] bg-brand-background-accent m-2"}/>
            <div className={"flex flex-col justify-start items-center mt-4 w-fit"}>
                <label
                    htmlFor={"video_url"}
                    className={"text-sm font-semibold text-brand-letters text-start w-full mb-1 ml-1"}
                >
                    Url do Video
                </label>
                <TextField
                    error={!!error}
                    helperText={error}
                    disabled={loading || downloadInProgress || downloadComplete}
                    className={"bg-brand-background-accent w-full rounded-lg"}
                    id="video_url"
                    variant="outlined"
                    placeholder="Url do Video"
                    value={videoUrl}
                    onChange={(e) => {
                        setVideoUrl(e.target.value);
                    }}
                    fullWidth
                />
            </div>
            {loading ? (
                <div
                    className={"flex flex-row justify-center items-center mt-4 text-lg font-semibold text-brand-letters"}>
                    Carregando
                    <Image alt={""} src={"icons/dots_bounce.svg"} className={"ml-1"} width={24} height={24}/>
                </div>
            ) : videoInfo ? (
                    <div className={"flex flex-col justify-center items-center mt-4"}>
                        <Image src={videoInfo.thumbnail} width={320} height={180} alt={"Thumbnail"}
                               unoptimized/>
                        <h2 className={"text-lg font-semibold text-brand-letters mb-1"}>{videoInfo.title}</h2>
                        <h2 className={"text-lg font-semibold text-brand-letters"}>{videoInfo.uploader}</h2>
                        <div className={"flex flex-row justify-evenly items-center mt-2"}>
                            <Tooltip title={"Configurações"}>
                                <button
                                    onClick={() => {
                                        setSettingsOpen(true);
                                    }}
                                >
                                    <Image
                                        src={"/icons/settings.svg"}
                                        className={"mr-4"}
                                        width={24}
                                        height={24}
                                        alt={"Download Icon"}
                                    />
                                </button>
                            </Tooltip>
                            <button
                                className={"timer-buttons"}
                                onClick={() => {
                                    handleDownload();
                                }}
                            >
                                <div className={"flex flex-row justify-evenly items-center h-full"}>
                                    Download
                                    <Image
                                        src={"/icons/download.svg"}
                                        className={"mx-1"}
                                        width={24}
                                        height={24}
                                        alt={"Download Icon"}
                                    />
                                </div>
                            </button>
                        </div>
                        {
                            downloadInProgress && (
                                <>
                                    <div className={"w-64 h-[2px] bg-brand-background-accent m-2"}/>
                                    <div className={"flex flex-row justify-center items-center"}>
                                        <h2 className={"text-lg font-semibold text-brand-letters"}>Baixando</h2>
                                        <Image alt={""} src={"icons/dots_bounce.svg"} className={"ml-1"} width={24}
                                               height={24}/>
                                    </div>
                                </>
                            )
                        }
                        {
                            downloadComplete && (
                                <>
                                    <div className={"w-64 h-[2px] bg-brand-background-accent m-2"}/>
                                    <div className={"flex flex-row justify-center items-center"}>
                                        <h2 className={"text-lg font-semibold text-brand-letters"}>Download Completo</h2>
                                    </div>
                                </>
                            )
                        }
                    </div>

                )
                :
                (
                    <div className={"flex flex-col justify-center items-center mt-2"}>
                        <h2 className={"text-lg font-semibold text-brand-letters"}>Nenhum vídeo encontrado</h2>
                    </div>
                )}
        </div>
    )
}