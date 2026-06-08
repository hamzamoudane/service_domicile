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
  { key: "assainissement", icon: "🚿", color: "from-emerald-500/20 to-teal-600/10", img: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg" },
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
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emergency/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/80 backdrop-blur text-xs font-medium"
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
                className="mt-6 font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-7xl leading-[1.05]"
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
                className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
              >
                {t("hero_subtitle")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Button asChild size="lg" className="bg-emergency text-emergency-foreground hover:bg-emergency/90 h-12 px-6" data-testid="hero-cta-primary">
                  <Link to="/intervention">
                    <Phone className="h-4 w-4 mr-2" />
                    {t("hero_cta_primary")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6" data-testid="hero-cta-secondary">
                  <Link to="/services">
                    {t("hero_cta_secondary")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
                {[
                  { value: stats.interventions.toLocaleString(lang === "en" ? "en-US" : "fr-FR"), label: t("hero_stat_interventions") },
                  { value: `${(stats.clients / 1000).toFixed(1)}k+`, label: t("hero_stat_clients") },
                  { value: `${(stats.cities / 1000).toFixed(0)}k+`, label: t("hero_stat_cities") },
                  { value: `${stats.satisfaction}%`, label: t("hero_stat_satisfaction") },
                ].map((s, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div className="border-l-2 border-border pl-3">
                      <div className="font-display font-bold text-2xl sm:text-3xl tabular-nums">{s.value}</div>
                      <div className="text-xs text-muted-foreground leading-tight mt-1">{s.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e"
                  alt="Artisan professionnel en intervention"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold border border-white/20">
                      <BadgeCheck className="h-3 w-3 inline mr-1" /> Certifié RGE
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emergency text-emergency-foreground text-xs font-semibold">
                      <Sparkles className="h-3 w-3 inline mr-1" /> Disponible
                    </span>
                  </div>
                  <div className="font-display font-bold text-2xl leading-tight">Plus de 5 000 artisans en France</div>
                  <div className="text-sm text-white/80 mt-1">Sélectionnés, contrôlés et assurés</div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="absolute -left-4 -bottom-4 sm:-left-8 sm:-bottom-8 bg-background border border-border rounded-xl p-4 shadow-xl max-w-[220px]"
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <div className="text-sm font-semibold mt-1">4,9 / 5</div>
                <div className="text-xs text-muted-foreground">Sur plus de 5 000 avis vérifiés</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Expertises</div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{t("services_section_title")}</h2>
              <p className="mt-3 text-muted-foreground max-w-xl">{t("services_section_subtitle")}</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/services">
                {t("services_view_all")} <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.key} delay={i * 80} className={`lg:col-span-${i === 0 ? 7 : i === 1 ? 5 : i === 2 ? 4 : i === 3 ? 4 : 4}`}>
              <Link
                to={`/services?cat=${c.key}`}
                data-testid={`category-${c.key}`}
                className="group relative block aspect-[4/3] sm:aspect-[5/4] lg:aspect-auto lg:h-72 rounded-xl overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <img src={c.img} alt={t(`cat_${c.key}`)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-display font-bold text-2xl">{t(`cat_${c.key}`)}</div>
                  <div className="mt-1 text-sm text-white/80 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Découvrir les prestations <ArrowRight className="h-3.5 w-3.5" />
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
