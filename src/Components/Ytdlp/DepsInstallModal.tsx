import { Box, Fade, LinearProgress } from "@mui/material";

type DepsInstallModalProps = {
    deps: { step: string; percentage: number; eta: string };
    completed: boolean;
};

export default function DepsInstallModal({ deps, completed }: DepsInstallModalProps) {
    return (
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
                    p: 4
                }}
            >
                <h1 className={"text-2xl font-semibold text-brand-letters"}>Instalando Dependências</h1>
                <Box className={"flex flex-col justify-center items-center"}>
                    <h2 className={"text-lg font-semibold text-brand-letters"}>{deps.step}</h2>
                    <h2 className={"text-lg font-semibold text-brand-letters"}>{deps.percentage.toString()}%</h2>
                    <LinearProgress variant={"determinate"} value={deps.percentage as number} />
                </Box>
            </Box>
        </Fade>
    );
}
