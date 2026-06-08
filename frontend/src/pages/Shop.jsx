import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";

const CATS = ["all", "plomberie", "electricite", "serrurerie", "chauffage"];

export default function Shop() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const active = searchParams.get("cat") || "all";

  useEffect(() => {
    setLoading(true);
    api.get("/products").then(({ data }) => setProducts(data)).finally(() => setLoading(false));
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
