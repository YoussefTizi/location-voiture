import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Upload, X, Image as ImageIcon, Check } from "lucide-react";
import type { HeroBackgroundType, HeroPatternType, ExtendedThemeConfig } from "@/data/site-config";

/* ─── SVG Pattern Generators ─── */
const generatePatternSVG = (type: HeroPatternType, opacity: number, isDark: boolean): string => {
  const color = isDark ? `rgba(255,255,255,${opacity / 100})` : `rgba(0,0,0,${opacity / 100})`;
  switch (type) {
    case "dots":
      return `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E")`;
    case "grid":
      return `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.5'/%3E%3C/svg%3E")`;
    case "diagonal":
      return `url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 16L16 0' stroke='${encodeURIComponent(color)}' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`;
    case "hexagons":
      return `url("data:image/svg+xml,%3Csvg width='28' height='49' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 0l14 8.5v16.5L14 33.5 0 25V8.5z' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.5'/%3E%3Cpath d='M14 16.5l14 8.5v16.5L14 50 0 41.5V25z' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.5'/%3E%3C/svg%3E")`;
    case "waves":
      return `url("data:image/svg+xml,%3Csvg width='40' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6c5 0 5-4 10-4s5 4 10 4 5-4 10-4 5 4 10 4' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.5'/%3E%3C/svg%3E")`;
    default:
      return "none";
  }
};

export const getHeroBackgroundCSS = (theme: ExtendedThemeConfig): React.CSSProperties => {
  if (!theme.hero_background_enabled) return {};
  switch (theme.hero_background_type) {
    case "solid":
      return { backgroundColor: `hsl(${theme.hero_solid_color})` };
    case "image":
      return {};
    case "pattern":
      return {
        backgroundImage: generatePatternSVG(theme.hero_pattern_type, theme.hero_pattern_opacity, theme.dark_mode_enabled),
        backgroundRepeat: "repeat",
      };
    default:
      return {};
  }
};

const patternPresets: { id: HeroPatternType; label: string; desc: string }[] = [
  { id: "dots", label: "Points", desc: "Grille de points subtils" },
  { id: "grid", label: "Grille", desc: "Lignes quadrillées fines" },
  { id: "diagonal", label: "Diagonales", desc: "Lignes obliques légères" },
  { id: "hexagons", label: "Hexagones", desc: "Motif nid d'abeille" },
  { id: "waves", label: "Vagues", desc: "Ondulations douces" },
];

const HeroBackgroundEditor = () => {
  const { theme, updateTheme } = useAdmin();

  const bgTypes: { id: HeroBackgroundType; label: string }[] = [
    { id: "solid", label: "Couleur unie" },
    { id: "image", label: "Image" },
    { id: "pattern", label: "Motif" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Fond de la section Hero</p>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Activer le fond personnalisé</Label>
        <Switch checked={theme.hero_background_enabled} onCheckedChange={(v) => updateTheme({ hero_background_enabled: v })} />
      </div>

      {theme.hero_background_enabled && (
        <div className="space-y-4 animate-fade-in">
          {/* Background Type */}
          <div>
            <Label className="text-xs text-muted-foreground">Type de fond</Label>
            <Select value={theme.hero_background_type} onValueChange={(v) => updateTheme({ hero_background_type: v as HeroBackgroundType })}>
              <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {bgTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Solid Color */}
          {theme.hero_background_type === "solid" && (
            <div>
              <Label className="text-xs text-muted-foreground">Couleur de fond</Label>
              <Input
                value={theme.hero_solid_color}
                onChange={(e) => updateTheme({ hero_solid_color: e.target.value })}
                placeholder="220 15% 96%"
                className="mt-1 bg-secondary border-border text-xs"
              />
            </div>
          )}

          {/* Image Upload */}
          {theme.hero_background_type === "image" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="URL de l'image ou télécharger…"
                  value={theme.hero_background_image}
                  onChange={(e) => updateTheme({ hero_background_image: e.target.value })}
                  className="bg-secondary border-border text-xs flex-1"
                />
                <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors bg-primary text-primary-foreground hover:opacity-90">
                  <Upload size={14} />
                  <span>Upload</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => updateTheme({ hero_background_image: ev.target?.result as string });
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
              {theme.hero_background_image ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={theme.hero_background_image} alt="Hero background" className="w-full h-32 object-cover" />
                  <button onClick={() => updateTheme({ hero_background_image: "" })}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-border">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon size={20} className="mx-auto mb-1 opacity-50" />
                    <p className="text-[10px]">Aucune image sélectionnée</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pattern Selector */}
          {theme.hero_background_type === "pattern" && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Motif</Label>
                <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                  {patternPresets.map(p => {
                    const isActive = theme.hero_pattern_type === p.id;
                    const previewBg = generatePatternSVG(p.id, 12, false);
                    return (
                      <button key={p.id} onClick={() => updateTheme({ hero_pattern_type: p.id })}
                        className={`relative rounded-lg p-2 border-2 transition-all text-center ${isActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                        {isActive && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check size={10} className="text-primary-foreground" />
                          </div>
                        )}
                        <div className="h-12 rounded-md mb-1.5 bg-secondary" style={{ backgroundImage: previewBg, backgroundRepeat: "repeat" }} />
                        <p className="text-[10px] font-medium text-foreground">{p.label}</p>
                        <p className="text-[8px] text-muted-foreground leading-tight">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs text-muted-foreground">Opacité du motif</Label>
                  <span className="text-xs text-muted-foreground">{theme.hero_pattern_opacity}%</span>
                </div>
                <Slider
                  value={[theme.hero_pattern_opacity]}
                  onValueChange={(v) => updateTheme({ hero_pattern_opacity: v[0] })}
                  min={3} max={20} step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Live Preview */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Aperçu</Label>
            <div className="relative rounded-lg overflow-hidden border border-border h-32">
              {/* Base layer */}
              <div className="absolute inset-0" style={{
                backgroundColor: theme.hero_background_type === "solid" ? `hsl(${theme.hero_solid_color})` : `hsl(${theme.background_color})`,
              }} />
              {/* Image layer */}
              {theme.hero_background_type === "image" && theme.hero_background_image && (
                <img src={theme.hero_background_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              )}
              {/* Pattern layer */}
              {theme.hero_background_type === "pattern" && (
                <div className="absolute inset-0" style={{
                  backgroundImage: generatePatternSVG(theme.hero_pattern_type, theme.hero_pattern_opacity, theme.dark_mode_enabled),
                  backgroundRepeat: "repeat",
                }} />
              )}
              {/* Preview text */}
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: `hsl(${theme.text_color})`, fontFamily: theme.heading_font }}>{theme.site_name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: `hsl(${theme.text_color} / 0.5)` }}>Aperçu du fond Hero</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBackgroundEditor;
