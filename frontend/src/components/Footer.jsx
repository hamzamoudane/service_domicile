import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter, ShieldCheck, Award, Zap } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative border-t border-border/40 bg-card mt-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Brand & Mission */}
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display font-black text-xl shadow-lg shadow-primary/20">S</div>
              <div className="font-display font-black tracking-tighter text-2xl uppercase">SOS Dépannage</div>
            </Link>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-md">
              L'excellence du service à domicile. Nous redéfinissons le dépannage d'urgence avec réactivité, transparence et savoir-faire artisanal.
            </p>
            <div className="flex items-center gap-4">
               {[Instagram, Facebook, Twitter].map((Icon, i) => (
                 <a key={i} href="#" className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                   <Icon className="h-5 w-5" />
                 </a>
               ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
            <div>
              <h4 className="font-display font-black text-[10px] uppercase tracking-[0.2em] text-primary mb-6">{t("footer_services")}</h4>
              <ul className="space-y-4 text-sm font-bold">
                {["plomberie", "electricite", "serrurerie", "chauffage", "assainissement"].map((cat) => (
                  <li key={cat}>
                    <Link to={`/services?cat=${cat}`} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                      <div className="h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all" />
                      {t(`cat_${cat}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-black text-[10px] uppercase tracking-[0.2em] text-primary mb-6">{t("footer_company")}</h4>
              <ul className="space-y-4 text-sm font-bold">
                {["about", "faq", "contact", "reviews", "request_intervention"].map((key) => (
                  <li key={key}>
                    <Link to={`/${key === 'request_intervention' ? 'intervention' : key}`} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                      <div className="h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all" />
                      {t(`nav_${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-display font-black text-[10px] uppercase tracking-[0.2em] text-primary mb-6">Contact</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black opacity-40">Urgence 24/7</div>
                    <a href="tel:+33180888888" className="text-sm font-bold hover:text-primary transition-colors">01 80 88 88 88</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black opacity-40">Support</div>
                    <a href="mailto:contact@sos-depannage.fr" className="text-sm font-bold hover:text-primary transition-colors">contact@sos-depannage.fr</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reassurance Bar */}
        <div className="mt-20 p-8 rounded-3xl bg-muted/40 border border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-8">
           <div className="flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <div className="text-xs font-black uppercase tracking-widest leading-none">Artisans Certifiés</div>
                <div className="text-[10px] text-muted-foreground mt-1">Sélection rigoureuse & Assurance</div>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <div className="text-xs font-black uppercase tracking-widest leading-none">Qualité Garantie</div>
                <div className="text-[10px] text-muted-foreground mt-1">Satisfaction client de 4.9/5</div>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-emergency" />
              <div>
                <div className="text-xs font-black uppercase tracking-widest leading-none">Intervention 60 min</div>
                <div className="text-[10px] text-muted-foreground mt-1">Déploiement national ultra-rapide</div>
              </div>
           </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row gap-6 justify-between items-center">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            © {new Date().getFullYear()} Home Help · Tous droits réservés
          </div>
          <div className="flex items-center gap-8">
            <Link to="/terms" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">Mentions Légales</Link>
            <Link to="/privacy" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">Confidentialité</Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Réseau Opérationnel
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
