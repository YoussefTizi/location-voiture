import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig = {
  confirmed: { label: "Confirmée", class: "bg-emerald-500/10 text-emerald-400" },
  pending: { label: "En attente", class: "bg-amber-500/10 text-amber-400" },
  cancelled: { label: "Annulée", class: "bg-red-500/10 text-red-400" },
};

const BookingsManager = () => {
  const { bookings, cars, updateBookingStatus } = useAdmin();
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const selectedBooking = bookings.find((b) => b.booking_id === selected);
  const getCarName = (id: string) => cars.find((c) => c.id === id)?.name || id;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">Réservations</h2>
        <p className="text-sm text-muted-foreground mt-1">{bookings.length} réservations au total</p>
      </div>

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

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Réf.</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Client</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Véhicule</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden lg:table-cell">Dates</th>
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
                  <p className="text-xs text-muted-foreground">{b.email}</p>
                </td>
                <td className="p-3 text-foreground hidden md:table-cell">{getCarName(b.car_id)}</td>
                <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">{b.pickup_date} → {b.return_date}</td>
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
                <div><p className="text-xs text-muted-foreground">Client</p><p className="text-foreground">{selectedBooking.customer_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="text-foreground">{selectedBooking.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-foreground">{selectedBooking.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Véhicule</p><p className="text-foreground">{getCarName(selectedBooking.car_id)}</p></div>
                <div><p className="text-xs text-muted-foreground">Prise en charge</p><p className="text-foreground">{selectedBooking.pickup_date}</p></div>
                <div><p className="text-xs text-muted-foreground">Retour</p><p className="text-foreground">{selectedBooking.return_date}</p></div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Modifier le statut</p>
                <Select value={selectedBooking.status} onValueChange={(v) => updateBookingStatus(selectedBooking.booking_id, v as any)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsManager;