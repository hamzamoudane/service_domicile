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
    <div className="mx-auto max-w-md px-4 py-16" data-testid="register-page">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
          <UserPlus className="h-7 w-7" />
        </div>
        <h1 className="font-display font-extrabold text-3xl">{t("register_title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("register_subtitle")}</p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 sm:p-8" data-testid="register-form">
        <div>
          <Label htmlFor="r-name">{t("full_name")}</Label>
          <Input id="r-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="register-name" />
        </div>
        <div>
          <Label htmlFor="r-email">{t("email")}</Label>
          <Input id="r-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="register-email" />
        </div>
        <div>
          <Label htmlFor="r-phone">{t("phone")}</Label>
          <Input id="r-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="r-password">{t("password")}</Label>
          <Input id="r-password" type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="register-password" />
        </div>
        <Button type="submit" className="w-full" disabled={submitting} data-testid="register-submit">
          {submitting ? t("loading") : (<>{t("register_btn")} <ArrowRight className="h-4 w-4 ml-2" /></>)}
        </Button>
        <div className="pt-2 text-center text-sm">
          <span className="text-muted-foreground">{t("have_account")} </span>
          <Link to="/login" className="text-primary font-semibold hover:underline" data-testid="link-login">{t("nav_login")}</Link>
        </div>
      </form>
    </div>
  );
}
