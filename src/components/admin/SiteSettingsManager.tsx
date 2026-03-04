import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useRef, useMemo } from "react";
import type { Language, City, Agency } from "@/data/site-config";
import { Upload, X, Plus, Pencil, Trash2, MapPin } from "lucide-react";

const langs: Language[] = ["fr", "en", "ar"];
type PartialLocalized = Partial<Record<Language, string>>;

const ImageUpload = ({ value, onChange, label, previewHeight = "h-24" }: { value: string; onChange: (v: string) => void; label: string; previewHeight?: string }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      <div className="flex gap-2 mt-1">
        <Input value={typeof value === "string" && !value.startsWith("data:") ? value : ""} onChange={(e) => onChange(e.target.value)} className="bg-secondary border-border flex-1 text-xs" placeholder="URL ou télécharger" />
        <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0" onClick={() => fileRef.current?.click()}>
          <Upload size={12} /> Fichier
        </Button>
        {value && (
          <Button variant="outline" size="sm" className="text-xs shrink-0 text-red-500 hover:text-red-600" onClick={() => onChange("")}>
            <X size={12} />
          </Button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {value && (
        <div className={`mt-2 rounded-lg border border-border overflow-hidden ${previewHeight}`}>
          <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};

const SiteSettingsManager = () => {
  const {
    siteConfig, updateSiteConfig,
    contact, updateContact, addAgency, updateAgency, deleteAgency,
    seo, updateSEO,
    estimation, updateEstimation,
    bookingForm, updateBookingForm,
    cities, addCity, updateCity, deleteCity,
    sections, updateSection,
  } = useAdmin();
  const [activeLang, setActiveLang] = useState<Language>("fr");
  const [editingCity, setEditingCity] = useState<City | "new" | null>(null);
  const [cityForm, setCityForm] = useState<Omit<City, "id">>({ name: { fr: "", en: "", ar: "" }, image: "", enabled: true });
  const [editingAgency, setEditingAgency] = useState<Agency | "new" | null>(null);
  const [agencyForm, setAgencyForm] = useState<Omit<Agency, "id">>({
    name: { fr: "", en: "", ar: "" }, address: { fr: "", en: "", ar: "" },
    lat: 33.57, lng: -7.59, phone: "", google_maps_url: "", enabled: true,
  });

  const estimationSection = sections.find((s) => s.type === "estimation");
  const estimationSectionContent = useMemo(() => {
    if (!estimationSection?.content) return {};
    try {
      const parsed = JSON.parse(estimationSection.content);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }, [estimationSection?.content]);

  const estimationButtonLabelValue = (() => {
    const label = (estimationSectionContent as { button_label?: unknown }).button_label;
    if (typeof label === "string") return label;
    if (typeof label === "object" && label !== null) {
      const localized = label as Partial<Record<Language, string>>;
      return localized[activeLang] || localized.fr || "";
    }
    return "";
  })();

  const updateEstimationButtonLabel = (value: string) => {
    if (!estimationSection) return;
    const label = (estimationSectionContent as { button_label?: unknown }).button_label;
    const localized = typeof label === "object" && label !== null
      ? (label as Partial<Record<Language, string>>)
      : {};
    const nextContent = {
      ...estimationSectionContent,
      button_label: {
        ...localized,
        [activeLang]: value,
      },
    };
    updateSection(estimationSection.id, { content: JSON.stringify(nextContent) });
  };

  const insuranceModalContent = ((estimationSectionContent as { insurance_modal?: unknown }).insurance_modal ?? {}) as Record<string, unknown>;
  const getLocalizedFieldValue = (field: string) => {
    const raw = insuranceModalContent[field];
    if (typeof raw === "string") return raw;
    if (typeof raw === "object" && raw !== null) {
      const localized = raw as PartialLocalized;
      return localized[activeLang] || localized.fr || localized.en || "";
    }
    return "";
  };
  const updateInsuranceModalField = (field: string, value: string) => {
    if (!estimationSection) return;
    const raw = insuranceModalContent[field];
    const localized = typeof raw === "object" && raw !== null
      ? (raw as PartialLocalized)
      : {};
    const nextContent = {
      ...estimationSectionContent,
      insurance_modal: {
        ...insuranceModalContent,
        [field]: {
          ...localized,
          [activeLang]: value,
        },
      },
    };
    updateSection(estimationSection.id, { content: JSON.stringify(nextContent) });
  };

  const openCityEditor = (city: City | "new") => {
    if (city === "new") {
      setCityForm({ name: { fr: "", en: "", ar: "" }, image: "", enabled: true });
    } else {
      setCityForm({ name: city.name, image: city.image, enabled: city.enabled });
    }
    setEditingCity(city);
  };

  const saveCityForm = () => {
    if (editingCity === "new") {
      addCity({ id: `city-${Date.now()}`, ...cityForm });
    } else if (editingCity && typeof editingCity === "object") {
      updateCity(editingCity.id, cityForm);
    }
    setEditingCity(null);
  };

  const openAgencyEditor = (agency: Agency | "new") => {
    if (agency === "new") {
      setAgencyForm({ name: { fr: "", en: "", ar: "" }, address: { fr: "", en: "", ar: "" }, lat: 33.57, lng: -7.59, phone: "", google_maps_url: "", enabled: true });
    } else {
      setAgencyForm({ name: agency.name, address: agency.address, lat: agency.lat, lng: agency.lng, phone: agency.phone, google_maps_url: agency.google_maps_url, enabled: agency.enabled });
    }
    setEditingAgency(agency);
  };

  const saveAgencyForm = () => {
    const gUrl = agencyForm.google_maps_url || `https://maps.google.com/?q=${agencyForm.lat},${agencyForm.lng}`;
    if (editingAgency === "new") {
      addAgency({ id: `agency-${Date.now()}`, ...agencyForm, google_maps_url: gUrl });
    } else if (editingAgency && typeof editingAgency === "object") {
      updateAgency(editingAgency.id, { ...agencyForm, google_maps_url: gUrl });
    }
    setEditingAgency(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">Paramètres du Site</h2>
        <p className="text-sm text-muted-foreground mt-1">Logo, contact, villes, estimation WhatsApp, SEO</p>
      </div>

      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Language)} className="mb-4">
        <TabsList className="bg-secondary">
          {langs.map(l => <TabsTrigger key={l} value={l} className="text-xs uppercase">{l}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo & Branding */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Logo & Marque</p>
          <div>
            <Label className="text-xs text-muted-foreground">Mode d'affichage du logo</Label>
            <Select value={siteConfig.logo_display_mode} onValueChange={(v) => updateSiteConfig({ logo_display_mode: v as "text" | "image" })}>
              <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Logo texte</SelectItem>
                <SelectItem value="image">Logo image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Texte du logo</Label>
            <Input value={siteConfig.logo_text} onChange={(e) => updateSiteConfig({ logo_text: e.target.value })} className="mt-1 bg-secondary border-border" />
          </div>
          <ImageUpload value={siteConfig.logo_image} onChange={(v) => updateSiteConfig({ logo_image: v })} label="Image du logo" previewHeight="h-12" />
          <div>
            <Label className="text-xs text-muted-foreground">Slogan ({activeLang.toUpperCase()})</Label>
            <Input value={siteConfig.logo_tagline[activeLang]}
              onChange={(e) => updateSiteConfig({ logo_tagline: { ...siteConfig.logo_tagline, [activeLang]: e.target.value } })}
              className="mt-1 bg-secondary border-border" dir={activeLang === "ar" ? "rtl" : "ltr"} />
          </div>
          <ImageUpload value={siteConfig.hero_background_image} onChange={(v) => updateSiteConfig({ hero_background_image: v })} label="Image de fond du hero (Sporty)" />
          <div>
            <Label className="text-xs text-muted-foreground">Mode image Hero (côté)</Label>
            <Select value={siteConfig.hero_side_image_mode} onValueChange={(v) => updateSiteConfig({ hero_side_image_mode: v as "image" | "car_showcase" })}>
              <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image personnalisée</SelectItem>
                <SelectItem value="car_showcase">Showcase véhicule</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {siteConfig.hero_side_image_mode === "image" && (
            <ImageUpload value={siteConfig.hero_side_image} onChange={(v) => updateSiteConfig({ hero_side_image: v })} label="Image Hero (côté)" previewHeight="h-32" />
          )}
          <div>
            <Label className="text-xs text-muted-foreground">Copyright</Label>
            <Input value={siteConfig.copyright} onChange={(e) => updateSiteConfig({ copyright: e.target.value })} className="mt-1 bg-secondary border-border" />
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Contact & WhatsApp</p>
          <div>
            <Label className="text-xs text-muted-foreground">Téléphone</Label>
            <Input value={contact.phone} onChange={(e) => updateContact({ phone: e.target.value })} className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Numéro WhatsApp</Label>
            <Input value={contact.whatsapp} onChange={(e) => updateContact({ whatsapp: e.target.value })} className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value={contact.email} onChange={(e) => updateContact({ email: e.target.value })} className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Adresse ({activeLang.toUpperCase()})</Label>
            <Input value={contact.address[activeLang]}
              onChange={(e) => updateContact({ address: { ...contact.address, [activeLang]: e.target.value } })}
              className="mt-1 bg-secondary border-border" dir={activeLang === "ar" ? "rtl" : "ltr"} />
          </div>
        </div>

        {/* Cities Management */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Villes du calculateur</p>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => openCityEditor("new")}>
              <Plus size={12} /> Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {cities.map(city => (
              <div key={city.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-secondary/50">
                <div className="flex items-center gap-3">
                  {city.image ? (
                    <img src={city.image} alt={city.name.fr} className="w-8 h-8 rounded-md object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">{city.name.fr.charAt(0)}</div>
                  )}
                  <span className="text-sm">{city.name.fr}</span>
                  {!city.enabled && <span className="text-[10px] text-muted-foreground">(masquée)</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openCityEditor(city)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => deleteCity(city.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agencies Management */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Agences (Google Maps)</p>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => openAgencyEditor("new")}>
              <Plus size={12} /> Ajouter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Les agences sont affichées sur la carte dans la section Contact</p>
          <div className="space-y-2">
            {contact.agencies.map(agency => (
              <div key={agency.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{agency.name.fr}</span>
                    <p className="text-[10px] text-muted-foreground">{agency.address.fr}</p>
                  </div>
                  {!agency.enabled && <span className="text-[10px] text-muted-foreground">(masquée)</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openAgencyEditor(agency)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => deleteAgency(agency.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Champs du formulaire de réservation</p>
          <p className="text-xs text-muted-foreground">Activez ou désactivez les champs affichés</p>
          {[
            { key: "show_name" as const, label: "Nom complet" },
            { key: "show_email" as const, label: "Email" },
            { key: "show_phone" as const, label: "Téléphone" },
            { key: "show_pickup_date" as const, label: "Date de prise en charge" },
            { key: "show_return_date" as const, label: "Date de retour" },
          ].map(field => (
            <div key={field.key} className="flex items-center justify-between py-1">
              <Label className="text-xs text-muted-foreground">{field.label}</Label>
              <Switch checked={bookingForm[field.key]} onCheckedChange={(v) => updateBookingForm({ [field.key]: v })} />
            </div>
          ))}
        </div>

        {/* Estimation */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimation WhatsApp</p>
            <Switch checked={estimation.enabled} onCheckedChange={(v) => updateEstimation({ enabled: v })} />
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-2">Champs visibles</p>
          {[
            { key: "show_city_field" as const, label: "Ville" },
            { key: "show_duration_field" as const, label: "Durée" },
            { key: "show_vehicle_field" as const, label: "Véhicule" },
            { key: "show_date_field" as const, label: "Date" },
          ].map(field => (
            <div key={field.key} className="flex items-center justify-between py-1">
              <Label className="text-xs text-muted-foreground">{field.label}</Label>
              <Switch checked={estimation[field.key]} onCheckedChange={(v) => updateEstimation({ [field.key]: v })} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Ville par défaut</Label>
              <Input value={estimation.default_city} onChange={(e) => updateEstimation({ default_city: e.target.value })} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Frais livraison nocturne</Label>
              <Input type="number" value={estimation.night_delivery_fee} onChange={(e) => updateEstimation({ night_delivery_fee: Number(e.target.value) })} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Devise</Label>
              <Input value={estimation.currency} onChange={(e) => updateEstimation({ currency: e.target.value })} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Symbole</Label>
              <Input value={estimation.currency_symbol} onChange={(e) => updateEstimation({ currency_symbol: e.target.value })} className="mt-1 bg-secondary border-border" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Modèle de message WhatsApp</Label>
            <Textarea value={estimation.whatsapp_message_template}
              onChange={(e) => updateEstimation({ whatsapp_message_template: e.target.value })}
              className="mt-1 bg-secondary border-border text-xs" rows={4} />
            <p className="text-[10px] text-muted-foreground mt-1">Variables : {"{vehicle}"}, {"{duration}"}, {"{total}"}, {"{currency}"}, {"{city}"}, {"{date}"}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Texte du bouton ({activeLang.toUpperCase()})</Label>
            <Input
              value={estimationButtonLabelValue}
              onChange={(e) => updateEstimationButtonLabel(e.target.value)}
              className="mt-1 bg-secondary border-border"
              placeholder="Confirmer le prix sur WhatsApp"
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Ce texte s’affiche sur le bouton du formulaire "Calculez Votre Budget".</p>
          </div>
          <div className="pt-2 border-t border-border space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Modal Assurance & Caution ({activeLang.toUpperCase()})</p>
            <div>
              <Label className="text-xs text-muted-foreground">Titre du modal</Label>
              <Input
                value={getLocalizedFieldValue("title")}
                onChange={(e) => updateInsuranceModalField("title", e.target.value)}
                className="mt-1 bg-secondary border-border"
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={getLocalizedFieldValue("description")}
                onChange={(e) => updateInsuranceModalField("description", e.target.value)}
                className="mt-1 bg-secondary border-border text-xs"
                rows={3}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Section "Avec caution"</Label>
              <Textarea
                value={getLocalizedFieldValue("with_caution")}
                onChange={(e) => updateInsuranceModalField("with_caution", e.target.value)}
                className="mt-1 bg-secondary border-border text-xs"
                rows={4}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Une ligne par point.</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Section "Sans caution"</Label>
              <Textarea
                value={getLocalizedFieldValue("without_caution")}
                onChange={(e) => updateInsuranceModalField("without_caution", e.target.value)}
                className="mt-1 bg-secondary border-border text-xs"
                rows={4}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Une ligne par point.</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Label du bouton</Label>
              <Input
                value={getLocalizedFieldValue("button_label")}
                onChange={(e) => updateInsuranceModalField("button_label", e.target.value)}
                className="mt-1 bg-secondary border-border"
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Texte affiché sur le bouton qui ouvre le modal.</p>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">SEO & Métadonnées</p>
          <div>
            <Label className="text-xs text-muted-foreground">Titre SEO ({activeLang.toUpperCase()})</Label>
            <Input value={seo.title[activeLang]}
              onChange={(e) => updateSEO({ title: { ...seo.title, [activeLang]: e.target.value } })}
              className="mt-1 bg-secondary border-border" dir={activeLang === "ar" ? "rtl" : "ltr"} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Mots-clés</Label>
            <Input value={seo.keywords} onChange={(e) => updateSEO({ keywords: e.target.value })} className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description SEO ({activeLang.toUpperCase()})</Label>
            <Textarea value={seo.description[activeLang]}
              onChange={(e) => updateSEO({ description: { ...seo.description, [activeLang]: e.target.value } })}
              className="mt-1 bg-secondary border-border" rows={2} dir={activeLang === "ar" ? "rtl" : "ltr"} />
          </div>
          <ImageUpload value={seo.og_image} onChange={(v) => updateSEO({ og_image: v })} label="Image OG" />
        </div>
      </div>

      {/* City Editor Dialog */}
      <Dialog open={!!editingCity} onOpenChange={() => setEditingCity(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editingCity === "new" ? "Ajouter une ville" : "Modifier la ville"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {langs.map(l => (
              <div key={l}>
                <Label className="text-xs text-muted-foreground">Nom ({l.toUpperCase()})</Label>
                <Input value={cityForm.name[l]}
                  onChange={(e) => setCityForm(p => ({ ...p, name: { ...p.name, [l]: e.target.value } }))}
                  className="mt-1 bg-secondary border-border" dir={l === "ar" ? "rtl" : "ltr"} />
              </div>
            ))}
            <ImageUpload value={cityForm.image} onChange={(v) => setCityForm(p => ({ ...p, image: v }))} label="Image de la ville" />
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Visible</Label>
              <Switch checked={cityForm.enabled} onCheckedChange={(v) => setCityForm(p => ({ ...p, enabled: v }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditingCity(null)}>Annuler</Button>
              <Button size="sm" className="text-xs" onClick={saveCityForm}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agency Editor Dialog */}
      <Dialog open={!!editingAgency} onOpenChange={() => setEditingAgency(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editingAgency === "new" ? "Ajouter une agence" : "Modifier l'agence"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {langs.map(l => (
              <div key={`name-${l}`}>
                <Label className="text-xs text-muted-foreground">Nom ({l.toUpperCase()})</Label>
                <Input value={agencyForm.name[l]}
                  onChange={(e) => setAgencyForm(p => ({ ...p, name: { ...p.name, [l]: e.target.value } }))}
                  className="mt-1 bg-secondary border-border" dir={l === "ar" ? "rtl" : "ltr"} />
              </div>
            ))}
            {langs.map(l => (
              <div key={`addr-${l}`}>
                <Label className="text-xs text-muted-foreground">Adresse ({l.toUpperCase()})</Label>
                <Input value={agencyForm.address[l]}
                  onChange={(e) => setAgencyForm(p => ({ ...p, address: { ...p.address, [l]: e.target.value } }))}
                  className="mt-1 bg-secondary border-border" dir={l === "ar" ? "rtl" : "ltr"} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <Input type="number" step="0.0001" value={agencyForm.lat}
                  onChange={(e) => setAgencyForm(p => ({ ...p, lat: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Longitude</Label>
                <Input type="number" step="0.0001" value={agencyForm.lng}
                  onChange={(e) => setAgencyForm(p => ({ ...p, lng: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Téléphone</Label>
              <Input value={agencyForm.phone}
                onChange={(e) => setAgencyForm(p => ({ ...p, phone: e.target.value }))}
                className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL Google Maps (optionnel)</Label>
              <Input value={agencyForm.google_maps_url}
                onChange={(e) => setAgencyForm(p => ({ ...p, google_maps_url: e.target.value }))}
                className="mt-1 bg-secondary border-border" placeholder="Auto-générée si vide" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Visible</Label>
              <Switch checked={agencyForm.enabled} onCheckedChange={(v) => setAgencyForm(p => ({ ...p, enabled: v }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditingAgency(null)}>Annuler</Button>
              <Button size="sm" className="text-xs" onClick={saveAgencyForm}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteSettingsManager;
