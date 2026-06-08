import React, { useEffect, useState } from "react";
import { User, Package, Wrench, Lock, Mail, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const STATUS_VARIANT = {
  pending: "secondary",
  confirmed: "default",
  in_progress: "default",
  processing: "default",
  completed: "default",
  cancelled: "destructive",
};

function StatusBadge({ status }) {
  const { t } = useLang();
  return <Badge variant={STATUS_VARIANT[status] || "outline"}>{t(`status_${status}`)}</Badge>;
}

export default function Account() {
  const { t } = useLang();
  const { user, refresh } = useAuth();
  const [orders, setOrders] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });

  useEffect(() => {
    api.get("/orders/me").then(({ data }) => setOrders(data)).catch(() => {});
    api.get("/interventions/me").then(({ data }) => setInterventions(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) setProfile({ name: user.name, phone: user.phone || "" });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch("/auth/profile", profile);
      await refresh();
      toast.success("Profil mis à jour");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/change-password", pwForm);
      setPwForm({ current_password: "", new_password: "" });
      toast.success("Mot de passe modifié");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16" data-testid="account-page">
      <header className="mb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Espace personnel</div>
        <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl">{t("account_title")}</h1>
        <p className="mt-3 text-muted-foreground">Bonjour {user.name}</p>
      </header>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="orders" data-testid="tab-orders"><Package className="h-4 w-4 mr-1.5" />{t("account_orders")}</TabsTrigger>
          <TabsTrigger value="interventions" data-testid="tab-interventions"><Wrench className="h-4 w-4 mr-1.5" />{t("account_interventions")}</TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile"><User className="h-4 w-4 mr-1.5" />{t("account_profile")}</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security"><Lock className="h-4 w-4 mr-1.5" />{t("account_security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3" data-testid="orders-list">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-xl border border-dashed border-border">
              Aucune commande pour le moment
            </div>
          ) : orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border p-5 bg-card flex flex-wrap gap-4 justify-between items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold">#{o.id.slice(0, 8).toUpperCase()}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(o.created_at).toLocaleString("fr-FR")} · {o.items.length} article(s) · {o.address}
                </div>
              </div>
              <div className="font-display font-extrabold text-xl tabular-nums">{o.total.toFixed(2)} €</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="interventions" className="space-y-3" data-testid="interventions-list">
          {interventions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-xl border border-dashed border-border">
              Aucune demande d&apos;intervention
            </div>
          ) : interventions.map((iv) => (
            <div key={iv.id} className="rounded-xl border border-border p-5 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold">#{iv.id.slice(0, 8).toUpperCase()}</span>
                  <Badge variant="outline">{t(`cat_${iv.service_category}`)}</Badge>
                  <StatusBadge status={iv.status} />
                  {iv.urgent && <Badge className="bg-emergency text-emergency-foreground border-0">Urgent</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(iv.created_at).toLocaleString("fr-FR")}</div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{iv.description}</p>
              <div className="mt-2 text-xs text-muted-foreground">{iv.address}, {iv.postal_code} {iv.city}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="profile">
          <form onSubmit={saveProfile} className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-xl" data-testid="profile-form">
            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div>
              <Label htmlFor="p-name">{t("full_name")}</Label>
              <Input id="p-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="p-phone">{t("phone")}</Label>
              <Input id="p-phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <Button type="submit" data-testid="save-profile">{t("save_changes")}</Button>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={changePassword} className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-xl">
            <h3 className="font-display font-bold text-lg">{t("change_password")}</h3>
            <div>
              <Label htmlFor="cp">{t("current_password")}</Label>
              <Input id="cp" type="password" required value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="np">{t("new_password")}</Label>
              <Input id="np" type="password" minLength={6} required value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
            </div>
            <Button type="submit">{t("change_password")}</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
