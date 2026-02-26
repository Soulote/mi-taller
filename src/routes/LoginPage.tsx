import { useNavigate } from "react-router-dom";
import { GlassCard, PrimaryButton, TextField } from "@/components/ui";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 h-[100dvh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-9">
          <h1 className="text-4xl font-semibold tracking-tight mb-2.5">Mi Taller</h1>
          <p className="text-muted text-sm">v1.1.5 · Gestion interna</p>
        </div>

        <GlassCard>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <TextField label="Usuario" placeholder="admin" defaultValue="admin" required />
            <TextField
              label="Contrasena"
              type="password"
              placeholder="********"
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
