import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useRef } from "react";
import type { Car } from "@/data/mock-database";
import { Upload, X, Star, ChevronLeft, ChevronRight } from "lucide-react";

const categoryColors: Record<string, string> = {
  Sedan: "bg-blue-500/10 text-blue-600",
  SUV: "bg-emerald-500/10 text-emerald-600",
  Sports: "bg-red-500/10 text-red-600",
  Electric: "bg-cyan-500/10 text-cyan-600",
  Compact: "bg-amber-500/10 text-amber-600",
  Wagon: "bg-purple-500/10 text-purple-600",
};

const statusColors: Record<string, string> = {
  available: "bg-emerald-500/10 text-emerald-600",
  rented: "bg-amber-500/10 text-amber-600",
  maintenance: "bg-red-500/10 text-red-600",
};

const statusLabels: Record<string, string> = {
  available: "Disponible",
  rented: "Loué",
  maintenance: "Maintenance",
};

const emptyCar: Omit<Car, "id"> = {
  name: "", category: "Sedan", price_per_day: 0, images: [],
  transmission: "automatic", fuel_type: "petrol", seats: 5,
  availability_status: "available", featured: false, description: "",
};

/* ─── Image Manager ─── */
const ImageManager = ({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) => {
  const [newUrl, setNewUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addImage = () => {
    if (newUrl.trim()) {
      onChange([...images, newUrl.trim()]);
      setNewUrl("");
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange([...images, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => onChange(images.filter((_, i) => i !== index));

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const arr = [...images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  const setAsFeatured = (index: number) => {
    if (index === 0) return;
    const arr = [...images];
    const [item] = arr.splice(index, 1);
    arr.unshift(item);
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Images ({images.length})</Label>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group rounded-md overflow-hidden border border-border aspect-video bg-secondary">
              <img src={img} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">PRINCIPALE</span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {i > 0 && <button onClick={() => moveImage(i, i - 1)} className="w-6 h-6 rounded bg-white/20 text-white text-xs hover:bg-white/30 flex items-center justify-center"><ChevronLeft size={14} /></button>}
                {i > 0 && <button onClick={() => setAsFeatured(i)} className="w-6 h-6 rounded bg-primary/80 text-primary-foreground hover:bg-primary flex items-center justify-center"><Star size={12} /></button>}
                {i < images.length - 1 && <button onClick={() => moveImage(i, i + 1)} className="w-6 h-6 rounded bg-white/20 text-white text-xs hover:bg-white/30 flex items-center justify-center"><ChevronRight size={14} /></button>}
                <button onClick={() => removeImage(i)} className="w-6 h-6 rounded bg-destructive/80 text-white hover:bg-destructive flex items-center justify-center"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL de l'image…" className="bg-secondary border-border text-xs flex-1" onKeyDown={(e) => e.key === "Enter" && addImage()} />
        <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={addImage}>Ajouter</Button>
        <Button variant="outline" size="sm" className="text-xs shrink-0 gap-1" onClick={() => fileRef.current?.click()}>
          <Upload size={12} /> Fichier
        </Button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
};

/* ─── Car Form ─── */
const CarForm = ({ initial, onSave, onClose }: {
  initial?: Car;
  onSave: (data: Omit<Car, "id"> & { id?: string }) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState(initial || emptyCar);
  const up = (patch: Partial<typeof form>) => setForm(p => ({ ...p, ...patch }));

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <Label className="text-xs text-muted-foreground">Nom du véhicule</Label>
        <Input value={form.name} onChange={(e) => up({ name: e.target.value })} className="mt-1 bg-secondary border-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Catégorie</Label>
          <Select value={form.category} onValueChange={(v) => up({ category: v })}>
            <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>{["Sedan", "SUV", "Sports", "Compact", "Electric", "Wagon"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Prix / Jour (DH)</Label>
          <Input type="number" value={form.price_per_day} onChange={(e) => up({ price_per_day: +e.target.value })} className="mt-1 bg-secondary border-border" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Transmission</Label>
          <Select value={form.transmission} onValueChange={(v: any) => up({ transmission: v })}>
            <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="automatic">Automatique</SelectItem><SelectItem value="manual">Manuelle</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Carburant</Label>
          <Select value={form.fuel_type} onValueChange={(v: any) => up({ fuel_type: v })}>
            <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>{["petrol", "diesel", "electric", "hybrid"].map(f => <SelectItem key={f} value={f}>{f === "petrol" ? "Essence" : f === "diesel" ? "Diesel" : f === "electric" ? "Électrique" : "Hybride"}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Places</Label>
          <Input type="number" value={form.seats} onChange={(e) => up({ seats: +e.target.value })} className="mt-1 bg-secondary border-border" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Mis en avant</Label>
        <Switch checked={form.featured} onCheckedChange={(v) => up({ featured: v })} />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Statut</Label>
        <Select value={form.availability_status} onValueChange={(v: any) => up({ availability_status: v })}>
          <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="rented">Loué</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ImageManager images={form.images || []} onChange={(imgs) => up({ images: imgs })} />
      <div>
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea value={form.description} onChange={(e) => up({ description: e.target.value })} className="mt-1 bg-secondary border-border" rows={2} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" className="text-xs" onClick={onClose}>Annuler</Button>
        <Button size="sm" className="text-xs" onClick={() => onSave(form)}>Enregistrer</Button>
      </div>
    </div>
  );
};

/* ─── Main ─── */
const CarsManager = () => {
  const { cars, addCar, updateCar, deleteCar } = useAdmin();
  const [editing, setEditing] = useState<Car | "new" | null>(null);
  const [filter, setFilter] = useState("all");

  const categories = ["all", ...Array.from(new Set(cars.map(c => c.category)))];
  const filtered = filter === "all" ? cars : cars.filter(c => c.category === filter);

  const handleSave = (data: any) => {
    if (editing === "new") {
      addCar({ ...data, id: `car-${Date.now()}` });
    } else if (editing && typeof editing === "object") {
      updateCar(editing.id, data);
    }
    setEditing(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">Gestion de la Flotte</h2>
          <p className="text-sm text-muted-foreground mt-1">{cars.length} véhicules</p>
        </div>
        <Button size="sm" className="text-xs" onClick={() => setEditing("new")}>+ Ajouter un véhicule</Button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${filter === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {c === "all" ? "Tous" : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(car => (
          <div key={car.id} className="rounded-lg border border-border bg-card p-4 flex gap-4">
            <div className="w-24 h-20 rounded-md overflow-hidden shrink-0 bg-secondary flex items-center justify-center">
              {car.images[0] ? (
                <img src={car.images[0]} alt={car.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold opacity-10">{car.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground truncate">{car.name}</h3>
                {car.featured && <Star size={12} className="text-amber-500 fill-amber-500" />}
              </div>
              <div className="flex gap-1.5 flex-wrap mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[car.category] || "bg-secondary text-muted-foreground"}`}>{car.category}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[car.availability_status]}`}>{statusLabels[car.availability_status]}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{car.images.length} img</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{car.price_per_day} DH/jour</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setEditing(car)}>Modifier</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-destructive hover:text-destructive" onClick={() => deleteCar(car.id)}>Supprimer</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing === "new" ? "Ajouter un véhicule" : "Modifier le véhicule"}</DialogTitle>
          </DialogHeader>
          <CarForm
            initial={editing && editing !== "new" ? editing : undefined}
            onSave={handleSave}
            onClose={() => setEditing(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarsManager;
