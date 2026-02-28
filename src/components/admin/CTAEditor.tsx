import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Language, LocalizedText } from "@/data/site-config";

const langs: Language[] = ["fr", "en", "ar"];

interface CTAContent {
  primary_label: LocalizedText;
  secondary_label: LocalizedText;
}

const defaultCTA: CTAContent = {
  primary_label: { fr: "Réserver sur WhatsApp", en: "Reserve on WhatsApp", ar: "احجز عبر واتساب" },
  secondary_label: { fr: "Appeler maintenant", en: "Call Now", ar: "اتصل الآن" },
};

const CTAEditor = ({ sectionId }: { sectionId: string }) => {
  const { sections, updateSection } = useAdmin();
  const section = sections.find(s => s.id === sectionId);
  const [activeLang, setActiveLang] = useState<Language>("fr");

  if (!section) return null;

  let ctaContent: CTAContent = defaultCTA;
  try {
    const parsed = JSON.parse(section.content);
    if (parsed.primary_label) ctaContent = parsed;
  } catch {}

  const updateCTA = (data: Partial<CTAContent>) => {
    updateSection(sectionId, { content: JSON.stringify({ ...ctaContent, ...data }) });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">Contenu de l'appel à l'action</p>

      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Language)}>
        <TabsList className="bg-secondary">
          {langs.map(l => <TabsTrigger key={l} value={l} className="text-xs uppercase">{l}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">Texte du bouton principal ({activeLang.toUpperCase()})</Label>
          <Input
            value={ctaContent.primary_label[activeLang]}
            onChange={(e) => updateCTA({ primary_label: { ...ctaContent.primary_label, [activeLang]: e.target.value } })}
            className="mt-0.5 bg-secondary border-border text-xs"
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">Texte du bouton secondaire ({activeLang.toUpperCase()})</Label>
          <Input
            value={ctaContent.secondary_label[activeLang]}
            onChange={(e) => updateCTA({ secondary_label: { ...ctaContent.secondary_label, [activeLang]: e.target.value } })}
            className="mt-0.5 bg-secondary border-border text-xs"
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>
      </div>
    </div>
  );
};

export default CTAEditor;
