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

const MOCK_ORDERS = [
  { id: "ord-8524", created_at: new Date(Date.now() - 86400000 * 2).toISOString(), status: "completed", total: 129.00, address: "12 Rue de Rivoli, Paris", items: [1, 2] },
  { id: "ord-9631", created_at: new Date(Date.now() - 86400000 * 15).toISOString(), status: "completed", total: 59.50, address: "12 Rue de Rivoli, Paris", items: [1] }
];

const MOCK_INTERVENTIONS = [
  { id: "iv-7412", created_at: new Date().toISOString(), status: "pending", service_category: "plomberie", urgent: true, description: "Fuite d'eau importante sous l'évier de la cuisine.", address: "12 Rue de Rivoli", postal_code: "75004", city: "Paris" }
];

export default function Account() {
  const { t } = useLang();
  const { user, refresh } = useAuth();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [interventions, setInterventions] = useState(MOCK_INTERVENTIONS);
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });

  useEffect(() => {
    api.get("/orders/me")
      .then(({ data }) => { if (data && data.length > 0) setOrders(data); })
      .catch(() => {});
    api.get("/interventions/me")
      .then(({ data }) => { if (data && data.length > 0) setInterventions(data); })
      .catch(() => {});
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-24" data-testid="account-page">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-3">Espace Client</div>
          <h1 className="font-display font-black tracking-tight text-4xl sm:text-6xl leading-none">Ravi de vous revoir, <span className="text-primary">{user.name.split(" ")[0]}</span></h1>
        </div>
        <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-2xl border border-border">
           <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl">
             {user.name.charAt(0)}
           </div>
           <div className="pr-4">
             <div className="text-sm font-bold leading-none">{user.name}</div>
             <div className="text-[10px] uppercase font-black text-muted-foreground mt-1">{user.role === "admin" ? "Administrateur" : "Membre Premium"}</div>
           </div>
        </div>
      </header>

      <Tabs defaultValue="orders" className="space-y-10">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-2xl bg-muted/50 p-1 text-muted-foreground border border-border">
          <TabsTrigger value="orders" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm" data-testid="tab-orders"><Package className="h-4 w-4 mr-2" />{t("account_orders")}</TabsTrigger>
          <TabsTrigger value="interventions" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm" data-testid="tab-interventions"><Wrench className="h-4 w-4 mr-2" />{t("account_interventions")}</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm" data-testid="tab-profile"><User className="h-4 w-4 mr-2" />{t("account_profile")}</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm" data-testid="tab-security"><Lock className="h-4 w-4 mr-2" />{t("account_security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4 outline-none" data-testid="orders-list">
          {orders.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground rounded-3xl border-2 border-dashed border-border bg-muted/20">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <div className="font-bold">Aucune commande pour le moment</div>
            </div>
          ) : orders.map((o) => (
            <div key={o.id} className="group rounded-3xl border border-border p-6 sm:p-8 bg-card flex flex-wrap gap-6 justify-between items-center transition-all hover:border-primary/30 hover:shadow-xl">
              <div className="flex gap-6 items-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-black text-xl tracking-tight">#{o.id.toUpperCase()}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-[10px] uppercase font-black text-muted-foreground mt-2 tracking-widest">
                    {new Date(o.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })} · {o.items.length} article(s)
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="font-display font-black text-3xl tracking-tighter tabular-nums text-primary">{o.total.toFixed(2)} €</div>
                <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest h-8 px-4 group-hover:bg-primary group-hover:text-white transition-all">Détails</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4 outline-none" data-testid="interventions-list">
          {interventions.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground rounded-3xl border-2 border-dashed border-border bg-muted/20">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <div className="font-bold">Aucune demande d&apos;intervention</div>
            </div>
          ) : interventions.map((iv) => (
            <div key={iv.id} className="rounded-3xl border border-border p-6 sm:p-8 bg-card transition-all hover:border-primary/30 hover:shadow-xl relative overflow-hidden">
              {iv.urgent && <div className="absolute top-0 right-0 px-4 py-1 bg-emergency text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">Urgent</div>}
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex gap-6 items-center">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${iv.urgent ? "bg-emergency/10 text-emergency" : "bg-primary/10 text-primary"}`}>
                    <Wrench className="h-8 w-8" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-black text-xl tracking-tight">#{iv.id.toUpperCase()}</span>
                      <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest">{t(`cat_${iv.service_category}`)}</Badge>
                      <StatusBadge status={iv.status} />
                    </div>
                    <div className="text-[10px] uppercase font-black text-muted-foreground mt-2 tracking-widest">
                      Demande envoyée le {new Date(iv.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <Button className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">Suivre l'artisan</Button>
              </div>
              <div className="mt-8 pt-8 border-t border-border/50 grid sm:grid-cols-2 gap-8">
                <div>
                  <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2 block">Description</Label>
                  <p className="text-sm font-medium leading-relaxed">{iv.description}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-2 block">Lieu d'intervention</Label>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <MapPin className="h-4 w-4 text-primary" />
                    {iv.address}, {iv.postal_code} {iv.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="profile" className="outline-none">
          <div className="grid lg:grid-cols-12 gap-12">
            <form onSubmit={saveProfile} className="lg:col-span-7 rounded-3xl border border-border bg-card p-8 sm:p-12 space-y-8 shadow-xl" data-testid="profile-form">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Email (non modifiable)</Label>
                  <div className="flex items-center gap-3 h-14 px-5 rounded-2xl bg-muted/50 border border-border text-muted-foreground font-bold">
                    <Mail className="h-4 w-4" /> {user.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-name" className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("full_name")}</Label>
                  <Input id="p-name" className="h-14 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-phone" className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="p-phone" className="h-14 pl-12 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <Button type="submit" className="h-14 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20" data-testid="save-profile">{t("save_changes")}</Button>
            </form>
            
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-border bg-foreground text-background p-8 relative overflow-hidden shadow-2xl">
                 <ShieldCheck className="h-12 w-12 text-primary mb-6" />
                 <h3 className="font-display font-black text-2xl mb-3">Compte Vérifié</h3>
                 <p className="text-sm opacity-70 leading-relaxed font-medium">Votre profil a été validé. Vous bénéficiez de notre garantie travaux sur toutes vos interventions passées et futures.</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-8">
                 <h3 className="font-display font-bold text-lg mb-4">Avantages Membre</h3>
                 <ul className="space-y-3">
                   {[ "Support prioritaire 24/7", "Historique centralisé", "Paiement sécurisé", "Artisans certifiés RGE" ].map((fav, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm font-bold">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {fav}
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="outline-none">
          <form onSubmit={changePassword} className="max-w-2xl rounded-3xl border border-border bg-card p-8 sm:p-12 space-y-8 shadow-xl">
            <header>
              <h3 className="font-display font-black text-3xl tracking-tight mb-2">{t("change_password")}</h3>
              <p className="text-muted-foreground font-medium">Protégez l'accès à votre compte client.</p>
            </header>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cp" className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("current_password")}</Label>
                <Input id="cp" type="password" required className="h-14 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np" className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("new_password")}</Label>
                <Input id="np" type="password" minLength={6} required className="h-14 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="h-14 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">{t("change_password")}</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
