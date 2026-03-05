import { useState, useRef } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { initialExtendedTheme, landingPageThemePresets, type CustomThemePreset, type LandingPageTheme } from "@/data/site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Download, Plus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const ThemesManager = () => {
  const { theme, updateTheme, customThemes, addCustomTheme, deleteCustomTheme, sections, updateSection, siteConfig, updateSiteConfig } = useAdmin();
  const [addOpen, setAddOpen] = useState(false);
  const [importError, setImportError] = useState("");
  const [previewData, setPreviewData] = useState<CustomThemePreset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const builtInPreviewFileRef = useRef<HTMLInputElement>(null);
  const [builtInPreviewTarget, setBuiltInPreviewTarget] = useState<LandingPageTheme | null>(null);

  const builtInKeys = Object.keys(landingPageThemePresets) as LandingPageTheme[];
  const themePreviewOverrides = siteConfig.theme_preview_images || {};
  const getThemePreviewImage = (preset: { preview_image?: string; overrides: Record<string, unknown> }) =>
    (typeof preset.preview_image === "string" && preset.preview_image.trim())
      || (typeof preset.overrides.hero_background_image === "string" ? preset.overrides.hero_background_image : "")
      || "";
  const getBuiltInPreviewImage = (key: LandingPageTheme, preset: { preview_image?: string; overrides: Record<string, unknown> }) => {
    const override = themePreviewOverrides[key];
    if (typeof override === "string" && override.trim()) return override.trim();
    return getThemePreviewImage(preset);
  };
  const setBuiltInPreviewImage = (key: LandingPageTheme, value: string) => {
    updateSiteConfig({
      theme_preview_images: {
        ...themePreviewOverrides,
        [key]: value,
      },
    });
  };
  const clearBuiltInPreviewImage = (key: LandingPageTheme) => {
    const next = { ...themePreviewOverrides };
    delete next[key];
    updateSiteConfig({ theme_preview_images: next });
  };

  const applyTheme = (key: string) => {
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

    const builtIn = landingPageThemePresets[key as LandingPageTheme];
    if (builtIn) {
      updateTheme({
        ...initialExtendedTheme,
        ...builtIn.overrides,
        landing_page_theme: key as LandingPageTheme,
        footer_background_color: builtIn.overrides.footer_background_color ?? builtIn.overrides.secondary_color ?? initialExtendedTheme.footer_background_color,
        footer_text_color: builtIn.overrides.footer_text_color ?? builtIn.overrides.text_color ?? initialExtendedTheme.footer_text_color,
      });
    } else {
      const custom = customThemes.find(t => t.id === key);
      if (custom) {
        updateTheme({
          ...initialExtendedTheme,
          ...custom.overrides,
          landing_page_theme: key,
          footer_background_color: custom.overrides.footer_background_color ?? custom.overrides.secondary_color ?? initialExtendedTheme.footer_background_color,
          footer_text_color: custom.overrides.footer_text_color ?? custom.overrides.text_color ?? initialExtendedTheme.footer_text_color,
        });
      }
    }
    toast.success("Thème appliqué !");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        // Validate required fields
        if (!json.name || !json.overrides || !json.preview_colors) {
          setImportError("Fichier invalide : les champs 'name', 'preview_colors' et 'overrides' sont requis.");
          return;
        }
        const preset: CustomThemePreset = {
          id: `custom-${Date.now()}`,
          name: json.name,
          description: json.description || "",
          preview_colors: json.preview_colors,
          preview_image: typeof json.preview_image === "string" ? json.preview_image : "",
          overrides: json.overrides,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        setPreviewData(preset);
      } catch {
        setImportError("Le fichier n'est pas un JSON valide.");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-uploaded
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!previewData) return;
    addCustomTheme(previewData);
    setPreviewData(null);
    setAddOpen(false);
    toast.success(`Thème "${previewData.name}" importé avec succès !`);
  };

  const exportTheme = (id: string) => {
    let data: { name: string; description: string; preview_colors: string[]; preview_image?: string; overrides: Record<string, unknown> };
    const builtIn = landingPageThemePresets[id as LandingPageTheme];
    if (builtIn) {
      data = { name: builtIn.name, description: builtIn.description, preview_colors: builtIn.preview_colors, preview_image: builtIn.preview_image, overrides: builtIn.overrides as Record<string, unknown> };
    } else {
      const custom = customThemes.find(t => t.id === id);
      if (!custom) return;
      data = { name: custom.name, description: custom.description, preview_colors: custom.preview_colors, preview_image: custom.preview_image, overrides: custom.overrides as Record<string, unknown> };
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theme-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Thème exporté !");
  };

  const isActive = (key: string) => theme.landing_page_theme === key;
  const handleBuiltInPreviewFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = builtInPreviewTarget;
    if (!file || !target) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBuiltInPreviewImage(target, (ev.target?.result as string) || "");
      setBuiltInPreviewTarget(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">🎨 Gestion des Thèmes</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos thèmes de landing page</p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="gap-2">
          <Plus size={14} /> Ajouter un thème
        </Button>
      </div>

      {/* Built-in themes */}
      <div>
        <input
          ref={builtInPreviewFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBuiltInPreviewFileUpload}
        />
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Thèmes intégrés ({builtInKeys.length})</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {builtInKeys.map(key => {
            const preset = landingPageThemePresets[key];
            const active = isActive(key);
            const builtInImage = getBuiltInPreviewImage(key, { preview_image: preset.preview_image, overrides: preset.overrides as Record<string, unknown> });
            return (
              <div key={key} className={`rounded-xl border-2 p-4 transition-all ${active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/30"}`}>
                {builtInImage ? (
                  <div className="mb-3 rounded-lg overflow-hidden border border-border h-28">
                    <img
                      src={builtInImage}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-3 rounded-lg border border-border h-28" style={{ background: `linear-gradient(135deg, hsl(${preset.preview_colors[0]}) 0%, hsl(${preset.preview_colors[1]}) 55%, hsl(${preset.preview_colors[2]}) 100%)` }} />
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-1.5">
                    {preset.preview_colors.map((c, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border border-border" style={{ background: `hsl(${c})` }} />
                    ))}
                  </div>
                  {active && (
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      <Check size={14} /> Actif
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{preset.description}</p>
                <div className="mt-2 space-y-2">
                  <Input
                    value={themePreviewOverrides[key] || ""}
                    onChange={(e) => setBuiltInPreviewImage(key, e.target.value)}
                    placeholder="URL image preview (optionnel)"
                    className="h-8 text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setBuiltInPreviewTarget(key);
                        builtInPreviewFileRef.current?.click();
                      }}
                    >
                      Upload image
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => clearBuiltInPreviewImage(key)}>
                      Reset
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant={active ? "secondary" : "default"} size="sm" className="flex-1 text-xs" onClick={() => applyTheme(key)} disabled={active}>
                    {active ? "Appliqué" : "Appliquer"}
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href={`/preview/${key}`} target="_blank" rel="noreferrer">
                      Preview
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => exportTheme(key)}>
                    <Download size={12} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom themes */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Thèmes personnalisés ({customThemes.length})</p>
        {customThemes.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="text-sm text-muted-foreground">Aucun thème personnalisé</p>
            <p className="text-xs text-muted-foreground mt-1">Uploadez un fichier JSON pour ajouter un thème</p>
            <Button onClick={() => setAddOpen(true)} variant="outline" size="sm" className="mt-4 gap-2">
              <Plus size={14} /> Importer un thème
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customThemes.map(ct => {
              const active = isActive(ct.id);
              return (
                <div key={ct.id} className={`rounded-xl border-2 p-4 transition-all ${active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/30"}`}>
                  {getThemePreviewImage({ preview_image: ct.preview_image, overrides: ct.overrides as Record<string, unknown> }) ? (
                    <div className="mb-3 rounded-lg overflow-hidden border border-border h-28">
                      <img
                        src={getThemePreviewImage({ preview_image: ct.preview_image, overrides: ct.overrides as Record<string, unknown> })}
                        alt={ct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-3 rounded-lg border border-border h-28" style={{ background: `linear-gradient(135deg, hsl(${ct.preview_colors[0]}) 0%, hsl(${ct.preview_colors[1] || ct.preview_colors[0]}) 55%, hsl(${ct.preview_colors[2] || ct.preview_colors[0]}) 100%)` }} />
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-1.5">
                      {ct.preview_colors.map((c, i) => (
                        <div key={i} className="w-7 h-7 rounded-full border border-border" style={{ background: `hsl(${c})` }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      {active && (
                        <span className="flex items-center gap-1 text-xs font-medium text-primary">
                          <Star size={12} /> Actif
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{ct.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ct.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Ajouté le {new Date(ct.createdAt).toLocaleDateString("fr")}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant={active ? "secondary" : "default"} size="sm" className="flex-1 text-xs" onClick={() => applyTheme(ct.id)} disabled={active}>
                      {active ? "Appliqué" : "Appliquer"}
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs">
                      <Link href={`/preview/${ct.id}`} target="_blank" rel="noreferrer">
                        Preview
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => exportTheme(ct.id)}>
                      <Download size={12} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive">
                          <Trash2 size={12} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer "{ct.name}" ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { deleteCustomTheme(ct.id); toast.success("Thème supprimé"); }}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add theme dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); setPreviewData(null); setImportError(""); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importer un thème</DialogTitle>
            <DialogDescription>Uploadez un fichier JSON contenant la configuration du thème.</DialogDescription>
          </DialogHeader>

          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileUpload} />

          {!previewData ? (
            <div className="space-y-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50 transition-colors"
              >
                <Upload className="mx-auto mb-3 text-muted-foreground" size={40} />
                <p className="text-sm font-medium text-foreground">Cliquer pour choisir un fichier JSON</p>
                <p className="text-xs text-muted-foreground mt-1">ou glissez-déposez ici</p>
              </button>
              {importError && <p className="text-xs text-destructive">{importError}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                {getThemePreviewImage({ preview_image: previewData.preview_image, overrides: previewData.overrides as Record<string, unknown> }) && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-border h-28">
                    <img
                      src={getThemePreviewImage({ preview_image: previewData.preview_image, overrides: previewData.overrides as Record<string, unknown> })}
                      alt={previewData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-1.5 mb-3">
                  {previewData.preview_colors.map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-border" style={{ background: `hsl(${c})` }} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground">{previewData.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{previewData.description}</p>
                <div className="mt-3 text-[10px] text-muted-foreground space-y-0.5">
                  {previewData.overrides.font_family && <p>Police : {previewData.overrides.font_family}</p>}
                  {previewData.overrides.heading_font && <p>Titres : {previewData.overrides.heading_font}</p>}
                  {previewData.overrides.button_style && <p>Boutons : {previewData.overrides.button_style}</p>}
                  {previewData.overrides.card_style_variant && <p>Cartes : {previewData.overrides.card_style_variant}</p>}
                </div>
              </div>

              {/* Mini preview */}
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="p-4 text-center" style={{ background: previewData.overrides.background_color ? `hsl(${previewData.overrides.background_color})` : "#fafafa" }}>
                  <h3 className="text-base font-bold" style={{
                    color: `hsl(${previewData.overrides.primary_color || "220 70% 50%"})`,
                    fontFamily: previewData.overrides.heading_font || "inherit",
                  }}>
                    Aperçu du thème
                  </h3>
                  <p className="text-xs mt-1" style={{ color: previewData.overrides.text_color ? `hsl(${previewData.overrides.text_color})` : "#666" }}>
                    {previewData.name}
                  </p>
                  <button className="mt-3 px-4 py-1.5 text-xs font-medium text-white rounded-md" style={{
                    background: `hsl(${previewData.overrides.primary_color || "220 70% 50%"})`,
                    borderRadius: previewData.overrides.button_style === "pill" ? "9999px" : previewData.overrides.button_style === "sharp" ? "0" : "0.5rem",
                  }}>
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {previewData ? (
              <>
                <Button variant="outline" onClick={() => { setPreviewData(null); }}>Changer de fichier</Button>
                <Button onClick={confirmImport}>Importer ce thème</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setAddOpen(false)}>Fermer</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemesManager;
