import React, { useEffect, useState } from "react";
import {
  LayoutDashboard, Briefcase, Package, ShoppingBag, Wrench, Users,
  TrendingUp, AlertTriangle, Plus, Edit, Trash2, ShieldCheck, Power,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const CATS = ["plomberie", "electricite", "serrurerie", "chauffage", "assainissement"];
const ORDER_STATUSES = ["pending", "confirmed", "processing", "completed", "cancelled"];
const IV_STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

const MOCK_STATS = {
  orders_count: 142,
  pending_orders: 5,
  interventions_count: 850,
  pending_interventions: 12,
  urgent_interventions: 3,
  clients_count: 1240,
  revenue: 85400,
  top_services: [
    { _id: "plomberie", count: 320 },
    { _id: "serrurerie", count: 210 },
    { _id: "electricite", count: 180 },
    { _id: "chauffage", count: 90 },
    { _id: "assainissement", count: 50 }
  ],
  recent_orders: [
    { id: "ord-1", created_at: new Date().toISOString(), status: "pending", total: 249 },
    { id: "ord-2", created_at: new Date(Date.now() - 3600000).toISOString(), status: "completed", total: 129 },
    { id: "ord-3", created_at: new Date(Date.now() - 7200000).toISOString(), status: "confirmed", total: 59 }
  ],
  recent_interventions: [
    { id: "iv-1", first_name: "Jean", last_name: "Dupont", service_category: "serrurerie", status: "pending", created_at: new Date().toISOString() },
    { id: "iv-2", first_name: "Marie", last_name: "L.", service_category: "plomberie", status: "in_progress", created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: "iv-3", first_name: "Luc", last_name: "M.", service_category: "electricite", status: "completed", created_at: new Date(Date.now() - 86400000).toISOString() }
  ]
};

function StatusSelect({ value, onChange, options }) {
  const { t } = useLang();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((s) => <SelectItem key={s} value={s}>{t(`status_${s}`)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// ============ Dashboard ============
function Dashboard() {
  const { t } = useLang();
  const [stats, setStats] = useState(MOCK_STATS);

  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => {
        if (data) setStats(data);
      })
      .catch(() => {
        console.warn("Backend non disponible pour l'admin, utilisation des stats de secours.");
      });
  }, []);

  if (!stats) return <div className="text-muted-foreground">{t("loading")}</div>;

  const cards = [
    { label: t("admin_stats_orders"), value: stats.orders_count, icon: ShoppingBag, hint: `${stats.pending_orders} en attente` },
    { label: t("admin_stats_interventions"), value: stats.interventions_count, icon: Wrench, hint: `${stats.pending_interventions} en attente` },
    { label: t("admin_stats_clients"), value: stats.clients_count, icon: Users, hint: "Clients inscrits" },
    { label: t("admin_stats_revenue"), value: `${stats.revenue.toFixed(0)} €`, icon: TrendingUp, hint: "Commandes confirmées" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-card p-5" data-testid={`stat-${i}`}>
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 font-display font-extrabold text-3xl tabular-nums">{c.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
            </div>
          );
        })}
      </div>

      {stats.urgent_interventions > 0 && (
        <div className="rounded-xl border border-emergency/30 bg-emergency/5 p-5 flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-emergency mt-0.5" />
          <div>
            <div className="font-semibold">{stats.urgent_interventions} intervention(s) urgente(s) en attente</div>
            <div className="text-sm text-muted-foreground mt-0.5">Traitez-les en priorité depuis l&apos;onglet Interventions.</div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold mb-4">Top catégories d'intervention</h3>
          <div className="space-y-3">
            {(stats.top_services || []).map((s, i) => {
              const max = stats.top_services[0]?.count || 1;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{t(`cat_${s._id}`) || s._id}</span>
                    <span className="text-muted-foreground tabular-nums">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(s.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {(!stats.top_services || stats.top_services.length === 0) && <div className="text-sm text-muted-foreground">Aucune donnée encore</div>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold mb-4">Activité récente</h3>
          <div className="space-y-2">
            {[...stats.recent_orders.map(o => ({ ...o, type: "order" })), ...stats.recent_interventions.map(o => ({ ...o, type: "iv" }))]
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .slice(0, 6)
              .map((a) => (
                <div key={`${a.type}-${a.id}`} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {a.type === "order" ? <ShoppingBag className="h-4 w-4 text-primary shrink-0" /> : <Wrench className="h-4 w-4 text-emergency shrink-0" />}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.type === "order" ? `Commande #${a.id.slice(0,6)}` : `${a.first_name} ${a.last_name} · ${t(`cat_${a.service_category}`)}`}</div>
                      <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{t(`status_${a.status}`)}</Badge>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Services ============
function ServicesManager() {
  const { t } = useLang();
  const [items, setItems] = useState([
    { id: "s1", name_fr: "Dépannage Plomberie", category: "plomberie", price: 89, active: true },
    { id: "s2", name_fr: "Ouverture Porte", category: "serrurerie", price: 150, active: true },
    { id: "s3", name_fr: "Installation Prise", category: "electricite", price: 75, active: true }
  ]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const empty = { name_fr: "", name_en: "", description_fr: "", description_en: "", category: "plomberie", price: 0, price_label: "", image_url: "", active: true, popular: false };
  const [form, setForm] = useState(empty);

  const load = () => {
    api.get("/services")
      .then(({ data }) => { if (data && data.length > 0) setItems(data); })
      .catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (it) => { setEditing(it); setForm({ ...empty, ...it, price_label: it.price_label || "" }); setOpen(true); };

  const save = async () => {
    try {
      const payload = { ...form, price: Number(form.price), price_label: form.price_label || null };
      if (editing) await api.put(`/admin/services/${editing.id}`, payload);
      else await api.post("/admin/services", payload);
      toast.success("Prestation enregistrée");
      setOpen(false);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cette prestation ?")) return;
    try {
      await api.delete(`/admin/services/${id}`);
      load();
      toast.success("Supprimé");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-bold text-2xl">{t("admin_services")}</h2>
        <Button onClick={openCreate} data-testid="create-service-btn"><Plus className="h-4 w-4 mr-1" /> Nouvelle</Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name_fr}</TableCell>
                <TableCell><Badge variant="outline">{t(`cat_${s.category}`)}</Badge></TableCell>
                <TableCell>{s.price_label ? `${t("services_starting_from")} ` : ""}{s.price} €</TableCell>
                <TableCell>{s.active ? <Badge>Actif</Badge> : <Badge variant="secondary">Inactif</Badge>}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)} data-testid={`edit-service-${s.id}`}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(s.id)} data-testid={`delete-service-${s.id}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouvelle"} prestation</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Nom (FR)</Label><Input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} /></div>
            <div><Label>Nom (EN)</Label><Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Description (FR)</Label><Textarea value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Description (EN)</Label><Textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{t(`cat_${c}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Prix (€)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><Label>Préfixe prix (optionnel)</Label><Input placeholder='ex: "à partir de"' value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} /></div>
            <div><Label>URL Image</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Actif</Label></div>
            <div className="flex items-center gap-3"><Switch checked={form.popular} onCheckedChange={(v) => setForm({ ...form, popular: v })} /><Label>Mis en avant</Label></div>
          </div>
          <DialogFooter><Button onClick={save} data-testid="save-service">{t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Products ============
function ProductsManager() {
  const { t } = useLang();
  const [items, setItems] = useState([
    { id: "p1", name_fr: "Serrure A2P", category: "serrurerie", price: 249, stock: 15, active: true },
    { id: "p2", name_fr: "Mitigeur Chrome", category: "plomberie", price: 129, stock: 8, active: true }
  ]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const empty = { name_fr: "", name_en: "", description_fr: "", description_en: "", category: "plomberie", price: 0, stock: 0, images: [""], active: true };
  const [form, setForm] = useState(empty);

  const load = () => {
    api.get("/products")
      .then(({ data }) => { if (data && data.length > 0) setItems(data); })
      .catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (it) => { setEditing(it); setForm({ ...empty, ...it, images: it.images?.length ? it.images : [""] }); setOpen(true); };

  const save = async () => {
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: form.images.filter(Boolean) };
      if (editing) await api.put(`/admin/products/${editing.id}`, payload);
      else await api.post("/admin/products", payload);
      toast.success("Produit enregistré");
      setOpen(false); load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try { await api.delete(`/admin/products/${id}`); load(); toast.success("Supprimé"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-bold text-2xl">{t("admin_products")}</h2>
        <Button onClick={openCreate} data-testid="create-product-btn"><Plus className="h-4 w-4 mr-1" /> Nouveau</Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name_fr}</TableCell>
                <TableCell><Badge variant="outline">{t(`cat_${p.category}`)}</Badge></TableCell>
                <TableCell>{p.price} €</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.active ? <Badge>Actif</Badge> : <Badge variant="secondary">Inactif</Badge>}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)} data-testid={`edit-product-${p.id}`}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouveau"} produit</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Nom (FR)</Label><Input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} /></div>
            <div><Label>Nom (EN)</Label><Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Description (FR)</Label><Textarea value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Description (EN)</Label><Textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{t(`cat_${c}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Prix (€)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Actif</Label></div>
            <div className="sm:col-span-2">
              <Label>Images (URLs)</Label>
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2 mt-1">
                  <Input value={img} onChange={(e) => {
                    const next = [...form.images]; next[i] = e.target.value; setForm({ ...form, images: next });
                  }} />
                  {form.images.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setForm({ ...form, images: [...form.images, ""] })}>+ Ajouter</Button>
            </div>
          </div>
          <DialogFooter><Button onClick={save} data-testid="save-product">{t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Orders ============
function OrdersManager() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/orders").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/admin/orders/${id}`, { status }); load(); toast.success("Statut mis à jour"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-2xl">{t("admin_orders")}</h2>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div className="font-medium">{o.user_name}</div>
                  <div className="text-xs text-muted-foreground">{o.user_email}</div>
                </TableCell>
                <TableCell>{o.items.length}</TableCell>
                <TableCell className="font-semibold tabular-nums">{o.total.toFixed(2)} €</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</TableCell>
                <TableCell><StatusSelect value={o.status} onChange={(v) => updateStatus(o.id, v)} options={ORDER_STATUSES} /></TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucune commande</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ Interventions ============
function InterventionsManager() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [notes, setNotes] = useState("");

  const load = () => api.get("/admin/interventions").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/admin/interventions/${id}`, { status }); load(); toast.success("Statut mis à jour"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  const saveNotes = async () => {
    try { await api.patch(`/admin/interventions/${editing.id}`, { status: editing.status, admin_notes: notes }); setEditing(null); load(); toast.success("Notes enregistrées"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-2xl">{t("admin_interventions")}</h2>
      <div className="space-y-3">
        {items.map((iv) => (
          <div key={iv.id} className="rounded-xl border border-border bg-card p-5" data-testid={`iv-row-${iv.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold">{iv.first_name} {iv.last_name}</span>
                  <Badge variant="outline">{t(`cat_${iv.service_category}`)}</Badge>
                  {iv.urgent && <Badge className="bg-emergency text-emergency-foreground border-0">Urgent</Badge>}
                  {iv.quote_only && <Badge variant="secondary">Devis seul</Badge>}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {iv.email} · {iv.phone} · {iv.address}, {iv.postal_code} {iv.city}
                </div>
              </div>
              <StatusSelect value={iv.status} onChange={(v) => updateStatus(iv.id, v)} options={IV_STATUSES} />
            </div>
            <p className="mt-3 text-sm">{iv.description}</p>
            <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
              <span>{new Date(iv.created_at).toLocaleString("fr-FR")}</span>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(iv); setNotes(iv.admin_notes || ""); }}>
                <Edit className="h-3.5 w-3.5 mr-1" /> Notes
              </Button>
            </div>
            {iv.admin_notes && <div className="mt-2 text-xs p-2 rounded bg-muted">📝 {iv.admin_notes}</div>}
          </div>
        ))}
        {items.length === 0 && <div className="text-center text-muted-foreground py-12 rounded-xl border border-dashed border-border">Aucune intervention</div>}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Notes internes</DialogTitle></DialogHeader>
          <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes internes pour l'équipe..." />
          <DialogFooter><Button onClick={saveNotes}>{t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Users ============
function UsersManager() {
  const { t } = useLang();
  const [items, setItems] = useState([]);

  const load = () => api.get("/admin/users").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try { await api.patch(`/admin/users/${id}/toggle-active`); load(); toast.success("Mis à jour"); }
    catch (e) { toast.error(formatApiError(e)); }
  };
  const remove = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try { await api.delete(`/admin/users/${id}`); load(); toast.success("Supprimé"); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-2xl">{t("admin_users")}</h2>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell>{u.role === "admin" ? <Badge className="bg-primary"><ShieldCheck className="h-3 w-3 mr-1" />Admin</Badge> : <Badge variant="outline">Client</Badge>}</TableCell>
                <TableCell>{u.active ? <Badge>Actif</Badge> : <Badge variant="secondary">Désactivé</Badge>}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => toggle(u.id)} title="Activer/désactiver"><Power className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ Main Admin Layout ============
export default function Admin() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12" data-testid="admin-page">
      <header className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Administration</div>
          <h1 className="font-display font-extrabold tracking-tight text-3xl sm:text-4xl">{t("admin_title")}</h1>
        </div>
        <Badge className="bg-emergency text-emergency-foreground border-0"><ShieldCheck className="h-3 w-3 mr-1" /> Mode admin</Badge>
      </header>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto h-auto">
          <TabsTrigger value="dashboard" data-testid="admin-tab-dashboard"><LayoutDashboard className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Tableau</span></TabsTrigger>
          <TabsTrigger value="services" data-testid="admin-tab-services"><Briefcase className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Prestations</span></TabsTrigger>
          <TabsTrigger value="products" data-testid="admin-tab-products"><Package className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Produits</span></TabsTrigger>
          <TabsTrigger value="orders" data-testid="admin-tab-orders"><ShoppingBag className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Commandes</span></TabsTrigger>
          <TabsTrigger value="interventions" data-testid="admin-tab-interventions"><Wrench className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Interventions</span></TabsTrigger>
          <TabsTrigger value="users" data-testid="admin-tab-users"><Users className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Utilisateurs</span></TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><Dashboard /></TabsContent>
        <TabsContent value="services"><ServicesManager /></TabsContent>
        <TabsContent value="products"><ProductsManager /></TabsContent>
        <TabsContent value="orders"><OrdersManager /></TabsContent>
        <TabsContent value="interventions"><InterventionsManager /></TabsContent>
        <TabsContent value="users"><UsersManager /></TabsContent>
      </Tabs>
    </div>
  );
}
