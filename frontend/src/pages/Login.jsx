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
    <div className="mx-auto max-w-md px-4 py-16" data-testid="login-page">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="font-display font-extrabold text-3xl">{t("login_title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("login_subtitle")}</p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 sm:p-8" data-testid="login-form">
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="login-email" />
        </div>
        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="login-password" />
        </div>
        <Button type="submit" className="w-full" disabled={submitting} data-testid="login-submit">
          {submitting ? t("loading") : (<>{t("login_btn")} <ArrowRight className="h-4 w-4 ml-2" /></>)}
        </Button>
        <div className="pt-2 text-center text-sm">
          <span className="text-muted-foreground">{t("no_account")} </span>
          <Link to="/register" className="text-primary font-semibold hover:underline" data-testid="link-register">{t("nav_register")}</Link>
        </div>
      </form>

      <div className="mt-6 text-xs text-muted-foreground bg-muted/40 rounded-lg p-4 border border-border">
        <div className="font-semibold mb-2">Comptes de démonstration :</div>
        <div>Admin : <code className="text-foreground">admin@store.com</code> / Admin123!</div>
        <div>Client : <code className="text-foreground">client1@store.com</code> / Client123!</div>
      </div>
    </div>
  );
}
