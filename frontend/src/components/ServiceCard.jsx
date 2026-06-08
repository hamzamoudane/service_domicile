import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function ServiceCard({ service }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const name = lang === "en" ? service.name_en : service.name_fr;
  const desc = lang === "en" ? service.description_en : service.description_fr;

  const handleAdd = () => {
    add({
      item_type: "service",
      item_id: service.id,
      name,
      price: service.price,
      image_url: service.image_url,
      quantity: 1,
    });
    toast.success(lang === "fr" ? "Ajouté au panier" : "Added to cart");
  };

  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
      data-testid={`service-card-${service.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={service.image_url}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {service.popular && (
          <Badge className="absolute top-3 left-3 bg-emergency text-emergency-foreground border-0">
            Populaire
          </Badge>
        )}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur text-xs font-semibold">
          {service.price_label ? `${t("services_starting_from")} ` : ""}
          {service.price} €
        </div>
      </div>
      <div className="flex-1 flex flex-col p-5">
        <h3 className="font-display font-semibold text-lg leading-tight">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">{desc}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleAdd} data-testid={`add-service-${service.id}`}>
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            {t("add_to_cart")}
          </Button>
          <Button size="sm" asChild className="flex-1" data-testid={`request-service-${service.id}`}>
            <Link to={`/intervention?service=${service.id}&cat=${service.category}`}>
              <Wrench className="h-4 w-4 mr-1.5" />
              {t("request_intervention")}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
