import {Backdrop, Box, Fade, Modal, TextField, Tooltip} from "@mui/material";
import Image from "next/image";

type SettingsModalProps = {
    audioOnly: boolean,
    setAudioOnly: (value: boolean) => void,
    videoOnly: boolean,
    setVideoOnly: (value: boolean) => void,
    uniqueFolders: boolean,
    setUniqueFolders: (value: boolean) => void,
    downloadThumbnail: boolean,
    setThumbnailDownload: (value: boolean) => void,
    customPath: string,
    setCustomPath: (value: string) => void,
    error: string | null,
    handleFolderSelection: () => void,
    settingsOpen: boolean,
    setSettingsOpen: (value: boolean) => void,
    setForceUpdate: (value: boolean) => void,
    setReinstallDeps: (value: boolean) => void
}

export default function SettingsModal(
    {
        audioOnly,
        setAudioOnly,
        videoOnly,
        setVideoOnly,
        uniqueFolders,
        setUniqueFolders,
        downloadThumbnail,
        setThumbnailDownload,
        customPath,
        setCustomPath,
        error,
        handleFolderSelection,
        settingsOpen,
        setSettingsOpen,
        setForceUpdate,
        setReinstallDeps
    }: SettingsModalProps
) {
    return (
        <Modal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500
            }}
        >
            <Fade in={settingsOpen}>
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
                        zIndex: 1
                    }}
                >
                    <h1 className={"text-2xl font-semibold text-brand-letters"}>Configurações</h1>
                    <Box className={"flex flex-col justify-center items-center"}>
                        {
                            [
                                {
                                    label: "Apenas Aúdio",
                                    for: "audio_only",
                                    state: audioOnly,
                                    setState: setAudioOnly
                                },
                                {
                                    label: "Apenas Vídeo",
                                    for: "video_only",
                                    state: videoOnly,
                                    setState: setVideoOnly
                                },
                                {
                                    label: "Pastas Exclusivas",
                                    for: "exclusive_folders",
                                    state: uniqueFolders,
                                    setState: setUniqueFolders
                                },
                                {
                                    label: "Baixar Thumbnail",
                                    for: "thumbnail_download",
                                    state: downloadThumbnail,
                                    setState: setThumbnailDownload
                                }
                            ].map((item, index) => (
                                <div key={index} className={"flex flex-row justify-start items-center w-full"}>
                                    <label
                                        htmlFor={item.for}
                                        className={"text-sm font-semibold text-brand-letters text-start w-full mb-1 ml-1"}
                                    >
                                        {item.label}
                                    </label>
                                    <input
                                        type={"checkbox"}
                                        id={item.for}
                                        name={item.for}
                                        checked={item.state}
                                        onChange={(e) => {
                                            item.setState(e.target.checked);
                                        }}
                                        className={"m-2"}
                                    />
                                </div>
                            ))
                        }
                        
                        <div className={"flex flex-col justify-start items-center w-full"}>
                            <label
                                htmlFor={"custom_path"}
                                className={"text-sm font-semibold text-brand-letters text-start w-full mb-1 ml-1"}
                            >
                                Caminho Personalizado
                            </label>
                            <TextField
                                error={!!error}
                                helperText={error}
                                className={"bg-brand-background-accent w-full rounded-lg"}
                                id="custom_path"
                                variant="outlined"
                                placeholder="Caminho Personalizado"
                                value={customPath}
                                onChange={(e) => {
                                    setCustomPath(e.target.value);
                                }}
                                fullWidth
                                // Button to select folder
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title={"Selecionar Pasta"}>
                                            <button
                                                onClick={handleFolderSelection}
                                            >
                                                <Image
                                                    src={"/icons/folder.svg"}
                                                    width={24}
                                                    height={24}
                                                    alt={"Folder Icon"}
                                                />
                                            </button>
                                        </Tooltip>
                                    )
                                }}
                            />
                        </div>
                        <div className={"flex flex-row justify-evenly items-center mt-2"}>
                            <button
                                className={"timer-buttons"}
                                onClick={() => {
                                    setSettingsOpen(false);
                                }}
                            >
                                Fechar
                            </button>
                            <button
                                className={"timer-buttons"}
                                onClick={() => {
                                    setForceUpdate(true);
                                }}
                            >
                                Atualizar Dependências
                            </button>
                            <button
                                className={"timer-buttons"}
                                onClick={() => {
                                    setReinstallDeps(true);
                                }}
                            >
                                Reinstalar Dependências
                            </button>
                        </div>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    )
}