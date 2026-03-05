import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import type { ExtendedThemeConfig, CardStyleVariant, LandingPageTheme } from "@/data/site-config";
import { initialExtendedTheme, landingPageThemePresets } from "@/data/site-config";
import { useState, useRef } from "react";
import { Check, Upload, X, Image as ImageIcon } from "lucide-react";
import HeroBackgroundEditor from "./HeroBackgroundEditor";

const radiusValues = ["0", "0.375rem", "0.75rem", "1.25rem", "9999px"];
const radiusLabels = ["Carré", "Petit", "Moyen", "Grand", "Pilule"];

const hslToHex = (hslStr: string): string => {
  try {
    const parts = hslStr.trim().split(/\s+/);
    const h = parseFloat(parts[0]) || 0;
    const s = (parseFloat(parts[1]) || 0) / 100;
    const l = (parseFloat(parts[2]) || 0) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  } catch { return "#888888"; }
};

const hexToHsl = (hex: string): string => {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "0 0% 50%";
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch { return "0 0% 50%"; }
};

const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hexVal = hslToHex(value);

  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 mt-1 items-center">
        <button
          className="w-9 h-9 rounded-lg border border-border shrink-0 cursor-pointer transition-transform hover:scale-110 shadow-sm"
          style={{ background: `hsl(${value})` }}
          onClick={() => inputRef.current?.click()}
        />
        <input ref={inputRef} type="color" value={hexVal} onChange={(e) => onChange(hexToHsl(e.target.value))} className="sr-only" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-secondary border-border text-xs flex-1" />
      </div>
    </div>
  );
};

const ThemeEngine = () => {
  const { theme, updateTheme, sections, updateSection } = useAdmin();
  const [radiusIndex, setRadiusIndex] = useState(() => {
    const idx = radiusValues.indexOf(theme.border_radius);
    return idx >= 0 ? idx : 2;
  });

  const handleRadiusChange = (val: number[]) => {
    const i = val[0];
    setRadiusIndex(i);
    updateTheme({ border_radius: radiusValues[i] });
  };

  const applyLandingTheme = (themeKey: LandingPageTheme) => {
    const heroSection = sections.find((s) => s.type === "hero");
    if (heroSection?.content?.trim()) {
      try {
        const parsed = JSON.parse(heroSection.content) as Record<string, unknown>;
        if ("title_colors" in parsed) {
          const { title_colors: _ignored, ...rest } = parsed;
          updateSection(heroSection.id, { content: JSON.stringify(rest) });
        }
      } catch {
        // keep existing content if invalid JSON
      }
    }

    const preset = landingPageThemePresets[themeKey];
    const fullPresetTheme: ExtendedThemeConfig = {
      ...initialExtendedTheme,
      ...preset.overrides,
      landing_page_theme: themeKey,
      footer_background_color: preset.overrides.footer_background_color ?? preset.overrides.secondary_color ?? initialExtendedTheme.footer_background_color,
      footer_text_color: preset.overrides.footer_text_color ?? preset.overrides.text_color ?? initialExtendedTheme.footer_text_color,
    };
    const idx = radiusValues.indexOf(fullPresetTheme.border_radius);
    if (idx >= 0) setRadiusIndex(idx);
    updateTheme(fullPresetTheme);
  };

  const cardVariants: { id: CardStyleVariant; label: string; desc: string }[] = [
    { id: "minimal", label: "Minimal", desc: "Épuré, bordure fine" },
    { id: "luxury", label: "Luxe", desc: "Ombres profondes" },
    { id: "glass", label: "Verre", desc: "Glassmorphism" },
    { id: "detailed", label: "Détaillé", desc: "Specs + badge statut" },
    { id: "compact", label: "Compact", desc: "Prix en haut, CTA vert" },
  ];

  const themeKeys = Object.keys(landingPageThemePresets) as LandingPageTheme[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">Thème & Apparence</h2>
        <p className="text-sm text-muted-foreground mt-1">Personnalisez le design de votre site</p>
      </div>

      {/* Landing Page Theme Selector */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Modèle de Landing Page</p>
        <p className="text-xs text-muted-foreground">Choisissez parmi 4 designs distincts. Les sections restent les mêmes, seul le style visuel change.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {themeKeys.map(key => {
            const preset = landingPageThemePresets[key];
            const isActive = theme.landing_page_theme === key;
            return (
              <div key={key}
                className={`relative rounded-xl p-4 border-2 transition-all text-left ${isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/30"}`}>
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                )}
                <div className="flex gap-1.5 mb-3">
                  {preset.preview_colors.map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-border" style={{ background: `hsl(${c})` }} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{preset.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyLandingTheme(key)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    {isActive ? "Actif" : "Activer"}
                  </button>
                  <a
                    href={`/preview/${key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                  >
                    Preview
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Colors */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Couleurs</p>
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker label="Principale" value={theme.primary_color} onChange={(v) => updateTheme({ primary_color: v })} />
              <ColorPicker label="Secondaire" value={theme.secondary_color} onChange={(v) => updateTheme({ secondary_color: v })} />
              <ColorPicker label="Accent" value={theme.accent_color} onChange={(v) => updateTheme({ accent_color: v })} />
              <ColorPicker label="Arrière-plan" value={theme.background_color} onChange={(v) => updateTheme({ background_color: v })} />
              <ColorPicker label="Texte" value={theme.text_color} onChange={(v) => updateTheme({ text_color: v })} />
              <ColorPicker label="Fond Footer" value={theme.footer_background_color} onChange={(v) => updateTheme({ footer_background_color: v })} />
              <ColorPicker label="Texte Footer" value={theme.footer_text_color} onChange={(v) => updateTheme({ footer_text_color: v })} />
            </div>
          </div>

          {/* Mode & En-tête */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Mode & En-tête</p>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Mode sombre (Frontend)</Label>
              <Switch checked={theme.dark_mode_enabled} onCheckedChange={(v) => updateTheme({ dark_mode_enabled: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Flat Design (test)</Label>
              <Switch checked={theme.flat_design} onCheckedChange={(v) => updateTheme({ flat_design: v })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Image Hero : position</Label>
              <Select value={theme.hero_image_position} onValueChange={(v) => updateTheme({ hero_image_position: v as "left" | "right" })}>
                <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">Droite</SelectItem>
                  <SelectItem value="left">Gauche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Style d'en-tête</Label>
              <Select value={theme.header_style} onValueChange={(v) => updateTheme({ header_style: v as ExtendedThemeConfig["header_style"] })}>
                <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="solid">Solide</SelectItem>
                  <SelectItem value="glass">Verre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hero Background Editor */}
          <HeroBackgroundEditor />

          {/* Typography */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Typographie</p>
            <div>
              <Label className="text-xs text-muted-foreground">Police du corps</Label>
              <Select value={theme.font_family} onValueChange={(v) => updateTheme({ font_family: v })}>
                <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                {["Figtree", "DM Sans", "Inter", "Space Grotesk", "Playfair Display", "Outfit"].map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Police des titres</Label>
              <Select value={theme.heading_font} onValueChange={(v) => updateTheme({ heading_font: v })}>
                <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                {["Figtree", "Space Grotesk", "DM Sans", "Playfair Display", "Outfit", "Inter"].map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Radius & Spacing */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Espacement & Bordures</p>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs text-muted-foreground">Rayon de bordure</Label>
                <span className="text-xs text-muted-foreground">{radiusLabels[radiusIndex]}</span>
              </div>
              <Slider value={[radiusIndex]} onValueChange={handleRadiusChange} min={0} max={4} step={1} className="w-full" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Densité</Label>
              <Select value={theme.spacing_density} onValueChange={(v) => updateTheme({ spacing_density: v as ExtendedThemeConfig["spacing_density"] })}>
                <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Spacieux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Style */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Style</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Mise en page</Label>
                <Select value={theme.layout_style} onValueChange={(v) => updateTheme({ layout_style: v as ExtendedThemeConfig["layout_style"] })}>
                  <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Moderne</SelectItem>
                    <SelectItem value="classic">Classique</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Boutons</Label>
                <Select value={theme.button_style} onValueChange={(v) => updateTheme({ button_style: v as ExtendedThemeConfig["button_style"] })}>
                  <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded">Arrondi</SelectItem>
                    <SelectItem value="sharp">Net</SelectItem>
                    <SelectItem value="pill">Pilule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nom du site</Label>
                <Input value={theme.site_name} onChange={(e) => updateTheme({ site_name: e.target.value })} className="mt-1 bg-secondary border-border text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Card Style + Preview */}
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Style des cartes véhicules</p>
            <p className="text-[10px] text-muted-foreground">5 styles différents inspirés des meilleures agences de location</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {cardVariants.map(cv => (
                <button key={cv.id} onClick={() => updateTheme({ card_style_variant: cv.id })}
                  className={`relative rounded-lg p-3 border-2 transition-all text-center ${theme.card_style_variant === cv.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                  <CardPreviewMini variant={cv.id} theme={theme} />
                  <p className="text-[10px] font-medium mt-2 text-foreground">{cv.label}</p>
                  <p className="text-[9px] text-muted-foreground">{cv.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Aperçu en direct</p>
            <div className="rounded-lg overflow-hidden border border-border" style={{ borderRadius: theme.border_radius }}>
              <div className="p-6 text-center" style={{ background: "#fafafa" }}>
                <h3 className="text-lg font-display font-bold" style={{ color: `hsl(${theme.primary_color})`, fontFamily: theme.heading_font }}>{theme.site_name}</h3>
                <p className="text-xs mt-1 text-slate-500">Location de véhicules</p>
              </div>
              <div className="p-4 space-y-3 bg-white">
                <CardPreviewFull variant={theme.card_style_variant} theme={theme} />
                <button className="w-full py-2 text-xs font-medium text-white"
                  style={{ background: `hsl(${theme.primary_color})`, borderRadius: theme.button_style === "pill" ? "9999px" : theme.button_style === "sharp" ? "0" : theme.border_radius }}>
                  Réserver maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Card Preview Components ─── */
const CardPreviewMini = ({ variant, theme }: { variant: CardStyleVariant; theme: ExtendedThemeConfig }) => {
  const styles = getCardVariantStyles(variant, theme);
  return (
    <div className="h-16 rounded-md overflow-hidden" style={styles}>
      <div className="h-8" style={{ background: `linear-gradient(135deg, hsl(${theme.primary_color} / 0.15), hsl(${theme.accent_color} / 0.2))` }} />
      <div className="p-1.5"><div className="h-1.5 w-2/3 rounded bg-slate-200" /></div>
    </div>
  );
};

const CardPreviewFull = ({ variant, theme }: { variant: CardStyleVariant; theme: ExtendedThemeConfig }) => {
  const styles = getCardVariantStyles(variant, theme);
  return (
    <div className="rounded-md overflow-hidden" style={{ ...styles, borderRadius: theme.border_radius }}>
      <div className="h-20" style={{ background: `linear-gradient(135deg, hsl(${theme.primary_color} / 0.2), hsl(${theme.accent_color} / 0.3))` }} />
      <div className="p-3">
        <div className="h-3 w-2/3 rounded mb-1.5 bg-slate-200" />
        <div className="h-2 w-1/2 rounded bg-slate-100" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-4 w-12 rounded" style={{ background: `hsl(${theme.primary_color} / 0.2)` }} />
          <div className="h-2 w-8 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
};

export const getCardVariantStyles = (variant: CardStyleVariant, theme: ExtendedThemeConfig): React.CSSProperties => {
  switch (variant) {
    case "luxury":
      return { background: "#fff", boxShadow: `0 20px 60px -15px hsl(${theme.primary_color} / 0.15), 0 8px 24px -8px rgba(0,0,0,0.1)`, border: "1px solid hsl(220 10% 92%)" };
    case "glass":
      return { background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid hsl(220 10% 88% / 0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" };
    case "detailed":
      return { background: "#fff", border: "1px solid hsl(220 10% 92%)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };
    case "compact":
      return { background: "#fff", border: "1px solid hsl(220 10% 92%)", boxShadow: "0 4px 20px -5px rgba(0,0,0,0.08)" };
    default:
      return { background: "#fff", border: "1px solid hsl(220 10% 92%)", boxShadow: "none" };
  }
};

export default ThemeEngine;
