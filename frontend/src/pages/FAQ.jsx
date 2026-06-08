import React from "react";
import { useLang } from "@/contexts/LanguageContext";
import { FAQ_DATA } from "@/lib/i18n";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const { t, lang } = useLang();
  const items = FAQ_DATA[lang] || FAQ_DATA.fr;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20" data-testid="faq-page">
      <header className="mb-12">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">FAQ</div>
        <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl">{t("faq_title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("faq_subtitle")}</p>
      </header>

      <Accordion type="single" collapsible className="border border-border rounded-xl divide-y divide-border bg-card">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-0 px-5 sm:px-6">
            <AccordionTrigger className="py-5 text-left font-display font-semibold hover:no-underline" data-testid={`faq-q-${i}`}>
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
