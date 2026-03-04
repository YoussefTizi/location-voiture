import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig = {
  confirmed: { label: "Confirmée", class: "bg-emerald-500/10 text-emerald-400" },
  pending: { label: "En attente", class: "bg-amber-500/10 text-amber-400" },
  cancelled: { label: "Annulée", class: "bg-red-500/10 text-red-400" },
};

const BookingsManager = () => {
  const { bookings, cars, updateBooking, deleteBooking } = useAdmin();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    customer_name: "",
    phone: "",
    email: "",
    pickup_date: "",
    return_date: "",
    status: "pending" as "pending" | "confirmed" | "cancelled",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const byStatus = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((b) => {
      const carName = cars.find((c) => c.id === b.car_id)?.name || "";
      const haystack = [
        b.booking_id,
        b.customer_name,
        b.email,
        b.phone,
        b.pickup_date,
        b.return_date,
        b.status,
        carName,
        String(b.price_per_day_snapshot),
        String(b.total_amount_snapshot),
        b.currency_code,
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [bookings, cars, filter, search]);
  const selectedBooking = bookings.find((b) => b.booking_id === selected);
  const getCarName = (id: string) => cars.find((c) => c.id === id)?.name || id;
  const safeValue = (value: string) => value?.trim() ? value : "—";
  const formatSnapshotMoney = (amount: number, code: string) =>
    `${new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)} ${code}`;

  useEffect(() => {
    if (!selectedBooking) return;
    setDraft({
      customer_name: selectedBooking.customer_name || "",
      phone: selectedBooking.phone || "",
      email: selectedBooking.email || "",
      pickup_date: selectedBooking.pickup_date || "",
      return_date: selectedBooking.return_date || "",
      status: selectedBooking.status,
    });
    setError("");
  }, [selectedBooking]);

  const handleSave = async () => {
    if (!selectedBooking) return;
    if (!draft.pickup_date || !draft.return_date) {
      setError("Les dates sont obligatoires.");
      return;
    }
    if (new Date(draft.return_date).getTime() < new Date(draft.pickup_date).getTime()) {
      setError("La date de retour doit être après la date de prise en charge.");
      return;
    }
    setSaving(true);
    setError("");
    const updated = await updateBooking(selectedBooking.booking_id, draft);
    setSaving(false);
    if (!updated) {
      setError("Impossible de mettre à jour la réservation.");
      return;
    }
    setSelected(null);
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;
    const ok = window.confirm("Supprimer cette réservation ?");
    if (!ok) return;
    setDeleting(true);
    const done = await deleteBooking(selectedBooking.booking_id);
    setDeleting(false);
    if (!done) {
      setError("Impossible de supprimer la réservation.");
      return;
    }
    setSelected(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">Réservations</h2>
        <p className="text-sm text-muted-foreground mt-1">{bookings.length} réservations au total</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {s === "all" ? `Toutes (${bookings.length})` : `${statusConfig[s as keyof typeof statusConfig].label} (${bookings.filter((b) => b.status === s).length})`}
            </button>
          ))}
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher (réf, client, email, téléphone...)"
          className="md:w-[340px]"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Réf.</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Client</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Véhicule</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden lg:table-cell">Dates</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden xl:table-cell">Prix/jour</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden xl:table-cell">Total</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.booking_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="p-3 text-muted-foreground font-mono text-xs">{b.booking_id}</td>
                <td className="p-3">
                  <p className="text-foreground font-medium">{b.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{safeValue(b.email)}</p>
                </td>
                <td className="p-3 text-foreground hidden md:table-cell">{getCarName(b.car_id)}</td>
                <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">{b.pickup_date} → {b.return_date}</td>
                <td className="p-3 text-muted-foreground text-xs hidden xl:table-cell">{formatSnapshotMoney(b.price_per_day_snapshot, b.currency_code)}</td>
                <td className="p-3 text-foreground text-xs font-medium hidden xl:table-cell">{formatSnapshotMoney(b.total_amount_snapshot, b.currency_code)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[b.status].class}`}>
                    {statusConfig[b.status].label}
                  </span>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelected(b.booking_id)}>Détails</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Aucune réservation ne correspond à ce filtre</div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Détails de la réservation</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Référence</p><p className="text-foreground font-mono">{selectedBooking.booking_id}</p></div>
                <div><p className="text-xs text-muted-foreground">Statut</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[selectedBooking.status].class}`}>{statusConfig[selectedBooking.status].label}</span>
                </div>
                <div><p className="text-xs text-muted-foreground">Véhicule</p><p className="text-foreground">{getCarName(selectedBooking.car_id)}</p></div>
                <div><p className="text-xs text-muted-foreground">Prix/jour (snapshot)</p><p className="text-foreground">{formatSnapshotMoney(selectedBooking.price_per_day_snapshot, selectedBooking.currency_code)}</p></div>
                <div><p className="text-xs text-muted-foreground">Montant total</p><p className="text-foreground font-semibold">{formatSnapshotMoney(selectedBooking.total_amount_snapshot, selectedBooking.currency_code)}</p></div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Client</Label>
                  <Input value={draft.customer_name} onChange={(e) => setDraft((p) => ({ ...p, customer_name: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Téléphone</Label>
                  <Input value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Prise en charge</Label>
                  <Input type="date" value={draft.pickup_date} onChange={(e) => setDraft((p) => ({ ...p, pickup_date: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Retour</Label>
                  <Input type="date" value={draft.return_date} onChange={(e) => setDraft((p) => ({ ...p, return_date: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Modifier le statut</p>
                <Select value={draft.status} onValueChange={(v) => setDraft((p) => ({ ...p, status: v as "pending" | "confirmed" | "cancelled" }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button variant="destructive" onClick={handleDelete} disabled={deleting || saving}>
                  {deleting ? "Suppression..." : "Supprimer"}
                </Button>
                <Button onClick={handleSave} disabled={saving || deleting}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsManager;
