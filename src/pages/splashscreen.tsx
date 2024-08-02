import {useEffect, useState} from "react"
import {CompassIcon} from "lucide-react";
import {TauriApi} from "@/lib/tauri";

export default function Splashscreen() {
    const [currentStep, setCurrentStep] = useState(1)

    async function HandleDependencies() {
        setCurrentStep(1)
        const deps = await TauriApi.Ytdlp.TauriYtdlpApi.VerifyDependencies() as {
            ffmpeg: boolean,
            ytdlp: boolean
        };

        if (!deps.ffmpeg || !deps.ytdlp) {
            setCurrentStep(2)
            const deps = await TauriApi.Ytdlp.TauriYtdlpApi.DownloadDependencies() as {
                ffmpeg: { success: boolean, message: string },
                ytdlp: { success: boolean, message: string }
            };

            if (deps.ffmpeg.success && deps.ytdlp.success) {
                return setCurrentStep(3)
            }
        } else {
            return setCurrentStep(3)
        }
    }

    useEffect(() => {
        if (typeof window !== undefined) {
            // Define an async function inside useEffect
            const checkDependencies = async () => {
                await HandleDependencies();
                TauriApi.InvokeMainWindow();
            };

            // Call the async function
            checkDependencies();
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-6 animate-fade-in">
                <CompassIcon className="w-16 h-16 text-primary animate-bounce"/>
                <div className="text-2xl font-bold text-primary-foreground animate-fade-in-up">Blue Lady's Tools</div>
                <div className="grid w-full max-w-xs gap-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <div
                            className={`text-sm font-medium ${
                                currentStep >= 1 ? "text-primary-foreground" : "text-muted-foreground"
                            }`}
                        >
                            Verificando Dependências
                        </div>
                        <div
                            className={`text-sm font-medium ${
                                currentStep >= 1 ? "text-primary-foreground" : "text-muted-foreground"
                            }`}
                        >
                            {currentStep >= 1 ? "\u2713" : ""}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div
                            className={`text-sm font-medium ${
                                currentStep >= 2 ? "text-primary-foreground" : "text-muted-foreground"
                            }`}
                        >
                            Baixando Dependências
                        </div>
                        <div
                            className={`text-sm font-medium ${
                                currentStep >= 2 ? "text-primary-foreground" : "text-muted-foreground"
                            }`}
                        >
                            {currentStep >= 2 ? "\u2713" : ""}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div
                            className={`text-sm font-medium ${
                                currentStep >= 3 ? "text-primary-foreground" : "text-muted-foreground"
                            }`}
                        >
                            Inicializando
                        </div>
                        <div
                            className={`text-sm font-medium ${
                                currentStep >= 3 ? "text-primary-foreground" : "text-muted-foreground"
                            }`}
                        >
                            {currentStep >= 3 ? "\u2713" : ""}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}