import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
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
      <div className="mx-auto max-w-2xl px-4 py-24 text-center" data-testid="cart-empty">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
          <ShoppingCart className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="font-display font-extrabold text-3xl">{t("cart_empty")}</h1>
        <Button asChild className="mt-6">
          <Link to="/services">{t("cart_empty_cta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16" data-testid="cart-page">
      <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl mb-8">{t("cart_title")}</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div
              key={`${it.item_type}-${it.item_id}`}
              className="flex gap-4 p-4 rounded-xl border border-border bg-card"
              data-testid={`cart-item-${it.item_id}`}
            >
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                {it.image_url && <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold truncate">{it.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{t(`cat_${it.item_type === "service" ? "plomberie" : "all"}`).replace(/^./, "") || it.item_type}</div>
                <div className="mt-2 font-display font-bold text-lg">{(it.price * it.quantity).toFixed(2)} €</div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <Button variant="ghost" size="icon" onClick={() => remove(it.item_id, it.item_type)} data-testid={`remove-${it.item_id}`}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={() => update(it.item_id, it.item_type, it.quantity - 1)}
                    className="p-1.5 hover:bg-muted transition-colors"
                    aria-label="-"
                    data-testid={`decrease-${it.item_id}`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-sm font-semibold tabular-nums">{it.quantity}</span>
                  <button
                    onClick={() => update(it.item_id, it.item_type, it.quantity + 1)}
                    className="p-1.5 hover:bg-muted transition-colors"
                    aria-label="+"
                    data-testid={`increase-${it.item_id}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary / Checkout */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("cart_subtotal")}</span>
              <span className="tabular-nums">{subtotal.toFixed(2)} €</span>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between font-display font-bold text-lg">
              <span>{t("cart_total")}</span>
              <span className="tabular-nums">{subtotal.toFixed(2)} €</span>
            </div>
            {!checkout && (
              <Button className="w-full mt-5" onClick={handleCheckout} data-testid="checkout-btn">
                {t("cart_checkout")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <Button variant="ghost" asChild className="w-full mt-2">
              <Link to="/services">{t("cart_continue")}</Link>
            </Button>
          </div>

          {checkout && (
            <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-3 animate-fade-up" data-testid="checkout-form">
              <h3 className="font-display font-bold text-lg mb-3">{t("checkout_title")}</h3>
              <div>
                <Label htmlFor="address">{t("address")}</Label>
                <Input id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} data-testid="checkout-address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="postal_code">{t("postal_code")}</Label>
                  <Input id="postal_code" required value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting} data-testid="submit-order">
                {submitting ? t("loading") : t("submit_order")}
              </Button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
