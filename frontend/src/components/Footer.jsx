import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display font-extrabold">S</div>
              <div className="font-display font-extrabold tracking-tight text-lg">SOS Dépannage France</div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Votre urgence, notre priorité. Intervention 24h/24 et 7j/7 partout en France pour vos besoins de dépannage, réparation et installation à domicile.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> 01 80 88 88 88</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> contact@sos-depannage.fr</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> 24h/24 — 7j/7</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Couverture nationale</div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm">{t("footer_services")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/services" className="hover:text-foreground transition-colors">{t("cat_plomberie")}</Link></li>
              <li><Link to="/services" className="hover:text-foreground transition-colors">{t("cat_electricite")}</Link></li>
              <li><Link to="/services" className="hover:text-foreground transition-colors">{t("cat_serrurerie")}</Link></li>
              <li><Link to="/services" className="hover:text-foreground transition-colors">{t("cat_chauffage")}</Link></li>
              <li><Link to="/services" className="hover:text-foreground transition-colors">{t("cat_assainissement")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm">{t("footer_company")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t("nav_about")}</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">{t("nav_faq")}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">{t("nav_contact")}</Link></li>
              <li><Link to="/reviews" className="hover:text-foreground transition-colors">{t("nav_reviews")}</Link></li>
              <li><Link to="/intervention" className="hover:text-foreground transition-colors">{t("nav_request_intervention")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} SOS Dépannage France · {t("footer_rights")}</div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/15 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Service actif
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
