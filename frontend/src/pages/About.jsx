import React from "react";
import { Award, ShieldCheck, Users, Briefcase, Heart, TrendingUp } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import Reveal from "@/components/Reveal";

export default function About() {
  const { t } = useLang();
  const values = [
    { icon: ShieldCheck, title: "Fiabilité", desc: "Engagement écrit sur chaque devis, garantie travaux contractuelle." },
    { icon: TrendingUp, title: "Réactivité", desc: "30 à 60 minutes en intervention d'urgence, 24h/24, 7j/7." },
    { icon: Heart, title: "Proximité", desc: "Artisans locaux choisis pour leur excellence et leur professionnalisme." },
    { icon: Briefcase, title: "Expertise", desc: "+15 ans d'expérience cumulée, formations continues, certifications RGE." },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20" data-testid="about-page">
      <header className="max-w-3xl mb-16">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">À propos</div>
        <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl">{t("about_title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{t("about_subtitle")}</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-20">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-base leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Home Help</strong> est née d&apos;un constat simple : trouver un artisan
              disponible, fiable et au juste prix, surtout en situation d&apos;urgence, est devenu trop compliqué pour les
              particuliers comme pour les professionnels.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Nous avons construit le plus grand réseau d'artisans certifiés en France pour répondre à vos urgences en
              plomberie, électricité, serrurerie, chauffage et assainissement. Tous nos artisans sont sélectionnés selon
              des critères stricts : qualifications, assurances, antécédents, satisfaction client.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Notre engagement : un devis gratuit avant chaque intervention, un tarif transparent, des travaux garantis
              et une qualité de service constante, partout en France, 24h/24 et 7j/7.&nbsp;
            </p>
          </Reveal>
        </div>
        <div className="lg:col-span-5">
          <Reveal delay={120}>
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-2xl relative">
              <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e" alt="Artisan Professionnel" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-sm font-medium">
                Notre engagement : Excellence et Réactivité
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Values */}
      <section className="border-t border-border pt-12">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-10">Nos valeurs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <Reveal key={v.title} delay={i * 60}>
                <div className="bg-background p-8 h-full">
                  <Icon className="h-7 w-7 text-primary mb-4" />
                  <h3 className="font-display font-semibold text-lg">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Numbers */}
      <section className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {[
          { value: "5 000+", label: "Artisans certifiés" },
          { value: "12 000+", label: "Interventions/an" },
          { value: "36 000", label: "Communes couvertes" },
          { value: "4,9/5", label: "Satisfaction client" },
        ].map((s, i) => (
          <div key={i} className="bg-background p-8 text-center">
            <div className="font-display font-extrabold text-3xl sm:text-4xl">{s.value}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
