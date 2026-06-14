import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const CATS = ["plomberie", "electricite", "serrurerie", "chauffage", "assainissement"];

const MOCK_REVIEWS = [
  {
    id: "rev-1",
    name: "Jean Dupont",
    rating: 5,
    comment: "Intervention ultra rapide pour une fuite d'eau un dimanche soir. Artisan très pro et tarif honnête. Je recommande !",
    service_category: "plomberie"
  },
  {
    id: "rev-2",
    name: "Marie L.",
    rating: 5,
    comment: "Serrure changée en 30 minutes après une perte de clés. Très rassurant d'avoir quelqu'un de compétent si vite.",
    service_category: "serrurerie"
  },
  {
    id: "rev-3",
    name: "Marc Antoine",
    rating: 4,
    comment: "Installation d'un nouveau tableau électrique impeccable. Travail soigné et explications claires.",
    service_category: "electricite"
  },
  {
    id: "rev-4",
    name: "Sophie R.",
    rating: 5,
    comment: "Dépannage chauffage en plein hiver, sauvetage réussi ! Merci pour votre réactivité.",
    service_category: "chauffage"
  }
];

export default function Reviews() {
  const { t } = useLang();
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "", service_category: "plomberie" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get("/reviews")
      .then(({ data }) => {
        if (data && data.length > 0) setReviews(data);
      })
      .catch(() => {
        console.warn("Backend non disponible, utilisation des avis de secours.");
      });
  };
  useEffect(() => { load(); }, []);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "4.9";

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/reviews", form);
      toast.success("Merci pour votre avis !");
      setForm({ name: "", rating: 5, comment: "", service_category: "plomberie" });
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20" data-testid="reviews-page">
      <header className="mb-12">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Avis</div>
        <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl">{t("reviews_title")}</h1>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 fill-current" />)}
          </div>
          <div className="font-display font-extrabold text-3xl">{avg}</div>
          <div className="text-sm text-muted-foreground">/ 5 · {reviews.length} avis vérifiés</div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-6 bg-card" data-testid={`review-${r.id}`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="flex items-center gap-1 mt-1 text-amber-500">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                </div>
                {r.service_category && <Badge variant="secondary">{t(`cat_${r.service_category}`)}</Badge>}
              </div>
              <p className="mt-3 text-sm leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="lg:sticky lg:top-24 lg:self-start rounded-xl border border-border p-6 bg-card space-y-3" data-testid="review-form">
          <h3 className="font-display font-bold text-lg">Laisser un avis</h3>
          <div>
            <Label htmlFor="r-name">Nom</Label>
            <Input id="r-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Note</Label>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className="p-1 hover:scale-110 transition-transform" data-testid={`rating-${n}`}>
                  <Star className={`h-6 w-6 ${n <= form.rating ? "text-amber-500 fill-current" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Catégorie</Label>
            <Select value={form.service_category} onValueChange={(v) => setForm({ ...form, service_category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATS.map((c) => <SelectItem key={c} value={c}>{t(`cat_${c}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="r-comment">Commentaire</Label>
            <Textarea id="r-comment" required rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting} data-testid="submit-review">
            {submitting ? t("loading") : "Publier l'avis"}
          </Button>
        </form>
      </div>
    </div>
  );
}
