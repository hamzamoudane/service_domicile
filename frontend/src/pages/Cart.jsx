import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Cart() {
  const { t } = useLang();
  const { items, update, remove, clear, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ address: "", city: "", postal_code: "", phone: "", notes: "" });

  const handleCheckout = () => {
    if (!user) {
      toast.info(t("login_title"));
      navigate("/login?next=/cart");
      return;
    }
    setCheckout(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info(t("login_title"));
      navigate("/login?next=/cart");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/orders", { items, ...form });
      toast.success(t("order_success"));
      clear();
      navigate("/account/orders");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center" data-testid="cart-empty">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/5 text-primary mb-8 animate-bounce">
          <ShoppingCart className="h-10 w-10" />
        </div>
        <h1 className="font-display font-black tracking-tight text-4xl sm:text-5xl leading-none">{t("cart_empty")}</h1>
        <p className="mt-4 text-muted-foreground text-lg">{t("cart_empty_cta_desc") || "Votre panier attend d'être rempli par nos prestations d'excellence."}</p>
        <Button asChild size="lg" className="mt-10 h-14 px-8 rounded-xl font-black uppercase tracking-widest text-xs">
          <Link to="/services">{t("cart_empty_cta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-24" data-testid="cart-page">
      <header className="mb-12">
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-3">Récapitulatif</div>
        <h1 className="font-display font-black tracking-tight text-4xl sm:text-6xl leading-none">{t("cart_title")}</h1>
      </header>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-4">
          {items.map((it) => (
            <div
              key={`${it.item_type}-${it.item_id}`}
              className="group flex gap-6 p-6 rounded-3xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-xl"
              data-testid={`cart-item-${it.item_id}`}
            >
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border">
                {it.image_url && <img src={it.image_url} alt={it.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="font-display font-black text-lg sm:text-xl truncate tracking-tight">{it.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 font-bold">{it.item_type === "service" ? "Prestation de service" : "Produit boutique"}</div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-border rounded-xl bg-muted/30 p-1">
                    <button
                      onClick={() => update(it.item_id, it.item_type, it.quantity - 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                      aria-label="-"
                      data-testid={`decrease-${it.item_id}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-sm font-black tabular-nums">{it.quantity}</span>
                    <button
                      onClick={() => update(it.item_id, it.item_type, it.quantity + 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                      aria-label="+"
                      data-testid={`increase-${it.item_id}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="font-display font-black text-xl tracking-tighter">{(it.price * it.quantity).toFixed(2)} €</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" onClick={() => remove(it.item_id, it.item_type)} data-testid={`remove-${it.item_id}`}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary / Checkout */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <h3 className="font-display font-black text-xl mb-6 relative">Résumé de la commande</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{t("cart_subtotal")}</span>
                <span className="tabular-nums font-bold font-display">{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Frais de traitement</span>
                <span className="tabular-nums font-bold font-display">Offerts</span>
              </div>
              <div className="pt-6 border-t border-border flex justify-between items-baseline font-display font-black text-2xl tracking-tighter">
                <span>{t("cart_total")}</span>
                <span className="tabular-nums">{subtotal.toFixed(2)} €</span>
              </div>
            </div>
            
            {!checkout && (
              <Button className="w-full mt-8 h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={handleCheckout} data-testid="checkout-btn">
                {t("cart_checkout")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            
            <Button variant="ghost" asChild className="w-full mt-3 h-12 rounded-xl text-xs font-bold uppercase tracking-widest">
              <Link to="/services">{t("cart_continue")}</Link>
            </Button>
          </div>

          {checkout && (
            <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-foreground text-background p-8 space-y-6 animate-fade-up shadow-2xl" data-testid="checkout-form">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="font-display font-black text-xl">{t("checkout_title")}</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[10px] uppercase tracking-widest font-black opacity-60">Adresse de facturation</Label>
                  <Input id="address" required className="bg-white/10 border-white/20 text-white h-12 rounded-xl focus:bg-white/20 transition-all" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} data-testid="checkout-address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-[10px] uppercase tracking-widest font-black opacity-60">Code postal</Label>
                    <Input id="postal_code" required className="bg-white/10 border-white/20 text-white h-12 rounded-xl focus:bg-white/20 transition-all" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[10px] uppercase tracking-widest font-black opacity-60">Ville</Label>
                    <Input id="city" required className="bg-white/10 border-white/20 text-white h-12 rounded-xl focus:bg-white/20 transition-all" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest font-black opacity-60">{t("phone")}</Label>
                  <Input id="phone" type="tel" required className="bg-white/10 border-white/20 text-white h-12 rounded-xl focus:bg-white/20 transition-all" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[10px] uppercase tracking-widest font-black opacity-60">{t("notes")}</Label>
                  <Textarea id="notes" rows={2} className="bg-white/10 border-white/20 text-white rounded-xl focus:bg-white/20 transition-all resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={submitting} data-testid="submit-order">
                {submitting ? t("loading") : t("submit_order")}
              </Button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
