import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import ServiceCard from "@/components/ServiceCard";

const CATS = ["all", "plomberie", "electricite", "serrurerie", "chauffage", "assainissement"];

const MOCK_SERVICES = [
  {
    id: "plomb-1",
    category: "plomberie",
    name_fr: "Dépannage Fuite d'Eau",
    name_en: "Water Leak Repair",
    description_fr: "Intervention rapide pour colmatage de fuite sur tuyauterie et robinetterie.",
    description_en: "Quick intervention for pipe and faucet leak repair.",
    price: 89,
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "elec-1",
    category: "electricite",
    name_fr: "Diagnostic Tableau Électrique",
    name_en: "Electrical Panel Diagnosis",
    description_fr: "Recherche de panne et mise aux normes de votre installation électrique.",
    description_en: "Troubleshooting and upgrading of your electrical installation.",
    price: 120,
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "serr-1",
    category: "serrurerie",
    name_fr: "Ouverture de Porte Fine",
    name_en: "Non-Destructive Door Opening",
    description_fr: "Ouverture de porte claquée ou verrouillée sans dommage par un expert.",
    description_en: "Expert opening of slammed or locked doors without damage.",
    price: 150,
    images: ["https://images.unsplash.com/photo-1564767609213-c75ee685263a?auto=format&fit=crop&q=80&w=800"],
    popular: true
  },
  {
    id: "chau-1",
    category: "chauffage",
    name_fr: "Entretien Chaudière Gaz",
    name_en: "Gas Boiler Maintenance",
    description_fr: "Révision annuelle obligatoire et optimisation de votre système de chauffage.",
    description_en: "Mandatory annual review and optimization of your heating system.",
    price: 180,
    images: ["https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&q=80&w=800"]
  }
];

export default function Services() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState(MOCK_SERVICES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const active = searchParams.get("cat") || "all";

  useEffect(() => {
    setLoading(true);
    api.get("/services")
      .then(({ data }) => {
        if (data && data.length > 0) setServices(data);
      })
      .catch(() => {
        console.warn("Backend non disponible, utilisation des données de secours.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let res = services;
    if (active !== "all") res = res.filter((s) => s.category === active);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((s) =>
        s.name_fr.toLowerCase().includes(q) ||
        s.name_en.toLowerCase().includes(q) ||
        s.description_fr.toLowerCase().includes(q)
      );
    }
    return res;
  }, [services, active, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16" data-testid="services-page">
      <header className="mb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Catalogue</div>
        <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl">{t("services_title")}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("services_subtitle")}</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-8 sticky top-16 z-30 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-background/90 backdrop-blur border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="services-search"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATS.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={active === c ? "default" : "outline"}
              onClick={() => {
                if (c === "all") setSearchParams({});
                else setSearchParams({ cat: c });
              }}
              data-testid={`filter-${c}`}
            >
              {t(`cat_${c}`)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">{t("no_results")}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}
