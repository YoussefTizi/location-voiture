import { useAdmin } from "@/context/AdminContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { ExtendedSectionConfig, Language } from "@/data/site-config";
import { GripVertical, Eye, EyeOff, Pencil, Navigation } from "lucide-react";
import FAQEditor from "./FAQEditor";
import TestimonialsEditor from "./TestimonialsEditor";
import FeaturesEditor from "./FeaturesEditor";
import CTAEditor from "./CTAEditor";

const langs: Language[] = ["fr", "en", "ar"];
type LocalizedText = Record<Language, string>;
type HeroConfig = {
  badge_text: LocalizedText;
  primary_cta: { enabled: boolean; action: "whatsapp" | "anchor" | "link"; href: string; label: LocalizedText };
  secondary_cta: { enabled: boolean; action: "whatsapp" | "anchor" | "link"; href: string; label: LocalizedText };
  show_secondary_cta: boolean;
  show_info_items: boolean;
  show_mini_estimator: boolean;
  show_car_strip: boolean;
  info_items: Array<{ icon: string; label: LocalizedText }>;
};

const emptyLocalized = (): LocalizedText => ({ fr: "", en: "", ar: "" });

const defaultHeroConfig = (): HeroConfig => ({
  badge_text: emptyLocalized(),
  primary_cta: { enabled: true, action: "whatsapp", href: "", label: emptyLocalized() },
  secondary_cta: { enabled: true, action: "anchor", href: "#cars", label: emptyLocalized() },
  show_secondary_cta: true,
  show_info_items: true,
  show_mini_estimator: true,
  show_car_strip: true,
  info_items: [
    { icon: "Shield", label: emptyLocalized() },
    { icon: "CreditCard", label: emptyLocalized() },
    { icon: "Truck", label: emptyLocalized() },
  ],
});

const parseHeroConfig = (raw: string): HeroConfig => {
  const base = defaultHeroConfig();
  if (!raw?.trim()) return base;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...base,
      ...parsed,
      badge_text: { ...base.badge_text, ...(parsed?.badge_text ?? {}) },
      primary_cta: {
        ...base.primary_cta,
        ...(parsed?.primary_cta ?? {}),
        label: { ...base.primary_cta.label, ...(parsed?.primary_cta?.label ?? {}) },
      },
      secondary_cta: {
        ...base.secondary_cta,
        ...(parsed?.secondary_cta ?? {}),
        label: { ...base.secondary_cta.label, ...(parsed?.secondary_cta?.label ?? {}) },
      },
      info_items: Array.isArray(parsed?.info_items) && parsed.info_items.length > 0
        ? parsed.info_items.map((it: any) => ({
          icon: it?.icon ?? "Sparkles",
          label: { ...emptyLocalized(), ...(it?.label ?? {}) },
        }))
        : base.info_items,
    };
  } catch {
    return base;
  }
};

const SectionsManager = () => {
  const { sections, updateSection, reorderSections, navItems, updateNavItem } = useAdmin();
  const [editing, setEditing] = useState<string | null>(null);
  const [editLang, setEditLang] = useState<Language>("fr");
  const [showNavManager, setShowNavManager] = useState(false);

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const editingSection = sections.find((s) => s.id === editing);
  const heroConfig = editingSection?.type === "hero" ? parseHeroConfig(editingSection.content) : null;

  const updateHeroContent = (updater: (prev: HeroConfig) => HeroConfig) => {
    if (!editingSection || editingSection.type !== "hero") return;
    const next = updater(parseHeroConfig(editingSection.content));
    updateSection(editingSection.id, { content: JSON.stringify(next) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">Sections du site</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez, réorganisez et configurez les sections de votre site</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowNavManager(true)}>
          <Navigation size={14} /> Menu de navigation
        </Button>
      </div>

      <div className="space-y-2">
        {sorted.map((section, index) => (
          <div key={section.id}
            className={`rounded-lg border bg-card p-4 flex items-center gap-4 transition-all ${section.enabled ? "border-border" : "border-border/50 opacity-50"}`}>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => index > 0 && reorderSections(index, index - 1)} className="text-muted-foreground hover:text-foreground text-xs leading-none disabled:opacity-20" disabled={index === 0}>▲</button>
              <button onClick={() => index < sorted.length - 1 && reorderSections(index, index + 1)} className="text-muted-foreground hover:text-foreground text-xs leading-none disabled:opacity-20" disabled={index === sorted.length - 1}>▼</button>
            </div>
            <GripVertical size={16} className="text-muted-foreground/40" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{section.title.fr}</p>
              <p className="text-xs text-muted-foreground capitalize">{section.type} · {section.layout_variant} · {section.background_style}</p>
            </div>
            <Switch checked={section.enabled} onCheckedChange={(v) => updateSection(section.id, { enabled: v })} />
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => setEditing(section.id)}>
              <Pencil size={12} /> Modifier
            </Button>
          </div>
        ))}
      </div>

      {/* Section Edit */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Modifier la section</DialogTitle></DialogHeader>
          {editingSection && (
            <div className="space-y-4">
              {/* Title/Subtitle tabs (always shown) */}
              <Tabs value={editLang} onValueChange={(v) => setEditLang(v as Language)}>
                <TabsList className="bg-secondary">
                  {langs.map(l => <TabsTrigger key={l} value={l} className="text-xs uppercase">{l}</TabsTrigger>)}
                </TabsList>
                {langs.map(l => (
                  <TabsContent key={l} value={l} className="space-y-3 mt-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Titre ({l.toUpperCase()})</Label>
                      <Input value={editingSection.title[l]}
                        onChange={(e) => updateSection(editingSection.id, { title: { ...editingSection.title, [l]: e.target.value } })}
                        className="mt-1 bg-secondary border-border" dir={l === "ar" ? "rtl" : "ltr"} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Sous-titre ({l.toUpperCase()})</Label>
                      <Input value={editingSection.subtitle[l]}
                        onChange={(e) => updateSection(editingSection.id, { subtitle: { ...editingSection.subtitle, [l]: e.target.value } })}
                        className="mt-1 bg-secondary border-border" dir={l === "ar" ? "rtl" : "ltr"} />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Section-specific editors */}
              {editingSection.type === "faq" && (
                <div className="border-t border-border pt-4">
                  <FAQEditor sectionId={editingSection.id} />
                </div>
              )}

              {editingSection.type === "testimonials" && (
                <div className="border-t border-border pt-4">
                  <TestimonialsEditor />
                </div>
              )}

              {editingSection.type === "features" && (
                <div className="border-t border-border pt-4">
                  <FeaturesEditor />
                </div>
              )}

              {editingSection.type === "cta" && (
                <div className="border-t border-border pt-4">
                  <CTAEditor sectionId={editingSection.id} />
                </div>
              )}

              {editingSection.type === "hero" && heroConfig && (
                <div className="border-t border-border pt-4 space-y-4">
                  <p className="text-xs font-medium text-muted-foreground">Configuration Hero</p>
                  <div>
                    <Label className="text-xs text-muted-foreground">Badge ({editLang.toUpperCase()})</Label>
                    <Input
                      value={heroConfig.badge_text[editLang] || ""}
                      onChange={(e) => updateHeroContent((prev) => ({
                        ...prev,
                        badge_text: { ...prev.badge_text, [editLang]: e.target.value },
                      }))}
                      className="mt-1 bg-secondary border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">CTA secondaire</span>
                      <Switch
                        checked={heroConfig.show_secondary_cta}
                        onCheckedChange={(v) => updateHeroContent((prev) => ({ ...prev, show_secondary_cta: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">Infos rapides</span>
                      <Switch
                        checked={heroConfig.show_info_items}
                        onCheckedChange={(v) => updateHeroContent((prev) => ({ ...prev, show_info_items: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">Mini estimateur</span>
                      <Switch
                        checked={heroConfig.show_mini_estimator}
                        onCheckedChange={(v) => updateHeroContent((prev) => ({ ...prev, show_mini_estimator: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">Car strip</span>
                      <Switch
                        checked={heroConfig.show_car_strip}
                        onCheckedChange={(v) => updateHeroContent((prev) => ({ ...prev, show_car_strip: v }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">CTA principal ({editLang.toUpperCase()})</Label>
                    <Input
                      value={heroConfig.primary_cta.label[editLang] || ""}
                      onChange={(e) => updateHeroContent((prev) => ({
                        ...prev,
                        primary_cta: { ...prev.primary_cta, label: { ...prev.primary_cta.label, [editLang]: e.target.value } },
                      }))}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">CTA secondaire ({editLang.toUpperCase()})</Label>
                    <Input
                      value={heroConfig.secondary_cta.label[editLang] || ""}
                      onChange={(e) => updateHeroContent((prev) => ({
                        ...prev,
                        secondary_cta: { ...prev.secondary_cta, label: { ...prev.secondary_cta.label, [editLang]: e.target.value } },
                      }))}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Action CTA secondaire</Label>
                      <Select
                        value={heroConfig.secondary_cta.action}
                        onValueChange={(v) => updateHeroContent((prev) => ({
                          ...prev,
                          secondary_cta: { ...prev.secondary_cta, action: v as "whatsapp" | "anchor" | "link" },
                        }))}
                      >
                        <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anchor">Anchor</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Href CTA secondaire</Label>
                      <Input
                        value={heroConfig.secondary_cta.href || ""}
                        onChange={(e) => updateHeroContent((prev) => ({
                          ...prev,
                          secondary_cta: { ...prev.secondary_cta, href: e.target.value },
                        }))}
                        className="mt-1 bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Infos rapides ({editLang.toUpperCase()})</Label>
                    {heroConfig.info_items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2">
                        <Input
                          value={item.icon}
                          onChange={(e) => updateHeroContent((prev) => ({
                            ...prev,
                            info_items: prev.info_items.map((it, i) => i === idx ? { ...it, icon: e.target.value } : it),
                          }))}
                          className="bg-secondary border-border"
                          placeholder="Icon"
                        />
                        <div className="col-span-2">
                          <Input
                            value={item.label[editLang] || ""}
                            onChange={(e) => updateHeroContent((prev) => ({
                              ...prev,
                              info_items: prev.info_items.map((it, i) => i === idx ? { ...it, label: { ...it.label, [editLang]: e.target.value } } : it),
                            }))}
                            className="bg-secondary border-border"
                            placeholder="Texte"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generic content editor for other section types */}
              {editingSection.type !== "hero" && editingSection.type !== "cars" && editingSection.type !== "faq" && editingSection.type !== "search" && editingSection.type !== "features" && editingSection.type !== "cities" && editingSection.type !== "testimonials" && editingSection.type !== "cta" && editingSection.type !== "estimation" && editingSection.type !== "contact" && editingSection.type !== "footer" && (
                <div>
                  <Label className="text-xs text-muted-foreground">Contenu (JSON multilingue)</Label>
                  <Textarea value={editingSection.content}
                    onChange={(e) => updateSection(editingSection.id, { content: e.target.value })}
                    className="mt-1 bg-secondary border-border" rows={3} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Arrière-plan</Label>
                  <Select value={editingSection.background_style}
                    onValueChange={(v) => updateSection(editingSection.id, { background_style: v as ExtendedSectionConfig["background_style"] })}>
                    <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="gradient">Dégradé</SelectItem>
                      <SelectItem value="accent">Accent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Disposition</Label>
                  <Select value={editingSection.layout_variant}
                    onValueChange={(v) => updateSection(editingSection.id, { layout_variant: v as ExtendedSectionConfig["layout_variant"] })}>
                    <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Par défaut</SelectItem>
                      <SelectItem value="centered">Centré</SelectItem>
                      <SelectItem value="split">Divisé</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Nav Menu */}
      <Dialog open={showNavManager} onOpenChange={setShowNavManager}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Visibilité du menu</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Choisissez les sections visibles dans le menu de navigation</p>
          <div className="space-y-2 mt-3">
            {navItems.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border bg-secondary/50">
                <div className="flex items-center gap-3">
                  {item.show_in_menu ? <Eye size={14} className="text-foreground" /> : <EyeOff size={14} className="text-muted-foreground" />}
                  <span className="text-sm">{item.label.fr}</span>
                </div>
                <Switch checked={item.show_in_menu} onCheckedChange={(v) => updateNavItem(item.id, { show_in_menu: v })} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionsManager;
