import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";

const CATS = ["all", "plomberie", "electricite", "serrurerie", "chauffage"];

const MOCK_PRODUCTS = [
  {
    id: "prod-1", category: "serrurerie", name_fr: "Serrure Haute Sécurité A2P", name_en: "High Security A2P Lock",
    description_fr: "Serrure certifiée 3 points pour une protection maximale de votre domicile.",
    description_en: "Certified 3-point lock for maximum home protection.",
    price: 249, stock: 15, images: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "prod-2", category: "plomberie", name_fr: "Mitigeur Cuisine Design", name_en: "Designer Kitchen Faucet",
    description_fr: "Finition chrome brossé, économie d'eau et installation facile.",
    description_en: "Brushed chrome finish, water saving and easy installation.",
    price: 129, stock: 8, images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "prod-3", category: "electricite", name_fr: "Kit Prises Connectées", name_en: "Smart Plug Kit",
    description_fr: "Contrôlez vos appareils à distance via smartphone et économisez de l'énergie.",
    description_en: "Control your devices remotely via smartphone and save energy.",
    price: 59, stock: 24, images: ["https://images.unsplash.com/photo-1558211583-d26f610c1eb1?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "prod-4", category: "chauffage", name_fr: "Thermostat Intelligent", name_en: "Smart Thermostat",
    description_fr: "Régulation précise de la température et programmation intelligente.",
    description_en: "Precise temperature regulation and smart programming.",
    price: 199, stock: 12, images: ["https://images.unsplash.com/photo-1560393295-588aa440fda0?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "prod-5", category: "serrurerie", name_fr: "Caméra Surveillance 4K", name_en: "4K Security Camera",
    description_fr: "Vision nocturne, détection de mouvement et stockage cloud sécurisé.",
    description_en: "Night vision, motion detection and secure cloud storage.",
    price: 185, stock: 30, images: ["https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "prod-6", category: "plomberie", name_fr: "Pommeau Douche LED", name_en: "LED Shower Head",
    description_fr: "Indicateur de température par couleur et économie d'eau intégrée.",
    description_en: "Color temperature indicator and integrated water saving.",
    price: 45, stock: 50, images: ["https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "prod-7", category: "electricite", name_fr: "Panneau Solaire Balcon", name_en: "Balcony Solar Panel",
    description_fr: "Plug & Play, commencez à produire votre propre électricité immédiatement.",
    description_en: "Plug & Play, start producing your own electricity immediately.",
    price: 499, stock: 5, images: ["https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: "prod-8", category: "chauffage", name_fr: "Radiateur Inertie Fonte", name_en: "Cast Iron Radiator",
    description_fr: "Chaleur douce et durable pour un confort thermique optimal.",
    description_en: "Gentle and durable heat for optimal thermal comfort.",
    price: 320, stock: 10, images: ["https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800"]
  }
];

export default function Shop() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const active = searchParams.get("cat") || "all";

  useEffect(() => {
    setLoading(true);
    api.get("/products")
      .then(({ data }) => {
        if (data && data.length > 0) setProducts(data);
      })
      .catch(() => {
        console.warn("Backend non disponible pour la boutique, utilisation des données de secours.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let res = products;
    if (active !== "all") res = res.filter((p) => p.category === active);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((p) =>
        p.name_fr.toLowerCase().includes(q) ||
        p.name_en.toLowerCase().includes(q) ||
        p.description_fr.toLowerCase().includes(q)
      );
    }
    return res;
  }, [products, active, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16" data-testid="shop-page">
      <header className="mb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Boutique</div>
        <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl">{t("shop_title")}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("shop_subtitle")}</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-3 mb-8 sticky top-16 z-30 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-background/90 backdrop-blur border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="shop-search"
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
              data-testid={`shop-filter-${c}`}
            >
              {t(`cat_${c}`)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">{t("no_results")}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
