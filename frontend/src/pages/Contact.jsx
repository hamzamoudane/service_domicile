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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20" data-testid="contact-page">
      <header className="mb-12">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Contact</div>
        <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl">{t("contact_title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("contact_subtitle")}</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-10">
        <aside className="lg:col-span-2 space-y-4">
          {[
            { icon: Phone, label: "Téléphone", value: "01 80 88 88 88", href: "tel:+33180888888" },
            { icon: Mail, label: "Email", value: "contact@sos-depannage.fr", href: "mailto:contact@sos-depannage.fr" },
            { icon: Clock, label: "Horaires", value: "24h/24 — 7j/7" },
            { icon: MapPin, label: "Couverture", value: "Toute la France métropolitaine" },
          ].map((c, i) => {
            const Icon = c.icon;
            const inner = (
              <div className="flex items-start gap-3 p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  <div className="mt-1 font-semibold">{c.value}</div>
                </div>
              </div>
            );
            return c.href ? <a key={i} href={c.href}>{inner}</a> : <div key={i}>{inner}</div>;
          })}
          <div className="aspect-video rounded-xl overflow-hidden border border-border">
            <iframe
              title="Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-5,41,10,52&layer=mapnik"
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </aside>

        <form onSubmit={submit} className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 sm:p-10 space-y-4" data-testid="contact-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="c-name">{t("full_name")}</Label>
              <Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" />
            </div>
            <div>
              <Label htmlFor="c-email">{t("email")}</Label>
              <Input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="c-phone">{t("phone")}</Label>
              <Input id="c-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="c-subject">{t("contact_subject")}</Label>
              <Input id="c-subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="c-message">{t("contact_message")}</Label>
            <Textarea id="c-message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" />
          </div>
          <Button type="submit" size="lg" disabled={submitting} data-testid="contact-submit">
            {submitting ? t("loading") : t("contact_send")}
          </Button>
        </form>
      </div>
    </div>
  );
}
