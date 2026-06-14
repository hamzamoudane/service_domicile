import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Phone, AlertTriangle, FileText, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CATS = ["plomberie", "electricite", "serrurerie", "chauffage", "assainissement"];

export default function InterventionRequest() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    address: "", city: "", postal_code: "",
    service_category: params.get("cat") || "plomberie",
    service_id: params.get("service") || "",
    description: "", preferred_date: "",
    urgent: false, quote_only: false,
  });

  useEffect(() => {
    if (user) {
      const [first, ...rest] = (user.name || "").split(" ");
      setForm((f) => ({ ...f, first_name: first || "", last_name: rest.join(" "), email: user.email, phone: user.phone || "" }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/interventions", form);
      toast.success(t("intervention_success"));
      setSubmitted(true);
      setTimeout(() => navigate(user ? "/account/interventions" : "/"), 1800);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20" data-testid="intervention-page">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Form */}
        <div className="lg:col-span-8">
          {submitted && (
            <div data-testid="iv-success" className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-600 font-bold flex items-center gap-3 animate-fade-up">
              <ShieldCheck className="h-6 w-6" /> {t("intervention_success")}
            </div>
          )}
          
          <header className="mb-10">
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-3">Service d'urgence</div>
            <h1 className="font-display font-black tracking-tight text-4xl sm:text-6xl leading-none">{t("intervention_title")}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{t("intervention_subtitle")}</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10 rounded-3xl border border-border bg-card p-6 sm:p-12 shadow-xl" data-testid="intervention-form">
            {/* Coordonnées */}
            <fieldset className="space-y-6">
              <legend className="font-display font-black text-xl mb-6 flex items-center gap-3 text-primary">
                <span className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm shadow-lg shadow-primary/20">1</span>
                Vos coordonnées
              </legend>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("first_name")}</Label>
                  <Input id="first_name" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} data-testid="iv-first-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("last_name")}</Label>
                  <Input id="last_name" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} data-testid="iv-last-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("email")}</Label>
                  <Input id="email" type="email" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="iv-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("phone")}</Label>
                  <Input id="phone" type="tel" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="iv-phone" />
                </div>
              </div>
            </fieldset>

            {/* Adresse */}
            <fieldset className="space-y-6 pt-6 border-t border-border/50">
              <legend className="font-display font-black text-xl mb-6 flex items-center gap-3 text-primary">
                <span className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm shadow-lg shadow-primary/20">2</span>
                Lieu d'intervention
              </legend>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("address")}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="address" required className="h-12 pl-11 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} data-testid="iv-address" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("postal_code")}</Label>
                    <Input id="postal_code" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} data-testid="iv-postal-code" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("city")}</Label>
                    <Input id="city" required className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} data-testid="iv-city" />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Détails */}
            <fieldset className="space-y-6 pt-6 border-t border-border/50">
              <legend className="font-display font-black text-xl mb-6 flex items-center gap-3 text-primary">
                <span className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm shadow-lg shadow-primary/20">3</span>
                Détails du problème
              </legend>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("intervention_type")}</Label>
                  <Select value={form.service_category} onValueChange={(v) => setForm({ ...form, service_category: v })}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" data-testid="iv-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATS.map((c) => <SelectItem key={c} value={c}>{t(`cat_${c}`)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("intervention_description")}</Label>
                  <Textarea id="description" required rows={4} className="rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="iv-description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_date" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{t("intervention_date")}</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="preferred_date" type="datetime-local" className="h-12 pl-11 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-colors" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <label className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${form.urgent ? "border-emergency bg-emergency/5 ring-1 ring-emergency" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}>
                    <Checkbox checked={form.urgent} onCheckedChange={(v) => setForm({ ...form, urgent: !!v })} data-testid="iv-urgent" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                        <AlertTriangle className={`h-4 w-4 ${form.urgent ? "text-emergency" : "text-muted-foreground"}`} /> {t("intervention_urgent")}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2 leading-relaxed font-medium">Rappel sous 15 min, arrivée artisan sous 60 min.</div>
                    </div>
                  </label>
                  <label className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${form.quote_only ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}>
                    <Checkbox checked={form.quote_only} onCheckedChange={(v) => setForm({ ...form, quote_only: !!v })} data-testid="iv-quote-only" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                        <FileText className={`h-4 w-4 ${form.quote_only ? "text-primary" : "text-muted-foreground"}`} /> {t("intervention_quote")}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2 leading-relaxed font-medium">Devis précis sans engagement, gratuité totale.</div>
                    </div>
                  </label>
                </div>
              </div>
            </fieldset>

            <Button type="submit" size="lg" className="w-full h-16 rounded-2xl bg-emergency hover:bg-emergency/90 text-emergency-foreground font-black uppercase tracking-widest text-sm shadow-2xl shadow-emergency/20 transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={submitting} data-testid="iv-submit">
              {submitting ? t("loading") : (<><Phone className="h-5 w-5 mr-3" />{t("intervention_submit")} <ArrowRight className="h-5 w-5 ml-3" /></>)}
            </Button>
          </form>
        </div>

        {/* Right Side: Reassurance */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border bg-foreground text-background p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="h-24 w-24" />
            </div>
            <h3 className="font-display font-black text-2xl mb-6">Garanties SOS Dépannage</h3>
            <ul className="space-y-6">
              {[
                { icon: Clock, title: "Rapidité extrême", desc: "Le plus grand réseau d'artisans en France pour vous servir." },
                { icon: ShieldCheck, title: "Artisans certifiés", desc: "Chaque professionnel est rigoureusement contrôlé et assuré." },
                { icon: Award, title: "Prix fixes et justes", desc: "Aucune surprise : vous validez le devis avant tout travaux." }
              ].map((g, i) => {
                const Icon = g.icon;
                return (
                  <li key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{g.title}</div>
                      <div className="text-xs opacity-70 mt-1 leading-relaxed">{g.desc}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
            <h3 className="font-display font-bold text-lg mb-4">Besoin de conseils ?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">Nos experts vous guident par téléphone pour sécuriser votre installation en attendant l'artisan.</p>
            <a href="tel:+33180888888" className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted font-black text-lg hover:bg-primary hover:text-primary-foreground transition-all">
              <Phone className="h-5 w-5" /> 01 80 88 88 88
            </a>
          </div>

          <div className="rounded-3xl overflow-hidden aspect-square border border-border shadow-inner relative group">
            <img 
              src="https://images.unsplash.com/photo-1504148455328-497c5efdf156" 
              alt="Tools" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-white font-bold text-lg">Qualité Professionnelle</div>
              <div className="text-white/70 text-xs mt-1">Matériel certifié et durable</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
