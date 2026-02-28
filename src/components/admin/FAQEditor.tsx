import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Language, LocalizedText } from "@/data/site-config";
import { Plus, Trash2, GripVertical } from "lucide-react";

const langs: Language[] = ["fr", "en", "ar"];

interface FAQItem {
  q: LocalizedText;
  a: LocalizedText;
}

const FAQEditor = ({ sectionId }: { sectionId: string }) => {
  const { sections, updateSection } = useAdmin();
  const section = sections.find(s => s.id === sectionId);
  const [activeLang, setActiveLang] = useState<Language>("fr");

  if (!section) return null;

  let faqs: FAQItem[] = [];
  try { faqs = JSON.parse(section.content); } catch {}

  const updateFaqs = (newFaqs: FAQItem[]) => {
    updateSection(sectionId, { content: JSON.stringify(newFaqs) });
  };

  const addFaq = () => {
    updateFaqs([...faqs, {
      q: { fr: "Nouvelle question", en: "New question", ar: "سؤال جديد" },
      a: { fr: "Réponse...", en: "Answer...", ar: "الإجابة..." },
    }]);
  };

  const updateFaq = (index: number, field: "q" | "a", lang: Language, value: string) => {
    const updated = [...faqs];
    updated[index] = {
      ...updated[index],
      [field]: { ...updated[index][field], [lang]: value },
    };
    updateFaqs(updated);
  };

  const deleteFaq = (index: number) => {
    updateFaqs(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Questions & Réponses</p>
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={addFaq}>
          <Plus size={12} /> Ajouter une question
        </Button>
      </div>

      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Language)}>
        <TabsList className="bg-secondary">
          {langs.map(l => <TabsTrigger key={l} value={l} className="text-xs uppercase">{l}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-muted-foreground/40" />
                <span className="text-xs font-semibold text-muted-foreground">Question {i + 1}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600" onClick={() => deleteFaq(i)}>
                <Trash2 size={12} />
              </Button>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Question ({activeLang.toUpperCase()})</Label>
              <Input
                value={typeof faq.q === "object" ? faq.q[activeLang] || "" : faq.q}
                onChange={(e) => updateFaq(i, "q", activeLang, e.target.value)}
                className="mt-0.5 bg-secondary border-border text-xs"
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Réponse ({activeLang.toUpperCase()})</Label>
              <Textarea
                value={typeof faq.a === "object" ? faq.a[activeLang] || "" : faq.a}
                onChange={(e) => updateFaq(i, "a", activeLang, e.target.value)}
                className="mt-0.5 bg-secondary border-border text-xs"
                rows={2}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Aucune question ajoutée. Cliquez sur « Ajouter une question » pour commencer.</p>
      )}
    </div>
  );
};

export default FAQEditor;
