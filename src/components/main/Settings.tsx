import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {TauriApi} from "@/lib/tauri";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {SvgSpinnersBarsRotateFade} from "@/components/main/Ytdlp";

export default function Settings() {
    
    const [customPath, setCustomPath] = useState<string | null>(null);
    const [theme, setTheme] = useState<"deepsea" | "midnight" | "pastel" | "">("");
    
    const [reinstallDeps, setReinstallDeps] = useState<boolean>(false);
    const [reinstallDepsError, setReinstallDepsError] = useState<string>("");
    const [verifyDeps, setVerifyDeps] = useState<boolean>(false);
    const [verifyDepsError, setVerifyErrorDeps] = useState<{
        type: "error" | "success" | "",
        message: string
    }>({
        type: "",
        message: ""
    })
    
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        console.log(theme)
        if (theme) return setTheme(theme as "deepsea" | "midnight" | "pastel");
        return setTheme("deepsea")
    }, [])
    
    async function handleFolderSelection() {
        if (typeof window !== "undefined") {
            try {
                const dialog = await import("@tauri-apps/plugin-dialog");
                const selectedFolder = await dialog.open({
                    directory: true,
                    multiple: false,
                    title: "Select Folder"
                });
                if (selectedFolder) {
                    setCustomPath(selectedFolder as string);
                    localStorage.setItem("customPath", selectedFolder as string);
                }
            } catch (err) {
                console.error("Error selecting folder:", err);
            }
        }
    }
    
    async function handleDownloadDeps() {
        setReinstallDeps(true)
        const deps = await TauriApi.Ytdlp.TauriYtdlpApi.DownloadDependencies() as {
            ffmpeg: { success: boolean, message: string },
            ytdlp: { success: boolean, message: string }
        };
        
        if (deps.ffmpeg.success && deps.ytdlp.success) {
            if (verifyDepsError.type === "error") {
                setVerifyErrorDeps({
                    type: "success",
                    message: "Dependências instaladas com sucesso."
                })
            }
            
            return setReinstallDeps(false);
        } else {
            return setReinstallDepsError("Erro ao baixar as dependências. Por favor, faça manualmente.")
        }
    }
    
    async function handleVerifyDeps() {
        setVerifyDeps(true)
        const deps = await TauriApi.Ytdlp.TauriYtdlpApi.VerifyDependencies() as {
            ffmpeg: boolean,
            ytdlp: boolean
        };
        
        if (deps.ffmpeg && deps.ytdlp) {
            return setVerifyDeps(false);
        } else {
            return setVerifyErrorDeps({
                type: "error",
                message: "Erro ao verificar as dependências. Por favor, reinstale."
            })
        }
    }
    
    return (
        <div className="bg-background rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Configurações</h2>
            <p className="text-muted-foreground">Aqui você pode configurar o app.</p>
            <div>
                <Dialog open={reinstallDeps} modal>
                    <DialogContent className={"flex flex-col justify-start items-start"}>
                        <h2 className="text-2xl font-bold">Reinstalando Dependências</h2>
                        <div className={"flex flex-row justify-center items-center"}>
                            <p className="text-muted-foreground">Aguarde enquanto reinstalamos as dependências do
                                app.</p>
                            <SvgSpinnersBarsRotateFade className="ml-4 h-8 w-8"/>
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={verifyDeps} modal>
                    <DialogContent className={"flex flex-col justify-start items-start no-close"}>
                        <h2 className="text-2xl font-bold">Verificando Dependências</h2>
                        {
                            verifyDepsError.type === "error" && (
                                <div className={"flex flex-col justify-center items-center w-full"}>
                                    <p className="text-red-500">Erro ao verificar as dependências. Por favor,
                                        reinstale.</p>
                                    <Button
                                        onClick={() => {
                                            handleDownloadDeps()
                                        }}
                                        variant="secondary" className="mt-4">
                                        Reinstalar Dependências
                                    </Button>
                                </div>
                            ) || verifyDepsError.type === "success" && (
                                <div className={"flex flex-col justify-center items-center"}>
                                    <p className="text-green-500">Dependências instaladas com sucesso.</p>
                                    <Button
                                        onClick={() => {
                                            setVerifyErrorDeps({
                                                type: "",
                                                message: ""
                                            })
                                            setVerifyDeps(false)
                                        }}
                                        variant="secondary" className="mt-4">
                                        Ok
                                    </Button>
                                </div>
                            ) || (
                                <div className={"flex flex-row justify-center items-center"}>
                                    <p className="text-muted-foreground">Aguarde enquanto verificamos as dependências do
                                        app.</p>
                                    <SvgSpinnersBarsRotateFade className="ml-4 h-8 w-8"/>
                                </div>
                            )
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <Label htmlFor="theme">Tema</Label>
                            <Select
                                defaultValue={theme}
                                onValueChange={(value) => {
                                    // Set the theme
                                    document.documentElement.setAttribute("data-theme", value)
                                    localStorage.setItem("theme", value)
                                    setTheme(value as "deepsea" | "midnight" | "pastel")
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um Tema"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="midnight">Meia-Noite</SelectItem>
                                    <SelectItem value="deepsea">Mar Profundo</SelectItem>
                                    <SelectItem value="pastel">Pastel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Youtube Downloader</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className={"flex flex-col"}>
                            <Button
                                onClick={() => {
                                    handleVerifyDeps()
                                }}
                                variant="secondary" className="w-[188px]">
                                Verificar Dependências
                            </Button>
                        </div>
                        <div>
                            <Button
                                onClick={() => {
                                    handleDownloadDeps()
                                }}
                                variant="secondary" className="w-[188px]">
                                Reinstalar Dependências
                                {reinstallDepsError &&
                                    <span className="text-red-500 ml-2"> - {reinstallDepsError}</span>}
                            </Button>
                        </div>
                    </CardContent>
                    <CardContent className="space-y-2">
                        {/* Input type for selecting the download folder */}
                        <div>
                            <Label htmlFor="downloadFolder">Pasta de Download</Label>
                            <div className="relative">
                                <div className="relative w-full max-w-md">
                                    <input
                                        type="text"
                                        value={customPath || localStorage.getItem("customPath") || ""}
                                        placeholder="C:/Downloads"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-auto"
                                        onClick={handleFolderSelection}
                                    >
                                        <svg className="h-5 w-5 text-muted-foreground cursor-pointer" fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
