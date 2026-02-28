import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language } from "@/data/site-config";
import { Plus, Trash2 } from "lucide-react";

const langs: Language[] = ["fr", "en", "ar"];

const iconOptions = [
  "Shield", "Zap", "Headphones", "Gem", "CreditCard", "Truck", "Car", "Calendar",
  "Clock", "Search", "CheckCircle2", "Star", "MapPin", "Phone", "Mail", "Globe",
  "Briefcase", "Navigation", "Fuel", "Users", "Settings2", "Sparkles",
];

const FeaturesEditor = () => {
  const { features, addFeature, updateFeature, deleteFeature } = useAdmin();
  const [activeLang, setActiveLang] = useState<Language>("fr");

  const handleAdd = () => {
    addFeature({
      id: `f-${Date.now()}`,
      icon: "Star",
      title: { fr: "Nouvel avantage", en: "New feature", ar: "ميزة جديدة" },
      description: { fr: "Description...", en: "Description...", ar: "الوصف..." },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Avantages</p>
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleAdd}>
          <Plus size={12} /> Ajouter un avantage
        </Button>
      </div>

      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Language)}>
        <TabsList className="bg-secondary">
          {langs.map(l => <TabsTrigger key={l} value={l} className="text-xs uppercase">{l}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {features.map((f) => (
          <div key={f.id} className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{f.title.fr}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600" onClick={() => deleteFeature(f.id)}>
                <Trash2 size={12} />
              </Button>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Icône</Label>
              <Select value={f.icon} onValueChange={(v) => updateFeature(f.id, { icon: v })}>
                <SelectTrigger className="mt-0.5 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {iconOptions.map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Titre ({activeLang.toUpperCase()})</Label>
              <Input value={f.title[activeLang]}
                onChange={(e) => updateFeature(f.id, { title: { ...f.title, [activeLang]: e.target.value } })}
                className="mt-0.5 bg-secondary border-border text-xs"
                dir={activeLang === "ar" ? "rtl" : "ltr"} />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Description ({activeLang.toUpperCase()})</Label>
              <Textarea value={f.description[activeLang]}
                onChange={(e) => updateFeature(f.id, { description: { ...f.description, [activeLang]: e.target.value } })}
                className="mt-0.5 bg-secondary border-border text-xs"
                rows={2}
                dir={activeLang === "ar" ? "rtl" : "ltr"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesEditor;
