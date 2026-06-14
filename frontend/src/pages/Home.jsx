import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Wrench, ShieldCheck, Clock, Award, MapPin, BadgeCheck, Star, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import Reveal from "@/components/Reveal";

const CATEGORIES = [
  { key: "plomberie", icon: "💧", color: "from-sky-500/20 to-blue-600/10", img: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg" },
  { key: "electricite", icon: "⚡", color: "from-amber-500/20 to-orange-600/10", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e" },
  { key: "serrurerie", icon: "🔐", color: "from-violet-500/20 to-indigo-600/10", img: "https://images.unsplash.com/photo-1564767609213-c75ee685263a" },
  { key: "chauffage", icon: "🔥", color: "from-rose-500/20 to-red-600/10", img: "https://images.unsplash.com/photo-1660330589827-da8ab7dd3c02" },
  { key: "assainissement", icon: "🚿", color: "from-emerald-500/20 to-teal-600/10", img: "https://images.unsplash.com/photo-1542013936693-884638332954" },
];

export default function Home() {
  const { t, lang } = useLang();
  const [stats, setStats] = useState({ interventions: 12847, clients: 5234, cities: 36000, satisfaction: 98 });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("/public/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/reviews").then(({ data }) => setReviews(data.slice(0, 6))).catch(() => {});
  }, []);

  const reasons = [
    { icon: Clock, key: "why_24_7" },
    { icon: BadgeCheck, key: "why_quote" },
    { icon: ShieldCheck, key: "why_warranty" },
    { icon: Wrench, key: "why_fast" },
    { icon: MapPin, key: "why_national" },
    { icon: Award, key: "why_certified" },
  ];

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,98,254,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/80 backdrop-blur text-xs font-semibold"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emergency" />
                </span>
                {t("hero_badge")}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="mt-6 font-display font-black tracking-tight text-4xl sm:text-6xl lg:text-7xl leading-[1.1]"
                data-testid="hero-title"
              >
                {t("hero_title_line1")}
                <br />
                <span className="text-primary">{t("hero_title_line2")}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg sm:text-xl text-muted-foreground leading-relaxed"
              >
                {t("hero_subtitle")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22 }}
                className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4"
              >
                <Button asChild size="lg" className="bg-emergency text-emergency-foreground hover:bg-emergency/90 h-14 px-8 text-base font-bold shadow-lg shadow-emergency/20" data-testid="hero-cta-primary">
                  <Link to="/intervention">
                    <Phone className="h-5 w-5 mr-2" />
                    {t("hero_cta_primary")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold" data-testid="hero-cta-secondary">
                  <Link to="/services">
                    {t("hero_cta_secondary")}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
                {[
                  { value: stats.interventions.toLocaleString(lang === "en" ? "en-US" : "fr-FR"), label: t("hero_stat_interventions") },
                  { value: `${(stats.clients / 1000).toFixed(1)}k+`, label: t("hero_stat_clients") },
                  { value: `${(stats.cities / 1000).toFixed(0)}k+`, label: t("hero_stat_cities") },
                  { value: `${stats.satisfaction}%`, label: t("hero_stat_satisfaction") },
                ].map((s, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div className="text-center lg:text-left border-l-2 lg:border-l-2 border-primary/20 pl-0 lg:pl-4">
                      <div className="font-display font-black text-3xl sm:text-4xl tabular-nums tracking-tighter">{s.value}</div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-bold mt-1">{s.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-border shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e"
                  alt="Artisan professionnel"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-white/20">
                      <BadgeCheck className="h-3 w-3 inline mr-1 text-primary" /> Certifié RGE
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emergency text-emergency-foreground text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3 inline mr-1" /> Disponible 24/7
                    </span>
                  </div>
                  <div className="font-display font-bold text-3xl leading-tight">Artisans Qualifiés & Assurés</div>
                  <p className="text-sm text-white/70 mt-2">Intervention rapide partout en France, devis gratuit avant travaux.</p>
                </div>
              </motion.div>
              
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -right-6 top-1/2 -translate-y-1/2 bg-background/95 backdrop-blur border border-border rounded-2xl p-5 shadow-2xl max-w-[200px]"
              >
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <div className="text-2xl font-black tracking-tight">4,9 / 5</div>
                <div className="text-xs text-muted-foreground font-medium mt-1 leading-tight">Basé sur 5,840 avis vérifiés</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Tetris Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-4">Nos Domaines d'Expertise</div>
              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-none">{t("services_section_title")}</h2>
              <p className="mt-4 text-lg text-muted-foreground">{t("services_section_subtitle")}</p>
            </div>
            <Button variant="outline" asChild className="rounded-full px-6">
              <Link to="/services" className="font-bold uppercase text-xs tracking-widest">
                {t("services_view_all")} <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 auto-rows-[300px]">
          {CATEGORIES.map((c, i) => (
            <Reveal 
              key={c.key} 
              delay={i * 80} 
              className={`
                ${i === 0 ? "lg:col-span-8 lg:row-span-1" : ""}
                ${i === 1 ? "lg:col-span-4 lg:row-span-2" : ""}
                ${i === 2 ? "lg:col-span-4 lg:row-span-1" : ""}
                ${i === 3 ? "lg:col-span-4 lg:row-span-1" : ""}
                ${i === 4 ? "lg:col-span-4 lg:row-span-1" : ""}
                group relative rounded-3xl overflow-hidden border border-border bg-card
              `}
            >
              <Link
                to={`/services?cat=${c.key}`}
                data-testid={`category-${c.key}`}
                className="block h-full w-full"
              >
                <img 
                  src={c.img} 
                  alt={t(`cat_${c.key}`)} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-primary/80" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl mb-4 border border-white/20">
                    {c.icon}
                  </div>
                  <div className="font-display font-black text-3xl tracking-tight">{t(`cat_${c.key}`)}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60 flex items-center gap-2 group-hover:text-white transition-colors">
                    Explorer <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Engagements</div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{t("why_choose_title")}</h2>
              <p className="mt-3 text-muted-foreground">{t("why_choose_subtitle")}</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {reasons.map((r, i) => {
              const Icon = r.icon;
              return (
                <Reveal key={r.key} delay={i * 60}>
                  <div className="bg-background p-8 h-full transition-colors hover:bg-card group">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">{t(r.key)}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(`${r.key}_desc`)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Avis clients</div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{t("reviews_title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("reviews_subtitle")}</p>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <Reveal key={r.id || i} delay={i * 60}>
              <div className="h-full rounded-xl border border-border p-6 bg-card hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(r.rating || 5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-sm font-semibold">{r.name}</div>
                  <Badge variant="secondary" className="text-[10px]">{t(`cat_${r.service_category}`)}</Badge>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="relative overflow-hidden rounded-2xl bg-foreground text-background p-10 sm:p-16">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emergency/30 blur-3xl" />
            <div className="relative max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] opacity-70 mb-3">Intervention nationale</div>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight">{t("final_cta_title")}</h2>
              <p className="mt-3 opacity-80">{t("final_cta_subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-emergency text-emergency-foreground hover:bg-emergency/90 h-12 px-6" data-testid="final-cta-intervention">
                  <Link to="/intervention"><Phone className="h-4 w-4 mr-2" />{t("hero_cta_primary")}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="h-12 px-6 bg-background text-foreground hover:bg-background/90">
                  <Link to="/contact">{t("nav_contact")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
