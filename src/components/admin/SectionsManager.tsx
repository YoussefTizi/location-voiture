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
import {
  GripVertical, Eye, EyeOff, Pencil, Navigation,
  Shield, CreditCard, Truck, Sparkles, CheckCircle2, MapPin, Users,
  Fuel, Settings2, Car as CarIcon, Calendar, Clock, Zap, Headphones, Gem, MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import FAQEditor from "./FAQEditor";
import TestimonialsEditor from "./TestimonialsEditor";
import FeaturesEditor from "./FeaturesEditor";
import CTAEditor from "./CTAEditor";

const langs: Language[] = ["fr", "en", "ar"];
const heroTitleDefaultColors = { line1: "#FFFFFF", line2: "#FF4D4D" };
const heroIconChoices: Array<{ name: string; Icon: LucideIcon }> = [
  { name: "Shield", Icon: Shield },
  { name: "CreditCard", Icon: CreditCard },
  { name: "Truck", Icon: Truck },
  { name: "Sparkles", Icon: Sparkles },
  { name: "CheckCircle2", Icon: CheckCircle2 },
  { name: "MapPin", Icon: MapPin },
  { name: "Users", Icon: Users },
  { name: "Fuel", Icon: Fuel },
  { name: "Settings2", Icon: Settings2 },
  { name: "Car", Icon: CarIcon },
  { name: "Calendar", Icon: Calendar },
  { name: "Clock", Icon: Clock },
  { name: "Zap", Icon: Zap },
  { name: "Headphones", Icon: Headphones },
  { name: "Gem", Icon: Gem },
  { name: "MessageCircle", Icon: MessageCircle },
];
type LocalizedText = Record<Language, string>;
type HeroConfig = {
  title_colors: { line1: string; line2: string; line3: string };
  badge_text: LocalizedText;
  primary_cta: { enabled: boolean; action: "whatsapp" | "anchor" | "link"; href: string; label: LocalizedText };
  secondary_cta: { enabled: boolean; action: "whatsapp" | "anchor" | "link"; href: string; label: LocalizedText };
  show_secondary_cta: boolean;
  show_info_items: boolean;
  show_mini_estimator: boolean;
  show_car_strip: boolean;
  info_items: Array<{ icon: string; label: LocalizedText }>;
};
type CarsSectionConfig = {
  cards_per_row: 2 | 3 | 4 | 5;
};

const emptyLocalized = (): LocalizedText => ({ fr: "", en: "", ar: "" });

const defaultHeroConfig = (): HeroConfig => ({
  title_colors: { line1: "", line2: "", line3: "" },
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
      title_colors: { ...base.title_colors, ...(parsed?.title_colors ?? {}) },
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

const parseJsonObject = (raw: string): Record<string, unknown> => {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
};

const parseCarsConfig = (raw: string): CarsSectionConfig => {
  const parsed = parseJsonObject(raw);
  const value = Number(parsed.cards_per_row);
  if (value === 2 || value === 3 || value === 4 || value === 5) {
    return { cards_per_row: value };
  }
  return { cards_per_row: 4 };
};

const SectionsManager = () => {
  const { sections, updateSection, reorderSections, navItems, updateNavItem } = useAdmin();
  const [editing, setEditing] = useState<string | null>(null);
  const [editLang, setEditLang] = useState<Language>("fr");
  const [showNavManager, setShowNavManager] = useState(false);
  const [activeHeroIconIndex, setActiveHeroIconIndex] = useState(0);

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const editingSection = sections.find((s) => s.id === editing);
  const heroConfig = editingSection?.type === "hero" ? parseHeroConfig(editingSection.content) : null;
  const carsConfig = editingSection?.type === "cars" ? parseCarsConfig(editingSection.content) : null;

  const updateHeroContent = (updater: (prev: HeroConfig) => HeroConfig) => {
    if (!editingSection || editingSection.type !== "hero") return;
    const next = updater(parseHeroConfig(editingSection.content));
    updateSection(editingSection.id, { content: JSON.stringify(next) });
  };

  const updateCarsContent = (patch: Partial<CarsSectionConfig>) => {
    if (!editingSection || editingSection.type !== "cars") return;
    const base = parseJsonObject(editingSection.content);
    updateSection(editingSection.id, { content: JSON.stringify({ ...base, ...patch }) });
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
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent
          className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
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

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Titre Hero ({editLang.toUpperCase()})</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={(editingSection.title[editLang] || "").split("\n")[0] || ""}
                        onChange={(e) => {
                          const parts = (editingSection.title[editLang] || "").split("\n");
                          const line1 = e.target.value;
                          const line2 = parts[1] || "";
                          updateSection(editingSection.id, {
                            title: { ...editingSection.title, [editLang]: `${line1}\n${line2}`.trim() },
                          });
                        }}
                        className="bg-secondary border-border"
                        placeholder="Ligne 1"
                      />
                      <Input
                        value={(editingSection.title[editLang] || "").split("\n")[1] || ""}
                        onChange={(e) => {
                          const parts = (editingSection.title[editLang] || "").split("\n");
                          const line1 = parts[0] || "";
                          const line2 = e.target.value;
                          updateSection(editingSection.id, {
                            title: { ...editingSection.title, [editLang]: `${line1}\n${line2}`.trim() },
                          });
                        }}
                        className="bg-secondary border-border"
                        placeholder="Ligne 2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Couleurs du titre Hero</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md border border-border bg-secondary/40 p-2">
                        <p className="text-[10px] text-muted-foreground mb-1">Couleur 1</p>
                        <Input
                          type="color"
                          value={heroConfig.title_colors.line1 || heroTitleDefaultColors.line1}
                          onChange={(e) => updateHeroContent((prev) => ({
                            ...prev,
                            title_colors: { ...prev.title_colors, line1: e.target.value },
                          }))}
                          className="h-9 w-full p-1 bg-transparent border-border"
                        />
                      </div>
                      <div className="rounded-md border border-border bg-secondary/40 p-2">
                        <p className="text-[10px] text-muted-foreground mb-1">Couleur 2</p>
                        <Input
                          type="color"
                          value={heroConfig.title_colors.line2 || heroTitleDefaultColors.line2}
                          onChange={(e) => updateHeroContent((prev) => ({
                            ...prev,
                            title_colors: { ...prev.title_colors, line2: e.target.value },
                          }))}
                          className="h-9 w-full p-1 bg-transparent border-border"
                        />
                      </div>
                    </div>
                  </div>

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
                        <Button
                          type="button"
                          variant={activeHeroIconIndex === idx ? "default" : "outline"}
                          size="sm"
                          className="justify-start text-xs gap-1.5"
                          onClick={() => setActiveHeroIconIndex(idx)}
                        >
                          {(() => {
                            const found = heroIconChoices.find((choice) => choice.name === item.icon);
                            if (!found) return null;
                            const IconComp = found.Icon;
                            return <IconComp size={14} />;
                          })()}
                          <span className="truncate">{item.icon || `Info ${idx + 1}`}</span>
                        </Button>
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

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Icônes disponibles</Label>
                      <span className="text-[10px] text-muted-foreground">Cible: info #{Math.min(activeHeroIconIndex + 1, 3)}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                      {heroIconChoices.map(({ name, Icon }) => {
                        const targetIndex = Math.min(activeHeroIconIndex, 2);
                        const isCurrent = heroConfig.info_items[targetIndex]?.icon === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => updateHeroContent((prev) => ({
                              ...prev,
                              info_items: prev.info_items.map((it, i) => i === targetIndex ? { ...it, icon: name } : it),
                            }))}
                            className={`rounded-md border px-2 py-2 text-xs flex flex-col items-center gap-1 transition-colors ${isCurrent ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 hover:bg-secondary/60"}`}
                          >
                            <Icon size={14} />
                            <span className="truncate w-full text-center">{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {editingSection.type === "cars" && carsConfig && (
                <div className="border-t border-border pt-4 space-y-2">
                  <Label className="text-xs text-muted-foreground">Cartes par ligne (desktop)</Label>
                  <Select
                    value={String(carsConfig.cards_per_row)}
                    onValueChange={(v) => updateCarsContent({ cards_per_row: Number(v) as 2 | 3 | 4 | 5 })}
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 par ligne</SelectItem>
                      <SelectItem value="3">3 par ligne</SelectItem>
                      <SelectItem value="4">4 par ligne</SelectItem>
                      <SelectItem value="5">5 par ligne</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                  Fermer
                </Button>
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
