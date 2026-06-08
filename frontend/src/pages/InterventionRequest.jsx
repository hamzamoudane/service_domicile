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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16" data-testid="intervention-page">
      {submitted && (
        <div data-testid="iv-success" className="mb-6 rounded-xl border border-success/30 bg-success/10 p-5 text-sm font-medium animate-fade-up">
          ✓ {t("intervention_success")}
        </div>
      )}
      <header className="mb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Demande</div>
        <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl">{t("intervention_title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("intervention_subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-10" data-testid="intervention-form">
        {/* Coordonnées */}
        <fieldset className="space-y-4">
          <legend className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
            Vos coordonnées
          </legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">{t("first_name")}</Label>
              <Input id="first_name" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} data-testid="iv-first-name" />
            </div>
            <div>
              <Label htmlFor="last_name">{t("last_name")}</Label>
              <Input id="last_name" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} data-testid="iv-last-name" />
            </div>
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="iv-email" />
            </div>
            <div>
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="iv-phone" />
            </div>
          </div>
        </fieldset>

        {/* Adresse */}
        <fieldset className="space-y-4">
          <legend className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
            <MapPin className="h-4 w-4" /> Adresse d'intervention
          </legend>
          <div>
            <Label htmlFor="address">{t("address")}</Label>
            <Input id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} data-testid="iv-address" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal_code">{t("postal_code")}</Label>
              <Input id="postal_code" required value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} data-testid="iv-postal-code" />
            </div>
            <div>
              <Label htmlFor="city">{t("city")}</Label>
              <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} data-testid="iv-city" />
            </div>
          </div>
        </fieldset>

        {/* Détails */}
        <fieldset className="space-y-4">
          <legend className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
            <FileText className="h-4 w-4" /> Détails de l'intervention
          </legend>
          <div>
            <Label>{t("intervention_type")}</Label>
            <Select value={form.service_category} onValueChange={(v) => setForm({ ...form, service_category: v })}>
              <SelectTrigger data-testid="iv-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATS.map((c) => <SelectItem key={c} value={c}>{t(`cat_${c}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">{t("intervention_description")}</Label>
            <Textarea id="description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="iv-description" />
          </div>
          <div>
            <Label htmlFor="preferred_date">{t("intervention_date")}</Label>
            <Input id="preferred_date" type="datetime-local" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.urgent ? "border-emergency bg-emergency/5" : "border-border hover:bg-muted/40"}`}>
              <Checkbox checked={form.urgent} onCheckedChange={(v) => setForm({ ...form, urgent: !!v })} data-testid="iv-urgent" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <AlertTriangle className="h-4 w-4 text-emergency" /> {t("intervention_urgent")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Rappel sous 15 minutes, intervention prioritaire 30 à 60 min.</div>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.quote_only ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
              <Checkbox checked={form.quote_only} onCheckedChange={(v) => setForm({ ...form, quote_only: !!v })} data-testid="iv-quote-only" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <FileText className="h-4 w-4 text-primary" /> {t("intervention_quote")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Devis gratuit et sans engagement sous 24h.</div>
              </div>
            </label>
          </div>
        </fieldset>

        <Button type="submit" size="lg" className="w-full h-12 bg-emergency text-emergency-foreground hover:bg-emergency/90" disabled={submitting} data-testid="iv-submit">
          {submitting ? t("loading") : (<><Phone className="h-4 w-4 mr-2" />{t("intervention_submit")} <ArrowRight className="h-4 w-4 ml-2" /></>)}
        </Button>
      </form>
    </div>
  );
}
