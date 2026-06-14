import React from "react";
import { useLang } from "@/contexts/LanguageContext";
import { FAQ_DATA } from "@/lib/i18n";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function FAQ() {
  const { t, lang } = useLang();
  const items = FAQ_DATA[lang] || FAQ_DATA.fr;

  return (
    <div className="relative overflow-hidden" data-testid="faq-page">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <HelpCircle className="h-3 w-3" /> Aide & Support
          </div>
          <h1 className="font-display font-black tracking-tight text-4xl sm:text-6xl lg:text-7xl leading-none">{t("faq_title")}</h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">{t("faq_subtitle")}</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="space-y-4">
              {items.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-2xl bg-card px-2 overflow-hidden transition-all hover:border-primary/30 data-[state=open]:border-primary/50 data-[state=open]:shadow-xl">
                  <AccordionTrigger className="py-5 px-4 text-left font-display font-bold text-lg hover:no-underline" data-testid={`faq-q-${i}`}>
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-muted-foreground leading-relaxed pb-6 text-base">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-border bg-foreground text-background p-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <MessageCircle className="h-10 w-10 mb-6 text-primary" />
                <h3 className="font-display font-bold text-2xl mb-3">Besoin d'aide personnalisée ?</h3>
                <p className="text-sm opacity-70 mb-8 leading-relaxed">Nos conseillers sont disponibles 24h/24 pour répondre à toutes vos interrogations techniques ou administratives.</p>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                  <Link to="/contact">Contacter le support</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 overflow-hidden relative">
               <img 
                 src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3" 
                 alt="Support" 
                 className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" 
               />
               <div className="relative z-10">
                 <div className="text-3xl font-black mb-1">01 80 88 88 88</div>
                 <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ligne prioritaire 24/7</div>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
