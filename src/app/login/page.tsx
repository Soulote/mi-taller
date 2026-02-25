"use client";

import { GlassCard, PrimaryButton, TextField } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/dashboard");
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 h-[100dvh]">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">Mi Taller</h1>
                    <p className="text-muted">v1.0.0 · Gestión interna</p>
                </div>

                <GlassCard>
                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <TextField
                            label="Usuario"
                            placeholder="admin"
                            defaultValue="admin"
                            required
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            defaultValue="admin"
                            required
                        />
                        <PrimaryButton type="submit" className="mt-2">
                            Ingresar
                        </PrimaryButton>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
}
