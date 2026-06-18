import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { t } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(form.email, form.password);
    setSubmitting(false);
    if (res.ok) {
      toast.success("Connexion réussie");
      const next = params.get("next") || (res.user.role === "admin" ? "/admin" : "/account");
      navigate(next);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex lg:grid lg:grid-cols-12" data-testid="login-page">
      {/* Left side: Content */}
      <div className="flex-1 lg:col-span-5 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-background">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="text-left">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-6 shadow-lg shadow-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="font-display font-black tracking-tight text-4xl sm:text-5xl leading-none">{t("login_title")}</h1>
            <p className="mt-4 text-muted-foreground font-medium">{t("login_subtitle")}</p>
          </div>

          <form onSubmit={submit} className="space-y-5" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("email")}</Label>
              <Input id="email" type="email" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="login-email" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("password")}</Label>
                <Link to="/forgot" className="text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary/80 transition-colors">Oublié ?</Link>
              </div>
              <Input id="password" type="password" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="login-password" />
            </div>
            <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={submitting} data-testid="login-submit">
              {submitting ? t("loading") : (<>{t("login_btn")} <ArrowRight className="h-4 w-4 ml-2" /></>)}
            </Button>
          </form>

          <div className="text-center text-sm font-medium border-t border-border pt-8">
            <span className="text-muted-foreground">{t("no_account")} </span>
            <Link to="/register" className="text-primary font-bold hover:text-primary/80 transition-colors" data-testid="link-register">{t("nav_register")}</Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm">
            <div className="text-[10px] uppercase tracking-widest font-black text-primary">Comptes de test</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Admin</span>
                <code className="font-bold">admin@store.com / Admin123!</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client</span>
                <code className="font-bold">client1@store.com / Client123!</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden lg:block lg:col-span-7 relative overflow-hidden bg-muted">
        <img 
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12" 
          alt="Engineering" 
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.5] brightness-50" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="max-w-xl text-white space-y-6">
            <div className="h-px w-20 bg-primary shadow-[0_0_15px_rgba(15,98,254,0.8)]" />
            <h2 className="font-display font-black text-5xl leading-none">L'excellence au service de votre domicile.</h2>
            <p className="text-xl text-white/70 font-medium leading-relaxed">Rejoignez des milliers de clients qui font confiance à Home Help pour leurs travaux et urgences au quotidien.</p>
            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white/20 bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold tracking-wide">+5k Artisans Partenaires</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
