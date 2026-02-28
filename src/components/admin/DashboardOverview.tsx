import { useAdmin } from "@/context/AdminContext";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="rounded-lg border border-border bg-card p-5 animate-fade-in">
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-display font-semibold text-foreground">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const DashboardOverview = () => {
  const { stats, cars, bookings } = useAdmin();
  const pending = bookings.filter((b) => b.status === "pending").length;
  const available = cars.filter((c) => c.availability_status === "available").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">Vue d'ensemble</h2>
        <p className="text-sm text-muted-foreground mt-1">Performance de l'activité en temps réel</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Chiffre d'affaires" value={`${stats.total_revenue.toLocaleString()} DH`} sub="Ce mois-ci" />
        <StatCard label="Réservations actives" value={String(stats.active_bookings)} sub={`${pending} en attente`} />
        <StatCard label="Flotte" value={`${cars.length} véhicules`} sub={`${available} disponibles`} />
        <StatCard label="Taux d'utilisation" value={`${stats.utilization_rate}%`} sub="Utilisation flotte" />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Évolution du chiffre d'affaires</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats.monthly_revenue}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(43 72% 58%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(43 72% 58%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(220 10% 50%)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220 10% 50%)", fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k DH`} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
                fontSize: 13,
              }}
              formatter={(value: number) => [`${value.toLocaleString()} DH`, "Revenus"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(43 72% 58%)" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Réservations récentes</p>
          <div className="space-y-3">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.booking_id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-foreground font-medium">{b.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{b.booking_id}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                  b.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {b.status === "confirmed" ? "Confirmée" : b.status === "pending" ? "En attente" : "Annulée"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Véhicules en vedette</p>
          <div className="space-y-3">
            {cars.filter((c) => c.featured).slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-foreground font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.category}</p>
                </div>
                <span className="text-primary font-medium">{c.price_per_day} DH/jour</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;