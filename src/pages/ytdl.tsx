import { useEffect, useState } from "react";
import { TauriApi } from "@/lib/tauri/TauriApi";
import install_deps from "@/Components/Ytdlp/Helpers/InstallDeps";
import GetVideoType, { VideoType } from "@/Components/Ytdlp/Helpers/GetVideoType";
import SettingsModal from "@/Components/Ytdlp/SettingsModal";
import DepsInstallModal from "@/Components/Ytdlp/DepsInstallModal";
import MainContent from "@/Components/Ytdlp/Helpers/MainContent";

type VideoInfo = {
    title: string;
    ext: string;
    thumbnail: string;
    uploader: string;
};

export default function YtDlp() {
    const [deps, setDeps] = useState<{ step: string; percentage: number; eta: string }>({
        step: "Verifying",
        percentage: 0,
        eta: "None"
    });

    const [completed, setCompleted] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [error, setError] = useState<string>("");
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [audioOnly, setAudioOnly] = useState(false);
    const [videoOnly, setVideoOnly] = useState(false);
    const [uniqueFolders, setUniqueFolders] = useState(false);
    const [downloadThumbnail, setThumbnailDownload] = useState(false);
    const [customPath, setCustomPath] = useState("");

    const [downloadInProgress, setDownloadInProgress] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);

    const [forceUpdate, setForceUpdate] = useState(false);
    const [reinstallDeps, setReinstallDeps] = useState(false);

    const Ytdlp = TauriApi.Ytdlp;

    useEffect(() => {
        const get_installation_info = localStorage.getItem("deps_installation_info");
        if (get_installation_info) {
            const deps_installation_info = JSON.parse(get_installation_info);
            if (deps_installation_info.completed) {
                setCompleted(true);
                return;
            }
        }

        return install_deps(Ytdlp, setDeps, setError, setCompleted);
    }, []);

    useEffect(() => {
        const searchCustomPath = localStorage.getItem("customPath");

        if (searchCustomPath) {
            setCustomPath(searchCustomPath);
        }
    }, []);

    useEffect(() => {
        if (!videoUrl) return;

        const videoType = GetVideoType(videoUrl);

        if (!videoType || videoType === VideoType.Playlist) {
            setError("Invalid videoUrl or Playlist videoUrl detected.");
            setVideoInfo(null);
            return;
        }

        setError("");
        setLoading(true);

        const fetchVideoInfo = async () => {
            try {
                const info = await Ytdlp.TauriYtdlpApi.GetVideoInfo(videoUrl);
                const [title, ext, thumbnail, uploader] = info as [string, string, string, string];

                setVideoInfo({
                    title,
                    ext,
                    thumbnail,
                    uploader
                });

                setDownloadComplete(false);
                TauriApi.ResizeWindow(860, 600);
            } catch (err) {
                console.error("Error fetching video info:", err);
                setError("Não foi possível encontrar o vídeo. Por favor, verifique a videoUrl.");
                setVideoInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchVideoInfo();
    }, [videoUrl]);

    async function handleFolderSelection() {
        if (typeof window !== "undefined") {
            try {
                const { dialog } = await import("@tauri-apps/api");
                const selectedFolder = await dialog.open({
                    directory: true,
                    multiple: false,
                    title: "Select Folder"
                });
                if (selectedFolder) {
                    setCustomPath(selectedFolder as string);
                    localStorage.setItem("customPath", selectedFolder as string);
                    setError("");
                }
            } catch (err) {
                console.error("Error selecting folder:", err);
                setError("Could not select folder. Please try again.");
            }
        }
    }

    async function handleDownload() {
        const format = audioOnly ? "audio" : videoOnly ? "video" : "";
        const opts = {
            url: videoUrl,
            path: customPath,
            uniqueFolders,
            downloadThumbnail,
            writeUrlLink: false,
            format
        };

        try {
            setDownloadInProgress(true);
            setDownloadComplete(false);

            await TauriApi.Ytdlp.TauriYtdlpApi.DownloadVideo(opts);

            const completeEventListener = new Ytdlp.YtdlpEventListener("download_complete", (data: any) => {
                console.log("Download complete", data);
                setDownloadInProgress(false);
                setDownloadComplete(true);
            });

            const errorEventListener = new Ytdlp.YtdlpEventListener("download_error", (data: any) => {
                console.error("Download error", data);
                setDownloadInProgress(false);
                setError("Não foi possível baixar o vídeo. Por favor, tente novamente.");
            });

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
        <>
            <SettingsModal
                audioOnly={audioOnly}
                setAudioOnly={setAudioOnly}
                videoOnly={videoOnly}
                setVideoOnly={setVideoOnly}
                uniqueFolders={uniqueFolders}
                setUniqueFolders={setUniqueFolders}
                downloadThumbnail={downloadThumbnail}
                setThumbnailDownload={setThumbnailDownload}
                customPath={customPath}
                setCustomPath={setCustomPath}
                error={error}
                handleFolderSelection={handleFolderSelection}
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                setForceUpdate={setForceUpdate}
                setReinstallDeps={setReinstallDeps}
            />
            {completed ? (
                <MainContent
                    videoUrl={videoUrl}
                    setVideoUrl={setVideoUrl}
                    error={error}
                    videoInfo={videoInfo}
                    loading={loading}
                    setSettingsOpen={setSettingsOpen}
                    handleDownload={handleDownload}
                    downloadInProgress={downloadInProgress}
                    downloadComplete={downloadComplete}
                />
            ) : (
                <DepsInstallModal deps={deps} completed={completed} />
            )}
        </>
    );
}
