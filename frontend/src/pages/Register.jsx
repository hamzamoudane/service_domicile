import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const { t } = useLang();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await register(form);
    setSubmitting(false);
    if (res.ok) {
      toast.success("Compte créé avec succès");
      navigate("/account");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex lg:grid lg:grid-cols-12" data-testid="register-page">
      {/* Left side: Visual */}
      <div className="hidden lg:block lg:col-span-7 relative overflow-hidden bg-muted">
        <img 
          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e" 
          alt="Professional Worker" 
          className="absolute inset-0 h-full w-full object-cover brightness-50" 
        />
        <div className="absolute inset-0 bg-gradient-to-tl from-emergency/30 via-transparent to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-20 text-white">
          <div className="max-w-xl space-y-6">
            <div className="h-px w-20 bg-emergency shadow-[0_0_15px_rgba(250,77,86,0.8)]" />
            <h2 className="font-display font-black text-5xl leading-none">Une assistance immédiate, en un clic.</h2>
            <p className="text-xl text-white/70 font-medium leading-relaxed">Créez votre compte en quelques secondes et accédez à l'historique de vos interventions, à vos factures et à un support prioritaire.</p>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-black tabular-nums">15 min</div>
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Délai de rappel</div>
              </div>
              <div>
                <div className="text-3xl font-black tabular-nums">100%</div>
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Artisans certifiés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 lg:col-span-5 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-background">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="text-left">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emergency text-emergency-foreground mb-6 shadow-lg shadow-emergency/20">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="font-display font-black tracking-tight text-4xl sm:text-5xl leading-none">{t("register_title")}</h1>
            <p className="mt-4 text-muted-foreground font-medium">{t("register_subtitle")}</p>
          </div>

          <form onSubmit={submit} className="space-y-4" data-testid="register-form">
            <div className="space-y-2">
              <Label htmlFor="r-name" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("full_name")}</Label>
              <Input id="r-name" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="register-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-email" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("email")}</Label>
              <Input id="r-email" type="email" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="register-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-phone" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("phone")}</Label>
              <Input id="r-phone" type="tel" className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-password" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("password")}</Label>
              <Input id="r-password" type="password" minLength={6} required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="register-password" />
            </div>
            <Button type="submit" className="w-full h-14 rounded-xl bg-emergency hover:bg-emergency/90 text-emergency-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-emergency/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={submitting} data-testid="register-submit">
              {submitting ? t("loading") : (<>{t("register_btn")} <ArrowRight className="h-4 w-4 ml-2" /></>)}
            </Button>
          </form>

          <div className="text-center text-sm font-medium border-t border-border pt-8">
            <span className="text-muted-foreground">{t("have_account")} </span>
            <Link to="/login" className="text-emergency font-bold hover:text-emergency/80 transition-colors" data-testid="link-login">{t("nav_login")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
