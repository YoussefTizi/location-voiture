import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Language, Testimonial } from "@/data/site-config";
import { Plus, Trash2, Star } from "lucide-react";

const langs: Language[] = ["fr", "en", "ar"];

const TestimonialsEditor = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAdmin();
  const [activeLang, setActiveLang] = useState<Language>("fr");

  const handleAdd = () => {
    addTestimonial({
      id: `t-${Date.now()}`,
      name: "Nouveau client",
      rating: 5,
      review: { fr: "Avis du client...", en: "Customer review...", ar: "رأي العميل..." },
      avatar: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Avis clients</p>
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleAdd}>
          <Plus size={12} /> Ajouter un avis
        </Button>
      </div>

      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Language)}>
        <TabsList className="bg-secondary">
          {langs.map(l => <TabsTrigger key={l} value={l} className="text-xs uppercase">{l}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {testimonials.map((t) => (
          <div key={t.id} className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{t.name}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600" onClick={() => deleteTestimonial(t.id)}>
                <Trash2 size={12} />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Nom du client</Label>
                <Input value={t.name} onChange={(e) => updateTestimonial(t.id, { name: e.target.value })}
                  className="mt-0.5 bg-secondary border-border text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Note (1-5)</Label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => updateTestimonial(t.id, { rating: n })}
                      className="transition-colors">
                      <Star size={16} className={n <= t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Photo (URL)</Label>
              <Input value={t.avatar} onChange={(e) => updateTestimonial(t.id, { avatar: e.target.value })}
                className="mt-0.5 bg-secondary border-border text-xs" placeholder="https://..." />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Avis ({activeLang.toUpperCase()})</Label>
              <Textarea
                value={t.review[activeLang]}
                onChange={(e) => updateTestimonial(t.id, { review: { ...t.review, [activeLang]: e.target.value } })}
                className="mt-0.5 bg-secondary border-border text-xs"
                rows={2}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsEditor;
