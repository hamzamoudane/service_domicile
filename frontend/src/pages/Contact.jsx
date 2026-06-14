import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      toast.success(t("contact_sent"));
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative" data-testid="contact-page">
      <div className="h-64 sm:h-96 w-full relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1526821799652-2dc51675628e" 
          alt="France" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
          <div className="max-w-3xl">
            <h1 className="font-display font-black tracking-tight text-white text-4xl sm:text-6xl lg:text-7xl leading-none">{t("contact_title")}</h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 font-medium">{t("contact_subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-4 space-y-4">
            {[
              { icon: Phone, label: "Téléphone", value: "01 80 88 88 88", href: "tel:+33180888888", color: "bg-emergency/10 text-emergency" },
              { icon: Mail, label: "Email", value: "contact@sos-depannage.fr", href: "mailto:contact@sos-depannage.fr", color: "bg-primary/10 text-primary" },
              { icon: Clock, label: "Horaires", value: "24h/24 — 7j/7", color: "bg-amber-500/10 text-amber-500" },
              { icon: MapPin, label: "Couverture", value: "Toute la France métropolitaine", color: "bg-emerald-500/10 text-emerald-500" },
            ].map((c, i) => {
              const Icon = c.icon;
              const inner = (
                <div className="flex items-start gap-4 p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all shadow-sm hover:shadow-md">
                  <div className={`h-12 w-12 rounded-xl ${c.color} flex items-center justify-center shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{c.label}</div>
                    <div className="mt-1 font-bold text-lg">{c.value}</div>
                  </div>
                </div>
              );
              return c.href ? <a key={i} href={c.href} className="block">{inner}</a> : <div key={i}>{inner}</div>;
            })}
          </aside>

          <div className="lg:col-span-8">
            <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-8 sm:p-12 space-y-6 shadow-2xl" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="c-name" className="text-xs font-bold uppercase tracking-wider">{t("full_name")}</Label>
                  <Input id="c-name" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email" className="text-xs font-bold uppercase tracking-wider">{t("email")}</Label>
                  <Input id="c-email" type="email" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="c-phone" className="text-xs font-bold uppercase tracking-wider">{t("phone")}</Label>
                  <Input id="c-phone" type="tel" className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-subject" className="text-xs font-bold uppercase tracking-wider">{t("contact_subject")}</Label>
                  <Input id="c-subject" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-message" className="text-xs font-bold uppercase tracking-wider">{t("contact_message")}</Label>
                <Textarea id="c-message" required rows={6} className="rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto px-12 h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs" disabled={submitting} data-testid="contact-submit">
                {submitting ? t("loading") : t("contact_send")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
