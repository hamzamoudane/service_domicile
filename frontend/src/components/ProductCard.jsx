import React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function ProductCard({ product }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const name = lang === "en" ? product.name_en : product.name_fr;
  const desc = lang === "en" ? product.description_en : product.description_fr;
  const inStock = product.stock > 0;

  const handleAdd = () => {
    add({
      item_type: "product",
      item_id: product.id,
      name,
      price: product.price,
      image_url: product.images?.[0],
      quantity: 1,
    });
    toast.success(lang === "fr" ? "Ajouté au panier" : "Added to cart");
  };

  return (
    <article
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images?.[0] || "https://placehold.co/600x600?text=Produit"}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="secondary">{t("out_of_stock")}</Badge>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col p-4">
        <h3 className="font-display font-semibold text-base leading-tight line-clamp-2">{name}</h3>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 flex-1">{desc}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="font-display font-bold text-xl">{product.price} €</div>
          {inStock && product.stock < 15 && (
            <span className="text-[10px] text-muted-foreground">{product.stock} {t("units_left")}</span>
          )}
        </div>
        <Button size="sm" className="mt-3" onClick={handleAdd} disabled={!inStock} data-testid={`add-product-${product.id}`}>
          <ShoppingCart className="h-4 w-4 mr-1.5" />
          {t("add_to_cart")}
        </Button>
      </div>
    </article>
  );
}
