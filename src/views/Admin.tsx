"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardOverview from "@/components/admin/DashboardOverview";
import CarsManager from "@/components/admin/CarsManager";
import BookingsManager from "@/components/admin/BookingsManager";
import ThemeEngine from "@/components/admin/ThemeEngine";
import SectionsManager from "@/components/admin/SectionsManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import ThemesManager from "@/components/admin/ThemesManager";
import { useAdmin } from "@/context/AdminContext";
import Login from "@/views/Login";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Sun, Moon, ExternalLink, Search, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Tab = "overview" | "fleet" | "bookings" | "theme" | "themes" | "sections" | "settings";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Tableau de bord" },
  { id: "fleet", label: "Véhicules" },
  { id: "bookings", label: "Réservations" },
  { id: "sections", label: "Sections" },
  { id: "themes", label: "Thèmes" },
  { id: "theme", label: "Apparence" },
  { id: "settings", label: "Paramètres" },
];

const Admin = () => {
  const [active, setActive] = useState<Tab>("overview");
  const [cmdOpen, setCmdOpen] = useState(false);
  const { theme, adminDarkMode, setAdminDarkMode, isAuthenticated, logout } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Sync CSS variables to <html> so portalled elements (Dialog, Select, etc.) inherit them
  useEffect(() => {
    const root = document.documentElement;
    const vars: Record<string, string> = {
      "--card": adminDarkMode ? "220 18% 10%" : "0 0% 100%",
      "--card-foreground": adminDarkMode ? "40 10% 92%" : "220 20% 10%",
      "--border": adminDarkMode ? "220 15% 18%" : "220 10% 88%",
      "--secondary": adminDarkMode ? "220 15% 15%" : "220 10% 93%",
      "--secondary-foreground": adminDarkMode ? "40 10% 85%" : "220 10% 30%",
      "--muted": adminDarkMode ? "220 15% 14%" : "220 10% 93%",
      "--muted-foreground": adminDarkMode ? "220 10% 50%" : "220 10% 45%",
      "--foreground": adminDarkMode ? "40 10% 92%" : "220 20% 10%",
      "--background": adminDarkMode ? "220 20% 7%" : "0 0% 97%",
      "--popover": adminDarkMode ? "220 18% 10%" : "0 0% 100%",
      "--popover-foreground": adminDarkMode ? "40 10% 92%" : "220 20% 10%",
      "--input": adminDarkMode ? "220 15% 16%" : "220 10% 90%",
      "--primary": adminDarkMode ? "40 72% 50%" : "220 70% 50%",
      "--primary-foreground": adminDarkMode ? "220 20% 7%" : "0 0% 100%",
      "--accent": adminDarkMode ? "220 15% 15%" : "220 10% 93%",
      "--accent-foreground": adminDarkMode ? "40 10% 92%" : "220 20% 10%",
    };
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    return () => {
      Object.keys(vars).forEach(k => root.style.removeProperty(k));
    };
  }, [adminDarkMode]);

  if (!isAuthenticated) return <Login />;

  const adminBorder = adminDarkMode ? "hsl(220 15% 18%)" : "hsl(220 10% 88%)";
  const adminMuted = adminDarkMode ? "hsl(220 10% 50%)" : "hsl(220 10% 45%)";
  const adminSecBg = adminDarkMode ? "hsl(220 15% 15%)" : "hsl(220 10% 93%)";

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: adminDarkMode ? "hsl(220 20% 7%)" : "hsl(0 0% 97%)",
        color: adminDarkMode ? "hsl(40 10% 92%)" : "hsl(220 20% 10%)",
        ["--card" as string]: adminDarkMode ? "220 18% 10%" : "0 0% 100%",
        ["--card-foreground" as string]: adminDarkMode ? "40 10% 92%" : "220 20% 10%",
        ["--border" as string]: adminDarkMode ? "220 15% 18%" : "220 10% 88%",
        ["--secondary" as string]: adminDarkMode ? "220 15% 15%" : "220 10% 93%",
        ["--secondary-foreground" as string]: adminDarkMode ? "40 10% 85%" : "220 10% 30%",
        ["--muted" as string]: adminDarkMode ? "220 15% 14%" : "220 10% 93%",
        ["--muted-foreground" as string]: adminDarkMode ? "220 10% 50%" : "220 10% 45%",
        ["--foreground" as string]: adminDarkMode ? "40 10% 92%" : "220 20% 10%",
        ["--background" as string]: adminDarkMode ? "220 20% 7%" : "0 0% 97%",
        ["--popover" as string]: adminDarkMode ? "220 18% 10%" : "0 0% 100%",
        ["--popover-foreground" as string]: adminDarkMode ? "40 10% 92%" : "220 20% 10%",
        ["--input" as string]: adminDarkMode ? "220 15% 16%" : "220 10% 90%",
      } as React.CSSProperties}
    >
      <header className="sticky top-0 z-50 px-2 sm:px-4 pt-2 sm:pt-4">
        <div className="max-w-5xl mx-auto rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between transition-colors duration-300"
          style={{
            background: adminDarkMode ? "hsl(220 18% 10% / 0.7)" : "hsl(0 0% 100% / 0.8)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${adminBorder}`,
          }}>
          <div className="flex items-center gap-3 sm:gap-6">
            <button onClick={() => router.push("/")} className="flex items-center gap-2 group">
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: `hsl(${theme.primary_color})`, color: "hsl(220 20% 7%)" }}>R</span>
              <span className="font-display font-semibold text-sm hidden sm:inline">{theme.site_name}</span>
            </button>
            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActive(t.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: active === t.id ? `hsl(${theme.primary_color} / 0.1)` : "transparent",
                    color: active === t.id ? `hsl(${theme.primary_color})` : adminMuted,
                  }}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button onClick={() => setAdminDarkMode(!adminDarkMode)} className="p-2 rounded-lg transition-colors hover:bg-black/5" style={{ color: adminMuted }}>
              {adminDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setCmdOpen(true)} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{ background: adminSecBg, border: `1px solid ${adminBorder}`, color: adminMuted }}>
              <Search size={14} />
              <span className="hidden md:inline">Rechercher…</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded hidden md:inline" style={{ background: adminDarkMode ? "hsl(220 15% 20%)" : "hsl(220 10% 88%)" }}>⌘K</kbd>
            </button>
            <button onClick={() => router.push("/")} className="hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-medium transition-colors items-center gap-1.5"
              style={{ background: `hsl(${theme.primary_color})`, color: "hsl(220 20% 7%)" }}>
              <ExternalLink size={12} /> <span className="hidden md:inline">Voir le site</span>
            </button>
            <button onClick={logout} className="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-400" title="Déconnexion">
              <LogOut size={16} />
            </button>
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-lg transition-colors" style={{ color: adminMuted }}>
                  <Menu size={18} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0" style={{
                background: adminDarkMode ? "hsl(220 18% 10%)" : "hsl(0 0% 100%)",
                color: adminDarkMode ? "hsl(40 10% 92%)" : "hsl(220 20% 10%)",
                borderColor: adminBorder,
              }}>
                <div className="p-4 space-y-1 mt-8">
                  {tabs.map(t => (
                    <button key={t.id} onClick={() => setActive(t.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        background: active === t.id ? `hsl(${theme.primary_color} / 0.1)` : "transparent",
                        color: active === t.id ? `hsl(${theme.primary_color})` : adminMuted,
                      }}>
                      {t.label}
                    </button>
                  ))}
                  <div className="border-t my-3" style={{ borderColor: adminBorder }} />
                  <button onClick={() => router.push("/")} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2" style={{ color: adminMuted }}>
                    <ExternalLink size={14} /> Voir le site
                  </button>
                  <button onClick={() => setCmdOpen(true)} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2" style={{ color: adminMuted }}>
                    <Search size={14} /> Rechercher
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="lg:hidden px-2 pt-2 flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: active === t.id ? `hsl(${theme.primary_color} / 0.1)` : adminSecBg,
              color: active === t.id ? `hsl(${theme.primary_color})` : adminMuted,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {active === "overview" && <DashboardOverview />}
        {active === "fleet" && <CarsManager />}
        {active === "bookings" && <BookingsManager />}
        {active === "theme" && <ThemeEngine />}
        {active === "themes" && <ThemesManager />}
        {active === "sections" && <SectionsManager />}
        {active === "settings" && <SiteSettingsManager />}
      </main>

      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Rechercher une action…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {tabs.map(t => (
              <CommandItem key={t.id} onSelect={() => { setActive(t.id); setCmdOpen(false); }}>{t.label}</CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { router.push("/"); setCmdOpen(false); }}>Voir le site</CommandItem>
            <CommandItem onSelect={() => { setAdminDarkMode(!adminDarkMode); setCmdOpen(false); }}>Basculer le mode sombre</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default Admin;
