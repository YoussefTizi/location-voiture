import { useState, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import type { ExtendedThemeConfig, ExtendedSectionConfig, Language } from "@/data/site-config";
import { currencyOptions, initialExtendedTheme, landingPageThemePresets, type LandingPageTheme } from "@/data/site-config";
import { getHeroBackgroundCSS } from "@/components/admin/HeroBackgroundEditor";
import type { Car } from "@/data/mock-database";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Phone, MessageCircle, Menu, X, ChevronRight, Star, MapPin, Shield, CreditCard,
  Truck, Car as CarIcon, Calendar, Clock, Search, CheckCircle2, Fuel, Users,
  Settings2, Instagram, Facebook, Twitter, Linkedin, Mail, PhoneCall, ArrowRight,
  Zap, Headphones, Gem, ChevronDown, Sparkles, Globe, DollarSign, Navigation, ExternalLink,
  Briefcase, Quote, ArrowUpRight, Minus,
  Info,
} from "lucide-react";

/* ─── Icon resolver ─── */
const iconMap: Record<string, any> = {
  Shield, Zap, Headphones, Gem, CreditCard, Truck, Car: CarIcon, Calendar, Clock,
  Search, CheckCircle2, Fuel, Users, Settings2, Instagram, Facebook, Twitter, Linkedin,
  Mail, PhoneCall, MapPin, Star, Phone, MessageCircle, ArrowRight, ChevronRight, Sparkles,
  Globe, DollarSign, Navigation, ExternalLink, Briefcase, Quote, ArrowUpRight, Minus,
};
const DynIcon = ({ name, className, size, style }: { name: string; className?: string; size?: number; style?: React.CSSProperties }) => {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} size={size || 20} style={style} />;
};

/* ─── Theme-aware helpers ─── */
const btnRadius = (s: ExtendedThemeConfig["button_style"]) =>
  s === "pill" ? "9999px" : s === "sharp" ? "0" : "0.5rem";

const getThemeStyles = (theme: ExtendedThemeConfig) => {
  const lp = theme.landing_page_theme;
  const isDark = lp === "sporty" || lp === "neon";
  const heroBg = `hsl(${theme.background_color})`;
  const heroText = `hsl(${theme.text_color})`;
  const heroMuted = `hsl(${theme.text_color} / ${isDark ? "0.76" : "0.64"})`;
  const cardBg = isDark ? `hsl(${theme.secondary_color} / 0.32)` : `hsl(${theme.background_color})`;
  const sectionAlt = isDark ? `hsl(${theme.secondary_color} / 0.24)` : `hsl(${theme.secondary_color} / 0.12)`;
  const footerBg = `hsl(${theme.footer_background_color || theme.secondary_color})`;
  return {
    primaryHSL: `hsl(${theme.primary_color})`,
    accentHSL: `hsl(${theme.accent_color})`,
    secondaryHSL: `hsl(${theme.secondary_color})`,
    isDark,
    heroBg,
    heroText,
    heroMuted,
    cardBg,
    sectionAlt,
    footerBg,
  };
};

const getCurrencyOption = (currencyCode: string) => currencyOptions.find((c) => c.code === currencyCode);

const getCurrencySymbol = (theme: ExtendedThemeConfig, estimation: any) => {
  const cur = getCurrencyOption(theme.selected_currency);
  return cur ? cur.symbol : estimation.currency_symbol;
};

const convertFromMad = (amountMad: number, currencyCode: string) => {
  const option = getCurrencyOption(currencyCode);
  const rate = option?.rate_from_mad ?? 1;
  return amountMad * rate;
};

const formatCurrencyAmount = (amount: number, currencyCode: string) => {
  const decimals = currencyCode === "MAD" ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

type CurrencyFormatRule = { position: "prefix" | "suffix"; token: "symbol" | "code" };
const currencyFormatRules: Partial<Record<string, CurrencyFormatRule>> = {
  USD: { position: "prefix", token: "symbol" },
  EUR: { position: "prefix", token: "symbol" },
  MAD: { position: "suffix", token: "code" },
};

const formatCurrencyDisplay = (amount: number, currencyCode: string, fallbackSymbol = "") => {
  const option = getCurrencyOption(currencyCode);
  const rule = currencyFormatRules[currencyCode] ?? { position: "prefix", token: "symbol" };
  const token = rule.token === "code" ? currencyCode : (option?.symbol || fallbackSymbol || currencyCode);
  const value = formatCurrencyAmount(amount, currencyCode);
  return rule.position === "suffix" ? `${value} ${token}` : `${token}${value}`;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const applyWhatsappTemplate = (template: string, variables: Record<string, string>) => {
  let output = template;
  for (const [key, value] of Object.entries(variables)) {
    const re = new RegExp(`\\{${escapeRegExp(key)}\\}`, "g");
    output = output.replace(re, value);
  }
  return output;
};

const sanitizeWhatsappMessage = (message: string) => {
  return message
    .replace(/\uFFFD/g, "")
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

type BookingFieldKey = "full_name" | "email" | "phone" | "pickup_date" | "return_date";

const getCurrencyFlag = (code: string) => {
  const flags: Record<string, string> = {
    MAD: "🇲🇦",
    EUR: "🇪🇺",
    USD: "🇺🇸",
    GBP: "🇬🇧",
  };
  return flags[code] || "🏳️";
};

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };
type ButtonPalette = { background: string; text: string };
type ThemeColorSystem = {
  text: string;
  muted: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  inputBg: string;
  inputText: string;
  inputBorder: string;
  placeholder: string;
  primaryButton: ButtonPalette;
};

const clamp255 = (value: number) => Math.max(0, Math.min(255, value));

const parseHexColor = (input: string): Rgb | null => {
  const hex = input.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) return null;
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const parseRgbColor = (input: string): Rgb | null => {
  const m = input.trim().match(/^rgba?\(([^)]+)\)$/i);
  if (!m) return null;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const toChannel = (v: string) => {
    if (v.endsWith("%")) {
      const pct = Number(v.replace("%", ""));
      return Number.isFinite(pct) ? clamp255((pct / 100) * 255) : NaN;
    }
    const n = Number(v);
    return Number.isFinite(n) ? clamp255(n) : NaN;
  };
  const r = toChannel(parts[0]);
  const g = toChannel(parts[1]);
  const b = toChannel(parts[2]);
  if (![r, g, b].every(Number.isFinite)) return null;
  return { r, g, b };
};

const parseHslColor = (input: string): Rgb | null => {
  const normalized = input.trim();
  const hslBody = normalized.startsWith("hsl(") ? normalized.slice(4, -1) : normalized;
  const parts = hslBody.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = Number(parts[0]);
  const s = Number(parts[1].replace("%", "")) / 100;
  const l = Number(parts[2].replace("%", "")) / 100;
  if (![h, s, l].every(Number.isFinite)) return null;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hh >= 0 && hh < 1) [r1, g1, b1] = [c, x, 0];
  else if (hh < 2) [r1, g1, b1] = [x, c, 0];
  else if (hh < 3) [r1, g1, b1] = [0, c, x];
  else if (hh < 4) [r1, g1, b1] = [0, x, c];
  else if (hh < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  return {
    r: clamp255(Math.round((r1 + m) * 255)),
    g: clamp255(Math.round((g1 + m) * 255)),
    b: clamp255(Math.round((b1 + m) * 255)),
  };
};

const parseHslParts = (input: string): Hsl | null => {
  const normalized = input.trim();
  const hslBody = normalized.startsWith("hsl(") ? normalized.slice(4, -1) : normalized;
  const parts = hslBody.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = Number(parts[0]);
  const s = Number(parts[1].replace("%", ""));
  const l = Number(parts[2].replace("%", ""));
  if (![h, s, l].every(Number.isFinite)) return null;
  return { h, s, l };
};

const parseColorToRgb = (input: string): Rgb | null => {
  const color = input.trim();
  if (!color) return null;
  if (color.startsWith("#")) return parseHexColor(color);
  if (color.startsWith("rgb")) return parseRgbColor(color);
  if (color.startsWith("hsl")) return parseHslColor(color);
  if (/^\d+(\.\d+)?\s+\d+%?\s+\d+%?$/.test(color)) return parseHslColor(`hsl(${color})`);
  return null;
};

const rgbToCss = ({ r, g, b }: Rgb) => `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;

const mixRgb = (a: Rgb, b: Rgb, ratio: number): Rgb => {
  const t = Math.max(0, Math.min(1, ratio));
  return {
    r: clamp255(a.r * (1 - t) + b.r * t),
    g: clamp255(a.g * (1 - t) + b.g * t),
    b: clamp255(a.b * (1 - t) + b.b * t),
  };
};

const withAlpha = (color: string, alpha: number) => {
  const rgb = parseColorToRgb(color);
  if (!rgb) return color;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})`;
};

const shiftColor = (color: string, amount: number) => {
  const rgb = parseColorToRgb(color);
  if (!rgb) return color;
  const toward = amount >= 0 ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  const mixed = mixRgb(rgb, toward, Math.abs(amount));
  return rgbToCss(mixed);
};

const toLinearChannel = (channel: number) => {
  const v = channel / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (color: string) => {
  const rgb = parseColorToRgb(color);
  if (!rgb) return null;
  const r = toLinearChannel(rgb.r);
  const g = toLinearChannel(rgb.g);
  const b = toLinearChannel(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (fg: string, bg: string) => {
  const fgL = relativeLuminance(fg);
  const bgL = relativeLuminance(bg);
  if (fgL === null || bgL === null) return 1;
  const lighter = Math.max(fgL, bgL);
  const darker = Math.min(fgL, bgL);
  return (lighter + 0.05) / (darker + 0.05);
};

const contrastTextColor = (bgColor: string) =>
  contrastRatio("#ffffff", bgColor) >= contrastRatio("#0f172a", bgColor) ? "#ffffff" : "#0f172a";

const ensureReadableAccent = (accentColor: string, bgColor: string, minRatio = 4.5) =>
  contrastRatio(accentColor, bgColor) >= minRatio ? accentColor : contrastTextColor(bgColor);

const isDarkSurface = (color: string) => contrastTextColor(color) === "#ffffff";

const isDarkButtonBackground = (bgColor: string) => {
  const hsl = parseHslParts(bgColor);
  if (hsl) return hsl.l <= 60;
  const lum = relativeLuminance(bgColor);
  if (lum !== null) return lum <= 0.45;
  return isDarkSurface(bgColor);
};

const buttonTextColor = (bgColor: string) => {
  const preferred = isDarkButtonBackground(bgColor) ? "#ffffff" : "#0f172a";
  if (contrastRatio(preferred, bgColor) >= 4.5) return preferred;
  const fallback = preferred === "#ffffff" ? "#0f172a" : "#ffffff";
  return fallback;
};

const adaptiveButtonPalette = (bgColor: string, minRatio = 4.5): ButtonPalette => {
  const preferredText = isDarkButtonBackground(bgColor) ? "#ffffff" : "#0f172a";
  if (contrastRatio(preferredText, bgColor) >= minRatio) {
    return { background: bgColor, text: preferredText };
  }
  return { background: bgColor, text: preferredText };
};

const deriveThemeColorSystem = (theme: ExtendedThemeConfig, ts: ReturnType<typeof getThemeStyles>, sectionBg: string): ThemeColorSystem => {
  const pageText = ensureReadableAccent(`hsl(${theme.text_color})`, sectionBg, 4.5);
  const isDark = isDarkSurface(sectionBg);
  const surfaceBase = ts.isDark ? withAlpha(ts.secondaryHSL, 0.28) : `hsl(${theme.background_color})`;
  const surface = contrastRatio(pageText, surfaceBase) >= 4.5 ? surfaceBase : shiftColor(surfaceBase, isDark ? 0.1 : -0.08);
  const surfaceAlt = shiftColor(surface, isDark ? 0.08 : -0.06);
  const muted = withAlpha(pageText, isDark ? 0.78 : 0.62);
  const border = withAlpha(pageText, isDark ? 0.22 : 0.18);
  const borderStrong = withAlpha(pageText, isDark ? 0.32 : 0.28);
  const inputBg = shiftColor(surface, isDark ? 0.08 : -0.04);
  const inputText = contrastTextColor(inputBg);
  const inputBorder = withAlpha(inputText, isDarkSurface(inputBg) ? 0.38 : 0.24);
  const placeholder = withAlpha(inputText, isDarkSurface(inputBg) ? 0.6 : 0.5);
  const primaryButton = adaptiveButtonPalette(ts.primaryHSL);

  return {
    text: pageText,
    muted,
    surface,
    surfaceAlt,
    border,
    borderStrong,
    inputBg,
    inputText,
    inputBorder,
    placeholder,
    primaryButton,
  };
};

/* ═══════════════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════════════ */
const FrontendHeader = ({ theme }: { theme: ExtendedThemeConfig }) => {
  const { siteConfig, navItems, contact, updateTheme } = useAdmin();
  const pathname = usePathname();
  const previewMode = pathname.startsWith("/preview/");
  const { lang, setLang, lt, t, isRTL } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [curOpen, setCurOpen] = useState(false);
  const ts = getThemeStyles(theme);
  const isDark = ts.isDark;
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const menuNav = navItems.filter(n => n.enabled && n.show_in_menu);
  const langLabels: Record<Language, string> = { fr: "Français", en: "English", ar: "العربية" };
  const headerBg = isDark
    ? (scrolled ? "rgba(10,10,20,0.95)" : "rgba(10,10,20,0.8)")
    : (scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.98)");
  const headerTextColor = isDark ? "#fff" : "#334155";
  const dropdownBg = isDark ? ts.cardBg : "#fff";
  const dropdownBorder = isDark ? "rgba(255,255,255,0.1)" : "hsl(220 10% 90%)";

  const renderLogo = () => {
    if (siteConfig.logo_display_mode === "image" && siteConfig.logo_image) {
      return (
        <img
          src={siteConfig.logo_image}
          alt={siteConfig.logo_text}
          className="h-14 sm:h-16 lg:h-20 w-auto max-w-[320px] object-contain"
        />
      );
    }
    return (
      <span className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: theme.heading_font }}>
        <span style={{ color: ts.primaryHSL }}>{siteConfig.logo_text.charAt(0)}</span>
        <span style={{ color: headerTextColor }}>{siteConfig.logo_text.slice(1)}</span>
      </span>
    );
  };

  const curSymbol = getCurrencySymbol(theme, { currency_symbol: "DH" });
  const selectedCurrency = currencyOptions.find((c) => c.code === theme.selected_currency);
  const selectedCurrencyFlag = getCurrencyFlag(selectedCurrency?.code || "");

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{ background: headerBg, backdropFilter: "blur(12px)", boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.06)" : "none", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "hsl(220 10% 93%)"}` }}
        dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20 sm:h-24">
          <div className="flex items-center gap-2">{renderLogo()}</div>
          <nav className="hidden lg:flex items-center gap-1">
            {menuNav.map(item => (
              <a key={item.id} href={item.href} className="px-3 py-1.5 text-sm font-medium transition-colors rounded-md hover:opacity-100" style={{ color: headerTextColor, opacity: 0.8 }}>
                {lt(item.label)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {/* Language dropdown */}
            <div className="relative hidden sm:block">
              <button onClick={() => { setLangOpen(!langOpen); setCurOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-100 border"
                style={{ color: headerTextColor, opacity: 0.8, borderColor: dropdownBorder }}>
                <Globe size={14} />
                <span className="uppercase font-bold">{lang}</span>
                <ChevronDown size={12} />
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-1 rounded-xl shadow-xl border py-1 min-w-[140px] animate-fade-in z-50"
                  style={{ background: dropdownBg, borderColor: dropdownBorder }}>
                  {(["fr", "en", "ar"] as Language[]).map(l => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between"
                      style={{ color: lang === l ? ts.primaryHSL : headerTextColor, fontWeight: lang === l ? 700 : 400 }}>
                      {langLabels[l]}
                      {lang === l && <CheckCircle2 size={14} style={{ color: ts.primaryHSL }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency dropdown */}
            <div className="relative hidden sm:block">
              <button onClick={() => { setCurOpen(!curOpen); setLangOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-100 border"
                style={{ color: headerTextColor, opacity: 0.8, borderColor: dropdownBorder }}>
                <DollarSign size={14} />
                <span>{selectedCurrencyFlag}</span>
                <span className="font-bold">{curSymbol}</span>
                <ChevronDown size={12} />
              </button>
              {curOpen && (
                <div className="absolute top-full right-0 mt-1 rounded-xl shadow-xl border py-1 min-w-[130px] animate-fade-in z-50"
                  style={{ background: dropdownBg, borderColor: dropdownBorder }}>
                  {currencyOptions.map(c => (
                    <button key={c.code} onClick={() => { if (!previewMode) updateTheme({ selected_currency: c.code }); setCurOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between gap-2"
                      style={{ color: theme.selected_currency === c.code ? ts.primaryHSL : headerTextColor, fontWeight: theme.selected_currency === c.code ? 700 : 400 }}>
                      <span className="flex items-center gap-2">
                        <span>{getCurrencyFlag(c.code)}</span>
                        <span>{c.label}</span>
                      </span>
                      {theme.selected_currency === c.code && <CheckCircle2 size={14} style={{ color: ts.primaryHSL }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reservation button */}
            <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-lg btn-animated"
              style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
              <Calendar size={14} /> {t("book_now")}
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2" style={{ color: headerTextColor }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Close dropdowns on outside click */}
      {(langOpen || curOpen) && <div className="fixed inset-0 z-40" onClick={() => { setLangOpen(false); setCurOpen(false); }} />}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} w-80 h-full shadow-2xl animate-slide-in-right`}
            style={{ background: ts.cardBg }}>
            <div className="pt-20 p-6 space-y-1">
              {menuNav.map(item => (
                <a key={item.id} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: isDark ? "#ccc" : "#334155" }}>
                  {lt(item.label)}
                  <ChevronRight size={16} style={{ opacity: 0.4 }} />
                </a>
              ))}
              {/* Mobile language/currency */}
              <div className="pt-4 space-y-2">
                <p className="text-xs uppercase tracking-widest px-4" style={{ color: isDark ? "#555" : "#94a3b8" }}>Langue</p>
                <div className="flex gap-2 px-4">
                  {(["fr", "en", "ar"] as Language[]).map(l => (
                    <button key={l} onClick={() => setLang(l)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                      style={{ background: lang === l ? ts.primaryHSL : "transparent", color: lang === l ? "#fff" : (isDark ? "#888" : "#64748b") }}>
                      {l}
                    </button>
                  ))}
                </div>
                <p className="text-xs uppercase tracking-widest px-4 pt-2" style={{ color: isDark ? "#555" : "#94a3b8" }}>Devise</p>
                <div className="flex gap-2 px-4">
                  {currencyOptions.map(c => (
                    <button key={c.code} onClick={() => { if (!previewMode) updateTheme({ selected_currency: c.code }); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                      style={{ background: theme.selected_currency === c.code ? ts.primaryHSL : "transparent", color: theme.selected_currency === c.code ? "#fff" : (isDark ? "#888" : "#64748b") }}>
                      <span>{getCurrencyFlag(c.code)}</span>
                      {c.symbol}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-6 space-y-3">
                <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl btn-animated"
                  style={{ background: ts.primaryHSL }}>
                  <MessageCircle size={16} /> {t("whatsapp_cta")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   HERO – adapts per landing_page_theme + hero_image_position
   ═══════════════════════════════════════════════════════════════════ */
const HeroSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { siteConfig, contact, estimation, cars } = useAdmin();
  const { lt, t, isRTL } = useLanguage();
  const ts = getThemeStyles(theme);
  const availableCars = cars.filter(c => c.availability_status === "available");
  const lp = theme.landing_page_theme;
  const curCode = theme.selected_currency;
  const isFlat = theme.flat_design;
  const heroLeft = theme.hero_image_position === "left";

  const [selectedCarId, setSelectedCarId] = useState("");
  const [selectedTier, setSelectedTier] = useState(estimation.pricing_tiers[0]?.id || "");
  const car = availableCars.find(c => c.id === selectedCarId);
  const tier = estimation.pricing_tiers.find(t => t.id === selectedTier);
  const days = tier ? Math.ceil((tier.min_days + (tier.max_days || tier.min_days + 10)) / 2) : 5;
  const discount = tier ? tier.discount_percent : 0;
  const basePricePerDayMad = car ? car.price_per_day * (1 - discount / 100) : 0;
  const pricePerDay = convertFromMad(basePricePerDayMad, curCode);
  const total = convertFromMad(basePricePerDayMad * days, curCode);

  const generateWhatsAppLink = () => {
    if (!car || !tier) return `https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`;
    const totalText = formatCurrencyAmount(total, curCode);
    const rawMsg = applyWhatsappTemplate(estimation.whatsapp_message_template, {
      vehicle: car.name,
      duration: String(days),
      days: String(days),
      total: totalText,
      total_estimated: totalText,
      currency: curCode,
      city: estimation.default_city,
      date: "—",
      reference: "",
      full_name: "",
      name: "",
      phone: "",
      email: "",
      pickup_date: "",
      return_date: "",
    });
    const msg = sanitizeWhatsappMessage(rawMsg);
    return `https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}?text=${encodeURIComponent(msg)}`;
  };

  const titleParts = lt(config.title).split("\n");
  const sportyFallbackHeroImage = siteConfig.hero_background_image?.trim() || "";
  const resolvedHeroBackgroundImage = (
    theme.hero_background_enabled &&
    theme.hero_background_type === "image" &&
    theme.hero_background_image
  )
    ? theme.hero_background_image
    : (lp === "sporty" ? sportyFallbackHeroImage : "");
  type HeroLocalized = { fr: string; en: string; ar: string };
  type HeroCta = { enabled?: boolean; label?: HeroLocalized; action?: "whatsapp" | "anchor" | "link"; href?: string };
  type HeroInfo = { icon: string; label: HeroLocalized };
  type HeroThemeOverride = {
    badge_text?: HeroLocalized;
    primary_cta?: HeroCta;
    secondary_cta?: HeroCta;
    info_items?: HeroInfo[];
    show_secondary_cta?: boolean;
    show_info_items?: boolean;
    show_mini_estimator?: boolean;
    show_car_strip?: boolean;
  };
  type HeroConfig = {
    badge_text?: HeroLocalized;
    primary_cta?: HeroCta;
    secondary_cta?: HeroCta;
    info_items?: HeroInfo[];
    show_secondary_cta?: boolean;
    show_info_items?: boolean;
    show_mini_estimator?: boolean;
    show_car_strip?: boolean;
    theme_overrides?: Record<string, HeroThemeOverride>;
  };

  const defaultInfoItems: HeroInfo[] = estimation.badges.map((b) => ({ icon: b.icon, label: b.label as HeroLocalized }));
  const defaultHeroConfig: Required<Omit<HeroConfig, "theme_overrides">> = {
    badge_text: siteConfig.logo_tagline as HeroLocalized,
    primary_cta: { enabled: true, label: { fr: "Réserver sur WhatsApp", en: "Reserve on WhatsApp", ar: "احجز عبر واتساب" }, action: "whatsapp", href: "" },
    secondary_cta: { enabled: true, label: { fr: "Parcourir la flotte", en: "Browse Fleet", ar: "تصفح الأسطول" }, action: "anchor", href: "#cars" },
    info_items: defaultInfoItems,
    show_secondary_cta: true,
    show_info_items: true,
    show_mini_estimator: true,
    show_car_strip: true,
  };

  let parsedHeroConfig: HeroConfig = {};
  if (config.content?.trim()) {
    try {
      parsedHeroConfig = JSON.parse(config.content) as HeroConfig;
    } catch {
      parsedHeroConfig = {};
    }
  }

  const themeOverride = parsedHeroConfig.theme_overrides?.[lp] ?? {};
  const heroConfig: Required<Omit<HeroConfig, "theme_overrides">> = {
    ...defaultHeroConfig,
    ...parsedHeroConfig,
    ...themeOverride,
    primary_cta: { ...defaultHeroConfig.primary_cta, ...parsedHeroConfig.primary_cta, ...themeOverride.primary_cta },
    secondary_cta: { ...defaultHeroConfig.secondary_cta, ...parsedHeroConfig.secondary_cta, ...themeOverride.secondary_cta },
    info_items: themeOverride.info_items ?? parsedHeroConfig.info_items ?? defaultHeroConfig.info_items,
    badge_text: (themeOverride.badge_text ?? parsedHeroConfig.badge_text ?? defaultHeroConfig.badge_text),
  };

  const labelFrom = (v: HeroLocalized | undefined, fallback: string) => (v ? lt(v as any) : fallback);
  const primaryCtaHref = heroConfig.primary_cta.action === "whatsapp" ? generateWhatsAppLink() : (heroConfig.primary_cta.href || "#");
  const secondaryCtaHref = heroConfig.secondary_cta.href || "#cars";
  const badgeText = labelFrom(heroConfig.badge_text, lt(siteConfig.logo_tagline));
  const primaryCtaLabel = labelFrom(heroConfig.primary_cta.label, t("reserve_whatsapp"));
  const secondaryCtaLabel = labelFrom(heroConfig.secondary_cta.label, t("browse_fleet"));

  const flatCardStyle: React.CSSProperties = isFlat ? { boxShadow: "none", border: "2px solid hsl(220 10% 90%)" } : {};

  // ── SUNSET: Editorial asymmetric hero ──
  if (lp === "sunset") {
    return (
      <section id="hero" className="relative min-h-screen flex items-end pb-20 pt-28 sm:pt-20" style={{ background: `linear-gradient(160deg, ${ts.heroBg} 40%, hsl(${theme.accent_color} / 0.15) 100%)`, fontFamily: theme.font_family }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-[2px]" style={{ background: ts.primaryHSL }} />
                <p className="text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: ts.primaryHSL }}>{badgeText}</p>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[0.95] tracking-tight" style={{ fontFamily: theme.heading_font, color: ts.heroText }}>
                {titleParts.map((part, i) => (
                  <span key={i} className="block animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                    {i === 1 ? <span className="italic" style={{ color: ts.primaryHSL }}>{part}</span> : part}
                  </span>
                ))}
              </h1>
              <p className="text-lg max-w-md leading-relaxed" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a href={primaryCtaHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-10 py-4 text-sm font-bold text-white btn-animated"
                  style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
                  <MessageCircle size={18} /> {primaryCtaLabel}
                </a>
                {heroConfig.show_secondary_cta && heroConfig.secondary_cta.enabled && (
                  <a href={secondaryCtaHref} className="flex items-center gap-2 px-8 py-4 text-sm font-bold btn-animated transition-all"
                    style={{ color: ts.heroText, borderRadius: btnRadius(theme.button_style) }}>
                    {secondaryCtaLabel} <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </div>
            <div className="lg:col-span-5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {siteConfig.hero_side_image_mode === "image" && siteConfig.hero_side_image ? (
                <div className="overflow-hidden" style={{ borderRadius: "2rem 2rem 0 2rem", boxShadow: isFlat ? "none" : "0 40px 80px -20px rgba(0,0,0,0.15)" }}>
                  <img src={siteConfig.hero_side_image} alt="Hero" className="w-full h-auto object-cover" style={{ maxHeight: "70vh" }} />
                </div>
              ) : (
                <HeroCarShowcase car={availableCars[0]} theme={theme} isFlat={isFlat} />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── ARCTIC: Ultra-minimal centered hero with floating badge ──
  if (lp === "arctic") {
    return (
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 sm:pt-20" style={{ background: `linear-gradient(180deg, ${ts.heroBg} 0%, hsl(${theme.background_color}) 100%)`, fontFamily: theme.font_family }}>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold" style={{ background: `hsl(${theme.primary_color} / 0.08)`, color: ts.primaryHSL }}>
            <Sparkles size={14} /> {badgeText}
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight" style={{ fontFamily: theme.heading_font, color: ts.heroText }}>
            {titleParts.map((part, i) => (
              <span key={i} className="block animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                {i === 1 ? <span style={{ color: ts.primaryHSL }}>{part}</span> : part}
              </span>
            ))}
          </h1>
          <p className="text-lg max-w-lg mx-auto" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
          <div className="flex gap-3 justify-center">
            <a href={primaryCtaHref} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-10 py-4 text-sm font-bold text-white btn-animated"
              style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
              <MessageCircle size={16} /> {primaryCtaLabel}
            </a>
          </div>
          {/* Horizontal car strip */}
          {heroConfig.show_car_strip && (
            <div className="flex gap-4 justify-center flex-wrap pt-8">
            {availableCars.slice(0, 4).map((c, i) => (
              <div key={c.id} className="w-40 rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.1 + 0.4}s`, borderColor: "hsl(210 40% 92%)", background: ts.cardBg, boxShadow: isFlat ? "none" : "0 8px 30px -10px rgba(0,0,0,0.08)" }}>
                <div className="h-24 overflow-hidden" style={{ background: shiftColor(ts.heroBg, -0.03) }}>
                  {c.images[0] ? <img src={c.images[0]} alt={c.name} className="w-full h-full object-cover" /> : <CarIcon size={32} className="text-slate-200 m-auto mt-6" />}
                </div>
                <div className="p-2.5 text-center">
                  <p className="text-[11px] font-bold" style={{ color: ts.heroText }}>{c.name}</p>
                  <p className="text-xs font-semibold" style={{ color: ts.primaryHSL }}>{formatCurrencyDisplay(convertFromMad(c.price_per_day, curCode), curCode)}{t("per_day")}</p>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── DESERT: Warm layered hero with offset image ──
  if (lp === "desert") {
    return (
      <section id="hero" className="relative min-h-screen flex items-center pt-28 sm:pt-20" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="absolute inset-0 z-0" style={{ background: `radial-gradient(ellipse at 70% 50%, hsl(${theme.accent_color} / 0.12) 0%, transparent 70%)` }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <p className="text-sm font-semibold tracking-wider uppercase" style={{ color: ts.primaryHSL }}>{badgeText}</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08]" style={{ fontFamily: theme.heading_font, color: ts.heroText }}>
                {titleParts.map((part, i) => (
                  <span key={i} className="block" style={{ animationDelay: `${i * 0.1}s` }}>
                    {i === 1 ? <span style={{ color: ts.primaryHSL }}>{part}</span> : part}
                  </span>
                ))}
              </h1>
              <p className="text-base max-w-md leading-relaxed" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
              {/* Stacked badges */}
              {heroConfig.show_info_items && (
                <div className="space-y-2">
                {heroConfig.info_items.map((badge, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-fade-in" style={{ animationDelay: `${i * 0.1 + 0.3}s`, background: `hsl(${theme.primary_color} / 0.06)` }}>
                    <DynIcon name={badge.icon} size={18} className="shrink-0" style={{ color: ts.primaryHSL } as any} />
                    <span className="text-sm font-medium" style={{ color: ts.heroText }}>{lt(badge.label)}</span>
                  </div>
                ))}
              </div>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <a href={primaryCtaHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white btn-animated"
                  style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
                  <MessageCircle size={16} /> {primaryCtaLabel}
                </a>
                {heroConfig.show_secondary_cta && heroConfig.secondary_cta.enabled && (
                  <a href={secondaryCtaHref} className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold border-2 transition-all hover:scale-105 btn-animated"
                    style={{ borderColor: ts.primaryHSL, color: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
                    {secondaryCtaLabel}
                  </a>
                )}
              </div>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="absolute -top-6 -left-6 w-full h-full rounded-3xl" style={{ background: `hsl(${theme.primary_color} / 0.08)` }} />
              {siteConfig.hero_side_image_mode === "image" && siteConfig.hero_side_image ? (
                <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: isFlat ? "none" : "0 30px 60px -15px rgba(0,0,0,0.15)" }}>
                  <img src={siteConfig.hero_side_image} alt="Hero" className="w-full h-auto object-cover" style={{ maxHeight: "65vh" }} />
                </div>
              ) : (
                <div className="relative"><HeroCarShowcase car={availableCars[0]} theme={theme} isFlat={isFlat} /></div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Dark fullscreen themes (sporty, neon)
  if (ts.isDark) {
    return (
      <section id="hero" className="relative min-h-screen flex items-center pt-28 sm:pt-20" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="absolute inset-0 z-0">
          {resolvedHeroBackgroundImage && (
            <img src={resolvedHeroBackgroundImage} alt="" className="w-full h-full object-cover opacity-30" />
          )}
          {theme.hero_background_enabled && theme.hero_background_type === "pattern" && (
            <div className="absolute inset-0" style={getHeroBackgroundCSS(theme)} />
          )}
          <div className="absolute inset-0" style={{ background: lp === "neon" ? `linear-gradient(135deg, rgba(10,10,20,0.85), transparent 60%), linear-gradient(to top, rgba(10,10,20,0.95), transparent 40%)` : `linear-gradient(135deg, rgba(0,0,0,0.8), transparent 60%), linear-gradient(to top, rgba(0,0,0,0.9), transparent 40%)` }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ts.primaryHSL }}>{badgeText}</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white" style={{ fontFamily: theme.heading_font }}>
              {titleParts.map((part, i) => (
                <span key={i} className="block animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                  {i === 1 ? <span style={{ color: ts.primaryHSL }}>{part}</span> : part}
                </span>
              ))}
            </h1>
            <p className="text-lg text-white/60 max-w-md">{lt(config.subtitle)}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={primaryCtaHref} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 text-sm font-bold text-white rounded-lg btn-animated"
                style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
                <MessageCircle size={18} /> {primaryCtaLabel}
              </a>
              {heroConfig.show_secondary_cta && heroConfig.secondary_cta.enabled && (
                <a href={secondaryCtaHref} className="flex items-center gap-2 px-8 py-4 text-sm font-bold text-white border border-white/20 rounded-lg transition-all hover:bg-white/10 btn-animated"
                  style={{ borderRadius: btnRadius(theme.button_style) }}>
                  {secondaryCtaLabel} <ArrowRight size={16} />
                </a>
              )}
            </div>
            {heroConfig.show_info_items && (
              <div className="flex flex-wrap gap-4 pt-4">
              {heroConfig.info_items.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                  <DynIcon name={badge.icon} size={14} className="text-white/40" />
                  <span>{lt(badge.label)}</span>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Classic theme
  if (lp === "classic") {
    return (
      <section id="hero" className="relative min-h-[90vh] flex items-center pt-28 sm:pt-20" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
            {heroLeft && (
              <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                {siteConfig.hero_side_image_mode === "image" && siteConfig.hero_side_image ? (
                  <div className="rounded-3xl overflow-hidden border flex items-center justify-center" style={{ borderColor: "hsl(220 10% 90%)", boxShadow: isFlat ? "none" : "0 25px 60px -12px rgba(0,0,0,0.1)" }}>
                    <img src={siteConfig.hero_side_image} alt="Hero" className="w-full h-auto object-contain max-h-[60vh] lg:max-h-[70vh]" />
                  </div>
                ) : (
                  <HeroCarShowcase car={availableCars[0]} theme={theme} isFlat={isFlat} />
                )}
              </div>
            )}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: `hsl(${theme.accent_color} / 0.15)`, color: `hsl(${theme.accent_color})` }}>
                <Sparkles size={14} /> {badgeText}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1]" style={{ fontFamily: theme.heading_font, color: "#1a1a3e" }}>
                {titleParts.map((part, i) => (
                  <span key={i} className="block" style={{ animationDelay: `${i * 0.1}s` }}>
                    {i === 1 ? <span style={{ color: ts.primaryHSL }}>{part}</span> : part}
                  </span>
                ))}
              </h1>
              <p className="text-base leading-relaxed max-w-md" style={{ color: "#5c5c7a" }}>{lt(config.subtitle)}</p>
              <div className="flex flex-wrap gap-3">
                <a href={primaryCtaHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-lg btn-animated"
                  style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style), boxShadow: isFlat ? "none" : undefined }}>
                  <MessageCircle size={16} /> {primaryCtaLabel}
                </a>
                {heroConfig.show_secondary_cta && heroConfig.secondary_cta.enabled && (
                  <a href={secondaryCtaHref} className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold border-2 rounded-lg transition-all hover:scale-105"
                    style={{ borderColor: ts.primaryHSL, color: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
                    {secondaryCtaLabel}
                  </a>
                )}
              </div>
            </div>
            {!heroLeft && (
              <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                {siteConfig.hero_side_image_mode === "image" && siteConfig.hero_side_image ? (
                  <div className="rounded-3xl overflow-hidden border flex items-center justify-center" style={{ borderColor: "hsl(220 10% 90%)", boxShadow: isFlat ? "none" : "0 25px 60px -12px rgba(0,0,0,0.1)" }}>
                    <img src={siteConfig.hero_side_image} alt="Hero" className="w-full h-auto object-contain max-h-[60vh] lg:max-h-[70vh]" />
                  </div>
                ) : (
                  <HeroCarShowcase car={availableCars[0]} theme={theme} isFlat={isFlat} />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Eco theme: centered
  if (lp === "eco") {
    const ecoBgTop = shiftColor(`hsl(${theme.background_color})`, -0.01);
    const ecoBgBottom = shiftColor(`hsl(${theme.background_color})`, -0.06);
    return (
      <section id="hero" className="relative min-h-[90vh] flex items-center pt-28 sm:pt-20" style={{ background: `linear-gradient(180deg, ${ecoBgTop} 0%, ${ecoBgBottom} 100%)`, fontFamily: theme.font_family }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold mx-auto" style={{ background: `hsl(${theme.primary_color} / 0.12)`, color: ts.primaryHSL }}>
              <CheckCircle2 size={14} /> {badgeText}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1]" style={{ fontFamily: theme.heading_font, color: ts.heroText }}>
              {titleParts.map((part, i) => (
                <span key={i} className="block" style={{ animationDelay: `${i * 0.1}s` }}>
                  {i === 1 ? <span style={{ color: ts.primaryHSL }}>{part}</span> : part}
                </span>
              ))}
            </h1>
            <p className="text-lg max-w-lg mx-auto" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href={primaryCtaHref} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-10 py-4 text-sm font-bold text-white rounded-full btn-animated"
                style={{ background: ts.primaryHSL, boxShadow: isFlat ? "none" : undefined }}>
                <MessageCircle size={16} /> {primaryCtaLabel}
              </a>
              {heroConfig.show_secondary_cta && heroConfig.secondary_cta.enabled && (
                <a href={secondaryCtaHref} className="flex items-center gap-2 px-8 py-4 text-sm font-bold border-2 transition-all hover:scale-105"
                  style={{ borderColor: ts.primaryHSL, color: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
                  {secondaryCtaLabel}
                </a>
              )}
            </div>
            <div className="flex gap-4 justify-center flex-wrap pt-4">
              {availableCars.slice(0, 3).map((c, i) => (
                <div key={c.id} className="bg-white/80 backdrop-blur rounded-2xl p-3 flex items-center gap-3 border border-white animate-fade-in"
                  style={{ animationDelay: `${i * 0.1 + 0.3}s`, boxShadow: isFlat ? "none" : "0 4px 15px rgba(0,0,0,0.06)" }}>
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100">
                    {c.images[0] ? <img src={c.images[0]} alt={c.name} className="w-full h-full object-cover" /> : <CarIcon size={20} className="text-slate-300 m-auto mt-3" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#1a3a2a" }}>{c.name}</p>
                    <p className="text-xs font-semibold" style={{ color: ts.primaryHSL }}>{formatCurrencyDisplay(convertFromMad(c.price_per_day, curCode), curCode)}{t("per_day")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default elegant theme with configurable image position
  const textColumn = (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: ts.primaryHSL }}>{badgeText}</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight" style={{ fontFamily: theme.heading_font, color: ts.heroText }}>
          {titleParts.map((part, i) => (
            <span key={i} className="block animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              {i === 1 ? <span style={{ color: ts.primaryHSL }}>{part}</span> : part}
            </span>
          ))}
        </h1>
        <p className="text-base text-slate-500 mt-4 max-w-md leading-relaxed whitespace-pre-line">{lt(config.subtitle)}</p>
      </div>
      {/* Mini estimation */}
      {heroConfig.show_mini_estimator && (() => {
        const miniFormBg = ts.cardBg;
        const miniInputBg = isDarkSurface(miniFormBg) ? "rgba(15,23,42,0.92)" : "#f8fafc";
        const miniInputText = isDarkSurface(miniInputBg) ? "rgba(248,250,252,0.95)" : "#0f172a";
        const miniInputBorder = isDarkSurface(miniInputBg) ? "rgba(148,163,184,0.35)" : "hsl(220 10% 82%)";
        const miniMuted = isDarkSurface(miniFormBg) ? "rgba(203,213,225,0.85)" : "#64748b";
        const miniCtaText = buttonTextColor(ts.primaryHSL);
        return (
      <div className="rounded-2xl border p-5 space-y-4 max-w-md animate-fade-in"
        style={{ animationDelay: "0.3s", background: miniFormBg, borderColor: "hsl(220 10% 93%)", boxShadow: isFlat ? "none" : "0 20px 40px -15px rgba(0,0,0,0.08)" }}>
        <>
        {estimation.show_vehicle_field && (
          <div>
            <Label className="text-xs font-medium mb-1.5 block" style={{ color: miniMuted }}>{t("select_vehicle")}</Label>
            <Select value={selectedCarId} onValueChange={setSelectedCarId}>
              <SelectTrigger className="text-sm h-11" style={{ background: miniInputBg, borderColor: miniInputBorder, color: miniInputText }}>
                <SelectValue placeholder={t("select_vehicle")} />
              </SelectTrigger>
              <SelectContent>{availableCars.map(c => <SelectItem key={c.id} value={c.id}>{c.name} · {t(c.transmission)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        {estimation.show_duration_field && (
          <div>
            <Label className="text-xs font-medium mb-1.5 block" style={{ color: miniMuted }}>{t("rental_duration")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {estimation.pricing_tiers.map(pt => (
                <button key={pt.id} onClick={() => setSelectedTier(pt.id)}
                  className="py-2.5 rounded-lg text-xs font-semibold transition-all border btn-animated"
                  style={{ background: selectedTier === pt.id ? ts.primaryHSL : miniInputBg, color: selectedTier === pt.id ? miniCtaText : miniMuted, borderColor: selectedTier === pt.id ? ts.primaryHSL : miniInputBorder }}>
                  {lt(pt.label)}
                </button>
              ))}
            </div>
          </div>
        )}
        {car && (
          <div className="rounded-xl p-4 text-center" style={{ background: `hsl(${theme.primary_color} / 0.06)` }}>
            <p className="text-xs" style={{ color: miniMuted }}>{t("price_per_day")}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: ts.primaryHSL, fontFamily: theme.heading_font }}>{formatCurrencyDisplay(pricePerDay, curCode)} <span className="text-sm font-normal" style={{ color: miniMuted }}>{t("per_day")}</span></p>
          </div>
        )}
        <a href={primaryCtaHref} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold rounded-xl btn-animated"
          style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style), color: miniCtaText }}>
          <MessageCircle size={16} style={{ color: miniCtaText }} /> {primaryCtaLabel}
        </a>
        {heroConfig.show_info_items && (
          <div className="flex flex-wrap gap-3 justify-center pt-1">
          {heroConfig.info_items.map((badge, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: miniMuted }}>
              <DynIcon name={badge.icon} size={13} style={{ color: miniMuted }} /><span>{lt(badge.label)}</span>
            </div>
          ))}
        </div>
        )}
        </>
      </div>
        );
      })()}
    </div>
  );

  const imageColumn = (
    <div className="relative animate-fade-in" style={{ animationDelay: "0.4s" }}>
      {siteConfig.hero_side_image_mode === "image" && siteConfig.hero_side_image ? (
        <div className="rounded-3xl overflow-hidden border flex items-center justify-center" style={{
          borderColor: "hsl(220 10% 93%)",
          boxShadow: isFlat ? "none" : "0 25px 60px -12px rgba(0,0,0,0.1)",
        }}>
          <img src={siteConfig.hero_side_image} alt="Hero" className="w-full h-auto object-contain max-h-[60vh] lg:max-h-[70vh]" />
        </div>
      ) : (
        <HeroCarShowcase car={availableCars[0]} theme={theme} isFlat={isFlat} />
      )}
    </div>
  );

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center pt-28 sm:pt-20" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
      {theme.hero_background_enabled && theme.hero_background_type === "pattern" && (
        <div className="absolute inset-0 z-0" style={getHeroBackgroundCSS(theme)} />
      )}
      {theme.hero_background_enabled && theme.hero_background_type === "image" && theme.hero_background_image && (
        <div className="absolute inset-0 z-0"><img src={theme.hero_background_image} alt="" className="w-full h-full object-cover opacity-20" /></div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {heroLeft ? <>{imageColumn}{textColumn}</> : <>{textColumn}{imageColumn}</>}
        </div>
      </div>
    </section>
  );
};

/* ─── Hero Car Showcase (reusable) ─── */
const HeroCarShowcase = ({ car, theme, isFlat }: { car?: Car; theme: ExtendedThemeConfig; isFlat: boolean }) => {
  const { t } = useLanguage();
  const ts = getThemeStyles(theme);
  const curCode = theme.selected_currency;

  if (!car) return null;

  return (
    <div className="rounded-3xl p-8 border" style={{
      background: ts.cardBg,
      borderColor: "hsl(220 10% 93%)",
      boxShadow: isFlat ? "none" : "0 25px 60px -12px rgba(0,0,0,0.1)",
    }}>
      <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4" style={{ background: `linear-gradient(135deg, hsl(${theme.primary_color} / 0.08), #f1f5f9)` }}>
        {car.images[0] ? <img src={car.images[0]} alt={car.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><CarIcon size={80} className="text-slate-200" /></div>}
      </div>
      <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: theme.heading_font }}>{car.name}</h3>
      <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
        <span className="flex items-center gap-1"><Settings2 size={13} /> {t(car.transmission)}</span>
        <span className="flex items-center gap-1"><Fuel size={13} /> {t(car.fuel_type)}</span>
        <span className="flex items-center gap-1"><Users size={13} /> {car.seats}</span>
      </div>
      <p className="text-2xl font-bold mt-3" style={{ color: ts.primaryHSL, fontFamily: theme.heading_font }}>
        {formatCurrencyDisplay(convertFromMad(car.price_per_day, curCode), curCode)}<span className="text-sm font-normal text-slate-400"> {t("per_day")}</span>
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   FEATURES — unique composition per theme
   ═══════════════════════════════════════════════════════════════════ */
const FeaturesSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { features } = useAdmin();
  const { lt } = useLanguage();
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;
  const isFlat = theme.flat_design;

  const sectionBg = ts.isDark ? ts.sectionAlt : shiftColor(`hsl(${theme.background_color})`, lp === "eco" ? -0.04 : lp === "classic" ? -0.03 : -0.015);
  const textColor = ts.isDark ? "#fff" : ts.heroText;
  const mutedColor = ts.heroMuted;

  // ── SPORTY: Full-width horizontal banner with numbers ──
  if (lp === "sporty") {
    return (
      <section className="py-0 overflow-hidden" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="border-y border-white/5">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={f.id} className="relative p-8 lg:p-10 border-r border-white/5 last:border-r-0 animate-fade-in group hover:bg-white/[0.02] transition-colors"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-6xl font-black absolute top-4 right-4 leading-none" style={{ color: "rgba(255,255,255,0.03)", fontFamily: theme.heading_font }}>0{i + 1}</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: `hsl(${theme.primary_color} / 0.15)`, color: ts.primaryHSL }}>
                  <DynIcon name={f.icon} size={20} className="text-current" />
                </div>
                <h3 className="font-bold text-sm text-white mb-2" style={{ fontFamily: theme.heading_font }}>{lt(f.title)}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{lt(f.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── NEON: Bento grid with glow effects ──
  if (lp === "neon") {
    return (
      <section className="py-16 px-5" style={{ background: ts.sectionAlt, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={f.id} className={`rounded-2xl p-6 border transition-all animate-fade-in group ${i === 0 ? "sm:col-span-2" : ""}`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  background: ts.cardBg,
                  borderColor: "rgba(255,255,255,0.06)",
                  boxShadow: `0 0 0 0px hsl(${theme.primary_color} / 0)`,
                }}>
                <div className={`flex ${i === 0 ? "flex-row items-center gap-6" : "flex-col"}`}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-4"
                    style={{ background: `hsl(${theme.primary_color} / 0.12)`, color: ts.primaryHSL, boxShadow: `0 0 30px hsl(${theme.primary_color} / 0.15)` }}>
                    <DynIcon name={f.icon} size={24} className="text-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white mb-2" style={{ fontFamily: theme.heading_font }}>{lt(f.title)}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: ts.heroMuted }}>{lt(f.description)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ECO: Circle icons, centered zen layout ──
  if (lp === "eco") {
    return (
      <section className="py-20 px-5" style={{ background: sectionBg, fontFamily: theme.font_family }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          <p className="mb-12" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((f, i) => (
              <div key={f.id} className="flex flex-col items-center text-center space-y-3 animate-fade-in" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: `hsl(${theme.primary_color} / 0.1)`, color: ts.primaryHSL }}>
                  <DynIcon name={f.icon} size={28} className="text-current" />
                </div>
                <h3 className="font-bold text-sm" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(f.title)}</h3>
                <p className="text-xs leading-relaxed" style={{ color: mutedColor }}>{lt(f.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── CLASSIC: Two-column with decorative line ──
  if (lp === "classic") {
    return (
      <section className="py-20 px-5" style={{ background: sectionBg, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-24 animate-fade-in">
              <div className="w-10 h-1 mb-4" style={{ background: ts.primaryHSL }} />
              <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
            </div>
            <div className="lg:col-span-8 space-y-6">
              {features.map((f, i) => (
                <div key={f.id} className="flex items-start gap-5 p-5 rounded-2xl border transition-all hover:-translate-y-0.5 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s`, background: ts.cardBg, borderColor: "hsl(220 10% 92%)", boxShadow: isFlat ? "none" : "0 4px 15px -5px rgba(0,0,0,0.05)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `hsl(${theme.primary_color} / 0.1)`, color: ts.primaryHSL }}>
                    <DynIcon name={f.icon} size={22} className="text-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(f.title)}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: mutedColor }}>{lt(f.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── SUNSET: Large editorial cards with accent bar ──
  if (lp === "sunset") {
    return (
      <section className="py-20 px-5" style={{ background: sectionBg, fontFamily: theme.font_family }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10 animate-fade-in">
            <div className="w-12 h-[2px]" style={{ background: ts.primaryHSL }} />
            <h2 className="text-2xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={f.id} className="relative overflow-hidden rounded-2xl p-8 border transition-all hover:-translate-y-1 animate-fade-in group"
                style={{ animationDelay: `${i * 0.1}s`, background: ts.cardBg, borderColor: "hsl(20 20% 92%)", boxShadow: isFlat ? "none" : "0 8px 30px -10px rgba(0,0,0,0.06)" }}>
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: ts.primaryHSL }} />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `hsl(${theme.primary_color} / 0.1)`, color: ts.primaryHSL }}>
                    <DynIcon name={f.icon} size={22} className="text-current" />
                  </div>
                  <h3 className="font-bold text-base" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(f.title)}</h3>
                </div>
                <p className="text-sm leading-relaxed pl-16" style={{ color: mutedColor }}>{lt(f.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ARCTIC: Minimal horizontal list ──
  if (lp === "arctic") {
    return (
      <section className="py-16 px-5 border-b" style={{ background: sectionBg, fontFamily: theme.font_family, borderColor: "hsl(210 40% 94%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-0 divide-y lg:divide-y-0 lg:divide-x" style={{ borderColor: "hsl(210 40% 94%)" }}>
            {features.map((f, i) => (
              <div key={f.id} className="flex-1 py-6 lg:py-0 lg:px-8 first:lg:pl-0 last:lg:pr-0 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <DynIcon name={f.icon} size={24} className="mb-4" style={{ color: ts.primaryHSL } as any} />
                <h3 className="font-bold text-sm mb-1.5" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(f.title)}</h3>
                <p className="text-xs leading-relaxed" style={{ color: mutedColor }}>{lt(f.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── DESERT: Stacked cards with warm background ──
  if (lp === "desert") {
    return (
      <section className="py-20 px-5" style={{ background: sectionBg, fontFamily: theme.font_family }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
          </div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={f.id} className="flex items-center gap-6 p-6 rounded-2xl border transition-all hover:-translate-x-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s`, background: ts.cardBg, borderColor: "hsl(30 20% 90%)", boxShadow: isFlat ? "none" : "0 4px 15px -5px rgba(0,0,0,0.05)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `hsl(${theme.primary_color} / 0.1)`, color: ts.primaryHSL }}>
                  <DynIcon name={f.icon} size={24} className="text-current" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(f.title)}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: mutedColor }}>{lt(f.description)}</p>
                </div>
                <ArrowRight size={16} style={{ color: mutedColor, opacity: 0.4 }} className="shrink-0 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ELEGANT (default): 4-column icon grid ──
  return (
    <section className="py-14 px-5" style={{ background: sectionBg, fontFamily: theme.font_family, borderTop: `1px solid ${ts.isDark ? "rgba(255,255,255,0.05)" : "hsl(220 10% 95%)"}` }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={f.id} className="flex items-start gap-4 p-4 rounded-2xl transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `hsl(${theme.primary_color} / 0.08)`, color: ts.primaryHSL }}>
                <DynIcon name={f.icon} size={22} className="text-current" />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(f.title)}</h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: mutedColor }}>{lt(f.description)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CARS GRID (keeping existing logic but condensed)
   ═══════════════════════════════════════════════════════════════════ */
const CarsSection = ({ config, theme, cars }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig; cars: Car[] }) => {
  const [bookingCar, setBookingCar] = useState<Car | null>(null);
  const [bookingDraft, setBookingDraft] = useState({
    full_name: "",
    email: "",
    phone: "",
    pickup_date: "",
    return_date: "",
  });
  const [bookingErrors, setBookingErrors] = useState<Partial<Record<"full_name" | "email" | "phone" | "pickup_date" | "return_date", string>>>({});
  const [bookingConfirmed, setBookingConfirmed] = useState<null | {
    bookingId: string;
    carName: string;
    fullName: string;
    email: string;
    phone: string;
    pickupDate: string;
    returnDate: string;
    estimatedDays: number | null;
    estimatedTotal: string | null;
  }>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSubmitError, setBookingSubmitError] = useState("");
  const [bookingViewportHeight, setBookingViewportHeight] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const bookingInputRefs = useRef<Partial<Record<BookingFieldKey, HTMLInputElement | null>>>({});
  const { lt, t } = useLanguage();
  const { estimation, contact, bookingForm, createBooking } = useAdmin();
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;
  const isFlat = theme.flat_design;
  const curCode = theme.selected_currency;
  const variant = theme.card_style_variant;
  const defaultCardsPerRow = variant === "compact" || variant === "detailed" ? 3 : 4;
  const carsSectionConfig = (() => {
    if (!config.content?.trim()) return { cards_per_row: defaultCardsPerRow as 2 | 3 | 4 | 5 };
    try {
      const parsed = JSON.parse(config.content);
      const value = Number(parsed?.cards_per_row);
      if (value === 2 || value === 3 || value === 4 || value === 5) {
        return { cards_per_row: value as 2 | 3 | 4 | 5 };
      }
    } catch {
      // ignore invalid content
    }
    return { cards_per_row: defaultCardsPerRow as 2 | 3 | 4 | 5 };
  })();
  const desktopColsClassByCount: Record<2 | 3 | 4 | 5, string> = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  };
  const available = cars.filter(c => c.availability_status === "available");
  const categories = useMemo(() => ["all", ...new Set(available.map(c => c.category))], [available]);
  const filtered = activeCategory === "all" ? available : available.filter(c => c.category === activeCategory);

  const baseBackground = `hsl(${theme.background_color})`;
  const bgColor = ts.isDark
    ? ts.heroBg
    : shiftColor(baseBackground, lp === "eco" ? -0.05 : lp === "classic" ? -0.03 : 0);
  const colors = deriveThemeColorSystem(theme, ts, bgColor);
  const textColor = colors.text;
  const mutedColor = colors.muted;
  const cardBorderColor = colors.borderStrong;
  const primaryButton = colors.primaryButton;
  const cardCtaText = primaryButton.text;
  const priceBadgeText = contrastTextColor(primaryButton.background);
  const modalBg = colors.surface;
  const modalInputBg = colors.inputBg;
  const modalInputText = colors.inputText;
  const modalInputPlaceholder = colors.placeholder;
  const modalInputBorder = colors.inputBorder;
  const modalLabelColor = colors.muted;
  const modalButtonText = primaryButton.text;
  const modalInputStyle = {
    background: modalInputBg,
    borderColor: modalInputBorder,
    color: modalInputText,
    ["--ds-input-placeholder-color" as any]: modalInputPlaceholder,
  } as React.CSSProperties;
  const bookingFieldOrder = useMemo<BookingFieldKey[]>(() => {
    const fields: BookingFieldKey[] = [];
    if (bookingForm.show_name) fields.push("full_name");
    if (bookingForm.show_email) fields.push("email");
    if (bookingForm.show_phone) fields.push("phone");
    if (bookingForm.show_pickup_date) fields.push("pickup_date");
    if (bookingForm.show_return_date) fields.push("return_date");
    return fields;
  }, [
    bookingForm.show_name,
    bookingForm.show_email,
    bookingForm.show_phone,
    bookingForm.show_pickup_date,
    bookingForm.show_return_date,
  ]);

  useEffect(() => {
    if (!bookingCar || typeof window === "undefined") {
      setBookingViewportHeight(null);
      return;
    }
    const updateViewportHeight = () => {
      const viewportHeight = Math.round(window.visualViewport?.height ?? window.innerHeight);
      setBookingViewportHeight(viewportHeight);
    };
    updateViewportHeight();
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, [bookingCar]);

  const setBookingInputRef = (field: BookingFieldKey) => (node: HTMLInputElement | null) => {
    bookingInputRefs.current[field] = node;
  };

  const scrollBookingFieldIntoView = (field: BookingFieldKey) => {
    const node = bookingInputRefs.current[field];
    if (!node) return;
    const scrollToField = () => {
      node.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    };
    window.requestAnimationFrame(scrollToField);
    window.setTimeout(scrollToField, 180);
  };

  const handleBookingFieldFocus = (field: BookingFieldKey) => () => {
    if (typeof window === "undefined") return;
    scrollBookingFieldIntoView(field);
  };

  const focusNextBookingField = (field: BookingFieldKey) => {
    const index = bookingFieldOrder.indexOf(field);
    if (index < 0) return false;
    const nextField = bookingFieldOrder[index + 1];
    if (!nextField) return false;
    const nextInput = bookingInputRefs.current[nextField];
    if (!nextInput) return false;
    nextInput.focus();
    scrollBookingFieldIntoView(nextField);
    return true;
  };

  const handleBookingFieldKeyDown = (field: BookingFieldKey) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    const moved = focusNextBookingField(field);
    if (moved) {
      e.preventDefault();
      return;
    }
    if (field === "return_date") return;
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  };

  const resetBookingModalState = () => {
    setBookingDraft({
      full_name: "",
      email: "",
      phone: "",
      pickup_date: "",
      return_date: "",
    });
    setBookingErrors({});
    setBookingConfirmed(null);
    setBookingSubmitting(false);
    setBookingSubmitError("");
  };

  const openBookingModal = (car: Car) => {
    setBookingCar(car);
    resetBookingModalState();
  };

  const validateBookingDraft = () => {
    const errors: Partial<Record<"full_name" | "email" | "phone" | "pickup_date" | "return_date", string>> = {};
    const requiredMsg = t("field_required");
    if (bookingForm.show_name && !bookingDraft.full_name.trim()) errors.full_name = requiredMsg;
    if (bookingForm.show_email) {
      if (!bookingDraft.email.trim()) errors.email = requiredMsg;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingDraft.email.trim())) errors.email = t("invalid_email");
    }
    if (bookingForm.show_phone && !bookingDraft.phone.trim()) errors.phone = requiredMsg;
    if (bookingForm.show_pickup_date && !bookingDraft.pickup_date) errors.pickup_date = requiredMsg;
    if (bookingForm.show_return_date && !bookingDraft.return_date) errors.return_date = requiredMsg;
    if (bookingForm.show_pickup_date && bookingForm.show_return_date && bookingDraft.pickup_date && bookingDraft.return_date) {
      if (new Date(bookingDraft.return_date).getTime() < new Date(bookingDraft.pickup_date).getTime()) {
        errors.return_date = t("return_after_pickup");
      }
    }
    return errors;
  };

  const buildBookingWhatsappLink = () => {
    if (!bookingConfirmed) return `https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`;
    const fallbackLines = [
      t("reservation_whatsapp_intro"),
      `${t("reservation_reference")}: ${bookingConfirmed.bookingId}`,
      `${t("select_vehicle")}: ${bookingConfirmed.carName}`,
    ];
    if (bookingConfirmed.fullName) fallbackLines.push(`${t("full_name")}: ${bookingConfirmed.fullName}`);
    if (bookingConfirmed.phone) fallbackLines.push(`${t("phone")}: ${bookingConfirmed.phone}`);
    if (bookingConfirmed.email) fallbackLines.push(`${t("email")}: ${bookingConfirmed.email}`);
    if (bookingConfirmed.pickupDate) fallbackLines.push(`${t("pickup_date")}: ${bookingConfirmed.pickupDate}`);
    if (bookingConfirmed.returnDate) fallbackLines.push(`${t("return_date")}: ${bookingConfirmed.returnDate}`);
    if (bookingConfirmed.estimatedDays && bookingConfirmed.estimatedTotal) {
      fallbackLines.push(`${t("days")}: ${bookingConfirmed.estimatedDays}`);
      fallbackLines.push(`${t("total_estimated")}: ${bookingConfirmed.estimatedTotal}`);
    }
    const fallbackMessage = fallbackLines.join("\n");
    const template = (estimation.whatsapp_message_template || "").trim();
    const rawMsg = template
      ? applyWhatsappTemplate(template, {
        reference: bookingConfirmed.bookingId,
        vehicle: bookingConfirmed.carName,
        full_name: bookingConfirmed.fullName || "",
        name: bookingConfirmed.fullName || "",
        phone: bookingConfirmed.phone || "",
        email: bookingConfirmed.email || "",
        pickup_date: bookingConfirmed.pickupDate || "",
        return_date: bookingConfirmed.returnDate || "",
        duration: bookingConfirmed.estimatedDays ? String(bookingConfirmed.estimatedDays) : "",
        days: bookingConfirmed.estimatedDays ? String(bookingConfirmed.estimatedDays) : "",
        total: bookingConfirmed.estimatedTotal || "",
        total_estimated: bookingConfirmed.estimatedTotal || "",
        currency: curCode,
        city: estimation.default_city || "",
        date: bookingConfirmed.pickupDate || "",
      })
      : fallbackMessage;
    const refLine = `${t("reservation_reference")}: ${bookingConfirmed.bookingId}`;
    const msgWithRef = rawMsg.includes(bookingConfirmed.bookingId) ? rawMsg : `${rawMsg}\n${refLine}`;
    const msg = sanitizeWhatsappMessage(msgWithRef);
    return `https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}?text=${encodeURIComponent(msg)}`;
  };

  const submitBookingDraft = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bookingCar) return;
    setBookingSubmitError("");
    const errors = validateBookingDraft();
    setBookingErrors(errors);
    if (Object.keys(errors).length > 0) return;

    let estimatedDays: number | null = null;
    let estimatedTotal: string | null = null;
    if (bookingDraft.pickup_date && bookingDraft.return_date) {
      const dayMs = 24 * 60 * 60 * 1000;
      const diff = new Date(bookingDraft.return_date).getTime() - new Date(bookingDraft.pickup_date).getTime();
      estimatedDays = Math.max(1, Math.ceil(diff / dayMs));
      const total = convertFromMad(bookingCar.price_per_day, curCode) * estimatedDays;
      estimatedTotal = formatCurrencyDisplay(total, curCode, estimation.currency_symbol);
    }

    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const tomorrowIso = new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
    const pickupDate = bookingDraft.pickup_date || todayIso;
    const returnDate = bookingDraft.return_date || (bookingDraft.pickup_date ? bookingDraft.pickup_date : tomorrowIso);
    const payload = {
      customer_name: bookingDraft.full_name.trim(),
      phone: bookingDraft.phone.trim(),
      email: bookingDraft.email.trim(),
      pickup_date: pickupDate,
      return_date: returnDate,
      car_id: bookingCar.id,
    };

    setBookingSubmitting(true);
    const created = await createBooking(payload);
    if (!created) {
      setBookingSubmitError(t("booking_save_failed"));
      setBookingSubmitting(false);
      return;
    }
    setBookingSubmitting(false);

    setBookingConfirmed({
      bookingId: created.booking_id,
      carName: bookingCar.name,
      fullName: bookingDraft.full_name.trim(),
      email: bookingDraft.email.trim(),
      phone: bookingDraft.phone.trim(),
      pickupDate: bookingDraft.pickup_date,
      returnDate: bookingDraft.return_date,
      estimatedDays,
      estimatedTotal,
    });
  };

  const renderCard = (car: Car, i: number) => {
    const imgSrc = car.images[0];
    const delay = `${i * 0.05}s`;
    const carPrice = convertFromMad(car.price_per_day, curCode);
    const carPriceDisplay = formatCurrencyDisplay(carPrice, curCode, estimation.currency_symbol);
    const baseCardBg = colors.surface;
    const baseCardText = contrastTextColor(baseCardBg);
    const baseCardMuted = colors.muted;
    const basePriceColor = ensureReadableAccent(ts.primaryHSL, baseCardBg, 3);

    if (variant === "minimal") {
      const minimalPreviewBg = colors.surfaceAlt;
      return (
        <div key={car.id} className="overflow-hidden transition-all duration-300 hover:-translate-y-1 group animate-fade-in rounded-2xl"
          style={{ animationDelay: delay, background: baseCardBg, border: `1px solid ${cardBorderColor}`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.08)" }}>
          <div className="relative h-44 overflow-hidden" style={{ background: minimalPreviewBg }}>
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: primaryButton.background, color: priceBadgeText }}>{carPriceDisplay}</div>
            {imgSrc ? <img src={imgSrc} alt={car.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center"><CarIcon size={48} className="text-slate-200" /></div>}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-sm" style={{ color: baseCardText, fontFamily: theme.heading_font }}>{car.name}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: baseCardMuted }}>
              <span className="flex items-center gap-1"><Users size={12} /> {car.seats}</span>
              <span className="flex items-center gap-1"><Settings2 size={12} /> {t(car.transmission)}</span>
              <span className="flex items-center gap-1"><Fuel size={12} /> {t(car.fuel_type)}</span>
            </div>
            <button onClick={() => openBookingModal(car)}
              className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 text-xs font-bold rounded-xl btn-animated"
              style={{ background: primaryButton.background, color: cardCtaText }}>
              <MessageCircle size={14} style={{ color: cardCtaText }} /> {t("book_this_car")}
            </button>
          </div>
        </div>
      );
    }

    if (variant === "luxury") {
      const luxuryPreviewBg = `linear-gradient(135deg, ${withAlpha(ts.primaryHSL, 0.08)}, ${colors.surfaceAlt})`;
      return (
        <div key={car.id} className="overflow-hidden transition-all duration-300 hover:-translate-y-1 group animate-fade-in rounded-2xl"
          style={{ animationDelay: delay, background: baseCardBg, border: `1px solid ${cardBorderColor}`, boxShadow: isFlat ? "none" : "0 8px 30px -10px rgba(0,0,0,0.1)" }}>
          <div className="relative h-52 overflow-hidden" style={{ background: luxuryPreviewBg }}>
            {imgSrc ? <img src={imgSrc} alt={car.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center"><CarIcon size={60} className="text-slate-200" /></div>}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base" style={{ color: baseCardText, fontFamily: theme.heading_font }}>{car.name}</h3>
              <p className="font-bold text-lg" style={{ color: basePriceColor }}>{carPriceDisplay}<span className="text-xs font-normal" style={{ color: baseCardMuted }}>{t("per_day")}</span></p>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: baseCardMuted }}>
              <span className="flex items-center gap-1"><Users size={12} /> {car.seats} {t("seats")}</span>
              <span className="flex items-center gap-1"><Settings2 size={12} /> {t(car.transmission)}</span>
              <span className="flex items-center gap-1"><Fuel size={12} /> {t(car.fuel_type)}</span>
            </div>
            <button onClick={() => openBookingModal(car)}
              className="flex items-center justify-center gap-2 w-full mt-4 py-3 text-xs font-bold rounded-xl btn-animated"
              style={{ background: primaryButton.background, color: cardCtaText }}>
              <MessageCircle size={14} style={{ color: cardCtaText }} /> {t("reserve_whatsapp")}
            </button>
          </div>
        </div>
      );
    }

    if (variant === "glass") {
      const glassBg = withAlpha(colors.surface, ts.isDark ? 0.42 : 0.78);
      const glassText = contrastTextColor(glassBg);
      const glassMuted = colors.muted;
      const glassPrice = ensureReadableAccent(ts.primaryHSL, glassBg, 3);
      return (
        <div key={car.id} className="overflow-hidden transition-all duration-300 hover:-translate-y-1 group animate-fade-in rounded-2xl backdrop-blur"
          style={{ animationDelay: delay, background: glassBg, border: `1px solid ${colors.borderStrong}`, boxShadow: isFlat ? "none" : "0 8px 32px rgba(0,0,0,0.06)" }}>
          <div className="relative h-48 overflow-hidden rounded-t-2xl" style={{ background: colors.surfaceAlt }}>
            {imgSrc ? <img src={imgSrc} alt={car.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center"><CarIcon size={48} className="text-slate-200" /></div>}
          </div>
          <div className="p-5">
            <h3 className="font-bold text-sm mb-1" style={{ color: glassText, fontFamily: theme.heading_font }}>{car.name}</h3>
            <p className="text-lg font-bold mb-2" style={{ color: glassPrice }}>{carPriceDisplay}<span className="text-xs font-normal" style={{ color: glassMuted }}> {t("per_day")}</span></p>
            <div className="flex items-center gap-3 text-xs" style={{ color: glassMuted }}>
              <span className="flex items-center gap-1"><Users size={12} /> {car.seats}</span>
              <span className="flex items-center gap-1"><Settings2 size={12} /> {t(car.transmission)}</span>
            </div>
            <button onClick={() => openBookingModal(car)}
              className="flex items-center justify-center gap-2 w-full mt-4 py-3 text-xs font-bold rounded-xl btn-animated"
              style={{ background: primaryButton.background, color: cardCtaText }}>
              <MessageCircle size={14} style={{ color: cardCtaText }} /> {t("book_this_car")}
            </button>
          </div>
        </div>
      );
    }

    if (variant === "detailed") {
      const detailedBg = baseCardBg;
      const detailedText = contrastTextColor(detailedBg);
      const detailedMuted = colors.muted;
      const detailedPrice = ensureReadableAccent(ts.primaryHSL, detailedBg, 3);
      return (
        <div key={car.id} className="overflow-hidden transition-all duration-300 hover:-translate-y-1 group animate-fade-in rounded-2xl"
          style={{ animationDelay: delay, background: detailedBg, border: `1px solid ${cardBorderColor}`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.08)" }}>
          <div className="p-4 pb-2 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base" style={{ color: detailedText, fontFamily: theme.heading_font }}>{car.name.split(" ")[0]}</h3>
              <p className="text-[11px]" style={{ color: detailedMuted }}>{car.name.split(" ").slice(1).join(" ") || car.category}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border" style={{ borderColor: ts.primaryHSL, color: ts.primaryHSL }}>
              {t("on_demand")}
            </span>
          </div>
          <div className="h-44 overflow-hidden mx-3 rounded-xl" style={{ background: colors.surfaceAlt }}>
            {imgSrc ? <img src={imgSrc} alt={car.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-2" loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center"><CarIcon size={48} className="text-slate-200" /></div>}
          </div>
          <div className="p-4 pt-3">
            <p className="text-[10px]" style={{ color: detailedMuted }}>{t("starting_from")}</p>
            <p className="text-2xl font-bold" style={{ color: detailedPrice, fontFamily: theme.heading_font }}>
              {carPriceDisplay}
              <span className="text-xs font-normal" style={{ color: detailedMuted }}> {t("per_day")}</span>
            </p>
            <button onClick={() => openBookingModal(car)}
              className="flex items-center justify-center gap-2 w-full mt-3 py-3 text-xs font-bold rounded-xl btn-animated"
              style={{ background: primaryButton.background, color: cardCtaText }}>
              <MessageCircle size={14} style={{ color: cardCtaText }} /> {t("reserve_whatsapp")}
            </button>
          </div>
        </div>
      );
    }

    // compact (default fallback)
    const compactBg = baseCardBg;
    const compactText = contrastTextColor(compactBg);
    const compactMuted = colors.muted;
    const compactPrice = ensureReadableAccent(ts.primaryHSL, compactBg, 3);
    return (
      <div key={car.id} className="overflow-hidden transition-all duration-300 hover:-translate-y-1 group animate-fade-in rounded-2xl"
        style={{ animationDelay: delay, background: compactBg, border: `1px solid ${cardBorderColor}`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.08)" }}>
        <div className="p-4 pb-2 flex items-center justify-between">
          <div>
            <p className="text-[10px]" style={{ color: compactMuted }}>{t("starting_from")} *</p>
            <p className="text-3xl font-bold" style={{ color: compactPrice, fontFamily: theme.heading_font }}>{carPriceDisplay}</p>
          </div>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border" style={{ borderColor: ts.primaryHSL, color: ts.primaryHSL }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ts.primaryHSL }} />
            {t("available")}
          </span>
        </div>
        <div className="h-40 overflow-hidden mx-3 rounded-xl" style={{ background: `linear-gradient(135deg, ${withAlpha(ts.primaryHSL, 0.04)}, ${colors.surfaceAlt})` }}>
          {imgSrc ? <img src={imgSrc} alt={car.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-1" loading="lazy" />
            : <div className="w-full h-full flex items-center justify-center"><CarIcon size={48} className="text-slate-200" /></div>}
        </div>
        <div className="p-4 pt-3">
          <h3 className="font-bold text-base" style={{ color: compactText, fontFamily: theme.heading_font }}>{car.name.split(" ")[0]}</h3>
          <p className="text-xs" style={{ color: compactMuted }}>{car.category}</p>
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${cardBorderColor}` }}>
            {[
              { icon: <Users size={14} />, label: t("seats"), val: String(car.seats) },
              { icon: <Briefcase size={14} />, label: t("baggage"), val: "2" },
              { icon: <Settings2 size={14} />, label: t("transmission"), val: t(car.transmission).substring(0, 5) + "." },
              { icon: <Fuel size={14} />, label: t("fuel"), val: t(car.fuel_type) },
            ].map((s, j) => (
              <div key={j} className="text-center">
                <div className="flex justify-center mb-0.5" style={{ color: compactMuted }}>{s.icon}</div>
                <p className="text-[9px]" style={{ color: compactMuted }}>{s.label}</p>
                <p className="text-[10px] font-bold" style={{ color: compactText }}>{s.val}</p>
              </div>
            ))}
          </div>
          <button onClick={() => openBookingModal(car)}
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 text-xs font-bold rounded-xl btn-animated"
            style={{ background: primaryButton.background, color: cardCtaText }}>
            {t("choose_model")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section id="cars" className="py-16 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: ts.primaryHSL }}>{t("our_fleet")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          <p className="mt-2 max-w-lg mx-auto" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all border btn-animated"
              style={{ background: activeCategory === cat ? primaryButton.background : "transparent", color: activeCategory === cat ? primaryButton.text : mutedColor, borderColor: activeCategory === cat ? primaryButton.background : cardBorderColor }}>
              {cat === "all" ? t("all_categories") : cat}
            </button>
          ))}
        </div>
        <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2 ${desktopColsClassByCount[carsSectionConfig.cards_per_row]}`}>
          {filtered.map((car, i) => renderCard(car, i))}
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={!!bookingCar} onOpenChange={(open) => {
        if (!open) {
          setBookingCar(null);
          resetBookingModalState();
        }
      }}>
        <DialogContent
          className="w-[calc(100%-1rem)] max-w-md rounded-2xl border shadow-2xl p-4 sm:p-6 top-[max(0.5rem,env(safe-area-inset-top))] -translate-y-0 sm:top-[50%] sm:-translate-y-[50%] max-h-[calc(var(--booking-vh,100dvh)-max(1rem,env(safe-area-inset-top))-max(1rem,env(safe-area-inset-bottom)))] sm:max-h-[min(92dvh,760px)] overflow-y-auto"
          overlayClassName="bg-slate-900/42 backdrop-blur-[1.5px]"
          style={{
            background: withAlpha(modalBg, 0.96),
            borderColor: cardBorderColor,
            color: textColor,
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollPaddingTop: "4.5rem",
            scrollPaddingBottom: "8rem",
            ["--booking-vh" as string]: bookingViewportHeight ? `${bookingViewportHeight}px` : "100dvh",
          } as React.CSSProperties}
        >
          {!bookingConfirmed ? (
            <>
              <DialogHeader className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: mutedColor }}>{t("book_now")}</p>
                <DialogTitle className="text-2xl leading-tight" style={{ fontFamily: theme.heading_font, color: textColor }}>
                  {bookingCar?.name}
                </DialogTitle>
                <p className="text-sm" style={{ color: mutedColor }}>{t("reservation_form_hint")}</p>
              </DialogHeader>
              <form className="space-y-3 pb-2" onSubmit={submitBookingDraft} noValidate>
                {bookingForm.show_name && (
                  <div>
                    <Label className="text-xs" style={{ color: modalLabelColor }}>{t("full_name")}</Label>
                    <Input
                      ref={setBookingInputRef("full_name")}
                      value={bookingDraft.full_name}
                      onChange={(e) => setBookingDraft(prev => ({ ...prev, full_name: e.target.value }))}
                      onKeyDown={handleBookingFieldKeyDown("full_name")}
                      onFocus={handleBookingFieldFocus("full_name")}
                      autoComplete="name"
                      enterKeyHint="next"
                      className="mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)]"
                      style={modalInputStyle}
                    />
                    {bookingErrors.full_name && <p className="mt-1 text-[11px] text-red-500">{bookingErrors.full_name}</p>}
                  </div>
                )}
                {bookingForm.show_email && (
                  <div>
                    <Label className="text-xs" style={{ color: modalLabelColor }}>{t("email")}</Label>
                    <Input
                      ref={setBookingInputRef("email")}
                      type="email"
                      value={bookingDraft.email}
                      onChange={(e) => setBookingDraft(prev => ({ ...prev, email: e.target.value }))}
                      onKeyDown={handleBookingFieldKeyDown("email")}
                      onFocus={handleBookingFieldFocus("email")}
                      autoComplete="email"
                      inputMode="email"
                      enterKeyHint="next"
                      className="mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)]"
                      style={modalInputStyle}
                    />
                    {bookingErrors.email && <p className="mt-1 text-[11px] text-red-500">{bookingErrors.email}</p>}
                  </div>
                )}
                {bookingForm.show_phone && (
                  <div>
                    <Label className="text-xs" style={{ color: modalLabelColor }}>{t("phone")}</Label>
                    <Input
                      ref={setBookingInputRef("phone")}
                      value={bookingDraft.phone}
                      onChange={(e) => setBookingDraft(prev => ({ ...prev, phone: e.target.value }))}
                      onKeyDown={handleBookingFieldKeyDown("phone")}
                      onFocus={handleBookingFieldFocus("phone")}
                      autoComplete="tel"
                      inputMode="tel"
                      enterKeyHint="next"
                      className="mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)]"
                      style={modalInputStyle}
                    />
                    {bookingErrors.phone && <p className="mt-1 text-[11px] text-red-500">{bookingErrors.phone}</p>}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bookingForm.show_pickup_date && (
                    <div>
                      <Label className="text-xs" style={{ color: modalLabelColor }}>{t("pickup_date")}</Label>
                      <Input
                        ref={setBookingInputRef("pickup_date")}
                        type="date"
                        value={bookingDraft.pickup_date}
                        onChange={(e) => setBookingDraft(prev => ({ ...prev, pickup_date: e.target.value }))}
                        onKeyDown={handleBookingFieldKeyDown("pickup_date")}
                        onFocus={handleBookingFieldFocus("pickup_date")}
                        enterKeyHint="next"
                        className={`mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)] ${isDarkSurface(modalInputBg) ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
                        style={modalInputStyle}
                      />
                      {bookingErrors.pickup_date && <p className="mt-1 text-[11px] text-red-500">{bookingErrors.pickup_date}</p>}
                    </div>
                  )}
                  {bookingForm.show_return_date && (
                    <div>
                      <Label className="text-xs" style={{ color: modalLabelColor }}>{t("return_date")}</Label>
                      <Input
                        ref={setBookingInputRef("return_date")}
                        type="date"
                        value={bookingDraft.return_date}
                        onChange={(e) => setBookingDraft(prev => ({ ...prev, return_date: e.target.value }))}
                        onKeyDown={handleBookingFieldKeyDown("return_date")}
                        onFocus={handleBookingFieldFocus("return_date")}
                        enterKeyHint="done"
                        className={`mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)] ${isDarkSurface(modalInputBg) ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
                        style={modalInputStyle}
                      />
                      {bookingErrors.return_date && <p className="mt-1 text-[11px] text-red-500">{bookingErrors.return_date}</p>}
                    </div>
                  )}
                </div>
                {bookingSubmitError && <p className="text-xs text-red-500">{bookingSubmitError}</p>}
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3.5 text-sm font-bold rounded-xl btn-animated disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: primaryButton.background, color: modalButtonText, boxShadow: isFlat ? "none" : "0 10px 30px -12px rgba(0,0,0,0.35)" }}
                >
                  {bookingSubmitting ? t("saving_reservation") : t("confirm_booking")}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <DialogHeader className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: mutedColor }}>{t("thank_you")}</p>
                <DialogTitle className="text-2xl leading-tight" style={{ fontFamily: theme.heading_font }}>{t("reservation_confirmed_title")}</DialogTitle>
                <p className="text-sm" style={{ color: mutedColor }}>{t("reservation_confirmed_subtitle")}</p>
              </DialogHeader>
              <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: cardBorderColor, background: withAlpha(colors.surfaceAlt, 0.8) }}>
                <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                  <p className="font-medium" style={{ color: mutedColor }}>{t("reservation_reference")}</p>
                  <p className="font-semibold" style={{ color: textColor }}>{bookingConfirmed.bookingId}</p>
                  <p className="font-medium" style={{ color: mutedColor }}>{t("select_vehicle")}</p>
                  <p className="font-semibold" style={{ color: textColor }}>{bookingConfirmed.carName}</p>
                  {bookingConfirmed.fullName && <><p className="font-medium" style={{ color: mutedColor }}>{t("full_name")}</p><p style={{ color: textColor }}>{bookingConfirmed.fullName}</p></>}
                  {bookingConfirmed.phone && <><p className="font-medium" style={{ color: mutedColor }}>{t("phone")}</p><p style={{ color: textColor }}>{bookingConfirmed.phone}</p></>}
                  {bookingConfirmed.email && <><p className="font-medium" style={{ color: mutedColor }}>{t("email")}</p><p style={{ color: textColor }}>{bookingConfirmed.email}</p></>}
                  {bookingConfirmed.pickupDate && <><p className="font-medium" style={{ color: mutedColor }}>{t("pickup_date")}</p><p style={{ color: textColor }}>{bookingConfirmed.pickupDate}</p></>}
                  {bookingConfirmed.returnDate && <><p className="font-medium" style={{ color: mutedColor }}>{t("return_date")}</p><p style={{ color: textColor }}>{bookingConfirmed.returnDate}</p></>}
                  {bookingConfirmed.estimatedTotal && (
                    <>
                      <p className="font-medium" style={{ color: mutedColor }}>{t("total_estimated")}</p>
                      <p style={{ color: textColor }}>
                        {bookingConfirmed.estimatedTotal}
                        {bookingConfirmed.estimatedDays ? ` (${bookingConfirmed.estimatedDays} ${t("days")})` : ""}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <a
                href={buildBookingWhatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold rounded-xl btn-animated"
                style={{ background: primaryButton.background, color: modalButtonText, boxShadow: isFlat ? "none" : "0 12px 32px -12px rgba(0,0,0,0.35)" }}
              >
                <MessageCircle size={16} style={{ color: modalButtonText }} /> {t("send_reservation_whatsapp")}
              </a>
              <button
                type="button"
                onClick={() => {
                  setBookingCar(null);
                  resetBookingModalState();
                }}
                className="w-full py-2.5 text-sm font-semibold rounded-xl border"
                style={{ borderColor: cardBorderColor, color: textColor }}
              >
                {t("close")}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   ESTIMATION CALCULATOR
   ═══════════════════════════════════════════════════════════════════ */
const EstimationSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { estimation, cars, contact, cities: adminCities, bookingForm, createBooking } = useAdmin();
  const { lt, t, isRTL, lang } = useLanguage();
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;
  const isFlat = theme.flat_design;
  const curCode = theme.selected_currency;

  const [selectedCity, setSelectedCity] = useState(estimation.default_city);
  const [selectedTier, setSelectedTier] = useState(estimation.pricing_tiers[0]?.id || "");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reservationCar, setReservationCar] = useState<Car | null>(null);
  const [reservationDraft, setReservationDraft] = useState({
    full_name: "",
    email: "",
    phone: "",
    pickup_date: "",
    return_date: "",
  });
  const [reservationErrors, setReservationErrors] = useState<Partial<Record<"full_name" | "email" | "phone" | "pickup_date" | "return_date", string>>>({});
  const [reservationConfirmed, setReservationConfirmed] = useState<null | {
    bookingId: string;
    carName: string;
    fullName: string;
    email: string;
    phone: string;
    pickupDate: string;
    returnDate: string;
    estimatedDays: number | null;
    estimatedTotal: string | null;
  }>(null);
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [reservationSubmitError, setReservationSubmitError] = useState("");
  const [reservationViewportHeight, setReservationViewportHeight] = useState<number | null>(null);
  const reservationInputRefs = useRef<Partial<Record<BookingFieldKey, HTMLInputElement | null>>>({});

  const availableCars = cars.filter(c => c.availability_status === "available");
  const tier = estimation.pricing_tiers.find(t => t.id === selectedTier);
  const car = availableCars.find(c => c.id === selectedCarId);
  const days = tier ? Math.ceil((tier.min_days + (tier.max_days || tier.min_days + 10)) / 2) : 5;
  const discount = tier ? tier.discount_percent : 0;
  const basePricePerDayMad = car ? car.price_per_day * (1 - discount / 100) : 0;
  const pricePerDay = convertFromMad(basePricePerDayMad, curCode);
  const total = convertFromMad(basePricePerDayMad * days, curCode);

  const baseBackground = `hsl(${theme.background_color})`;
  const sectionBg = ts.isDark
    ? ts.sectionAlt
    : shiftColor(baseBackground, lp === "eco" ? -0.04 : lp === "classic" ? -0.03 : -0.015);
  const colors = deriveThemeColorSystem(theme, ts, sectionBg);
  const textColor = colors.text;
  const mutedColor = colors.muted;
  const formBg = colors.surface;
  const formBorder = colors.borderStrong;
  const formLabelColor = colors.muted;
  const formMetaColor = colors.muted;
  const formInputBg = colors.inputBg;
  const formInputText = colors.inputText;
  const formPlaceholder = colors.placeholder;
  const formInputBorder = colors.inputBorder;
  const selectInputStyle = {
    background: formInputBg,
    borderColor: formInputBorder,
    color: formInputText,
    ["--ds-select-value-color" as any]: formInputText,
    ["--ds-select-placeholder-color" as any]: formPlaceholder,
  } as React.CSSProperties;
  const estimationButton = colors.primaryButton;
  const ctaTextColor = estimationButton.text;
  const dateInputStyle = {
    background: formInputBg,
    borderColor: formInputBorder,
    color: formInputText,
    ["--ds-input-placeholder-color" as any]: formPlaceholder,
  } as React.CSSProperties;
  const modalInputStyle = {
    background: formInputBg,
    borderColor: formInputBorder,
    color: formInputText,
    ["--ds-input-placeholder-color" as any]: formPlaceholder,
  } as React.CSSProperties;
  const enabledCityValues = adminCities.filter(c => c.enabled).map(c => lt(c.name));
  const safeSelectedCity = enabledCityValues.includes(selectedCity) ? selectedCity : undefined;
  const availableCarIds = availableCars.map(c => c.id);
  const safeSelectedCarId = availableCarIds.includes(selectedCarId) ? selectedCarId : undefined;
  let estimationContent: Record<string, unknown> = {};
  try { estimationContent = config.content ? JSON.parse(config.content) : {}; } catch { estimationContent = {}; }
  const insuranceModalRaw = ((estimationContent as { insurance_modal?: unknown }).insurance_modal ?? {}) as Record<string, unknown>;
  const buttonLabelRaw = estimationContent.button_label;
  const confirmButtonLabel = (() => {
    if (typeof buttonLabelRaw === "string" && buttonLabelRaw.trim()) return buttonLabelRaw.trim();
    if (buttonLabelRaw && typeof buttonLabelRaw === "object") {
      const localized = buttonLabelRaw as Partial<Record<Language, string>>;
      return (localized[lang] || localized.fr || localized.en || "").trim() || t("confirm_whatsapp");
    }
    return t("confirm_whatsapp");
  })();
  const insuranceLabels = {
    with_caution_title: { fr: "Avec caution :", en: "With deposit:", ar: "مع وديعة:" },
    without_caution_title: { fr: "Sans caution :", en: "Without deposit:", ar: "بدون وديعة:" },
  } as const;
  const getLocalizedModalText = (raw: unknown, fallback: string) => {
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    if (raw && typeof raw === "object") {
      const localized = raw as Partial<Record<Language, string>>;
      return (localized[lang] || localized.fr || localized.en || "").trim() || fallback;
    }
    return fallback;
  };
  const parseBulletLines = (text: string) =>
    text
      .split("\n")
      .map((line) => line.replace(/^[\s\-•]+/, "").trim())
      .filter(Boolean);
  const insuranceModalTitle = getLocalizedModalText(
    insuranceModalRaw.title,
    lang === "fr" ? "Assurance & Caution - Informations importantes" : lang === "ar" ? "التأمين والوديعة - معلومات مهمة" : "Insurance & Deposit - Important Information",
  );
  const insuranceModalDescription = getLocalizedModalText(
    insuranceModalRaw.description,
    lang === "fr"
      ? "Pour certaines voitures, une caution (dépôt de garantie) est demandée lors de la prise du véhicule."
      : lang === "ar"
      ? "لبعض السيارات، تُطلب وديعة (تأمين) عند استلام المركبة."
      : "For some cars, a security deposit is required at pickup.",
  );
  const withCautionLines = parseBulletLines(
    getLocalizedModalText(
      insuranceModalRaw.with_caution,
      lang === "fr"
        ? "Une caution est déposée (ex : 500 €)\nLa caution est restituée si le véhicule est rendu en bon état\nLe prix de location est plus avantageux"
        : lang === "ar"
        ? "يتم إيداع وديعة (مثال: 500€)\nتُعاد الوديعة إذا تم إرجاع السيارة بحالة جيدة\nسعر الإيجار يكون أكثر فائدة"
        : "A deposit is paid (e.g. 500 EUR)\nThe deposit is refunded if the vehicle is returned in good condition\nRental price is usually lower",
    ),
  );
  const withoutCautionLines = parseBulletLines(
    getLocalizedModalText(
      insuranceModalRaw.without_caution,
      lang === "fr"
        ? "Aucune caution demandée\nLe prix de location est plus élevé"
        : lang === "ar"
        ? "لا توجد وديعة مطلوبة\nسعر الإيجار يكون أعلى"
        : "No deposit required\nRental price is higher",
    ),
  );
  const insuranceModalButtonLabel = getLocalizedModalText(
    insuranceModalRaw.button_label,
    lang === "fr" ? "Assurance & caution" : lang === "ar" ? "التأمين والوديعة" : "Insurance & deposit",
  );
  const reservationFieldOrder = useMemo<BookingFieldKey[]>(() => {
    const fields: BookingFieldKey[] = [];
    if (bookingForm.show_name) fields.push("full_name");
    if (bookingForm.show_email) fields.push("email");
    if (bookingForm.show_phone) fields.push("phone");
    if (bookingForm.show_pickup_date) fields.push("pickup_date");
    if (bookingForm.show_return_date) fields.push("return_date");
    return fields;
  }, [
    bookingForm.show_name,
    bookingForm.show_email,
    bookingForm.show_phone,
    bookingForm.show_pickup_date,
    bookingForm.show_return_date,
  ]);
  useEffect(() => {
    if (!reservationModalOpen || typeof window === "undefined") {
      setReservationViewportHeight(null);
      return;
    }
    const updateViewportHeight = () => {
      const viewportHeight = Math.round(window.visualViewport?.height ?? window.innerHeight);
      setReservationViewportHeight(viewportHeight);
    };
    updateViewportHeight();
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, [reservationModalOpen]);
  const setReservationInputRef = (field: BookingFieldKey) => (node: HTMLInputElement | null) => {
    reservationInputRefs.current[field] = node;
  };
  const scrollReservationFieldIntoView = (field: BookingFieldKey) => {
    const node = reservationInputRefs.current[field];
    if (!node) return;
    const scrollToField = () => {
      node.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    };
    window.requestAnimationFrame(scrollToField);
    window.setTimeout(scrollToField, 180);
  };
  const handleReservationFieldFocus = (field: BookingFieldKey) => () => {
    if (typeof window === "undefined") return;
    scrollReservationFieldIntoView(field);
  };
  const focusNextReservationField = (field: BookingFieldKey) => {
    const index = reservationFieldOrder.indexOf(field);
    if (index < 0) return false;
    const nextField = reservationFieldOrder[index + 1];
    if (!nextField) return false;
    const nextInput = reservationInputRefs.current[nextField];
    if (!nextInput) return false;
    nextInput.focus();
    scrollReservationFieldIntoView(nextField);
    return true;
  };
  const handleReservationFieldKeyDown = (field: BookingFieldKey) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    const moved = focusNextReservationField(field);
    if (moved) {
      e.preventDefault();
      return;
    }
    if (field === "return_date") return;
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  };
  const openReservationModal = () => {
    if (!car) return;
    const pickupDate = desiredDate || "";
    const returnDate = pickupDate
      ? new Date(new Date(pickupDate).getTime() + Math.max(days - 1, 0) * 86400000).toISOString().slice(0, 10)
      : "";
    setReservationCar(car);
    setReservationDraft({
      full_name: "",
      email: "",
      phone: "",
      pickup_date: pickupDate,
      return_date: returnDate,
    });
    setReservationErrors({});
    setReservationConfirmed(null);
    setReservationSubmitting(false);
    setReservationSubmitError("");
    setReservationModalOpen(true);
  };
  const resetReservationModalState = () => {
    setReservationDraft({
      full_name: "",
      email: "",
      phone: "",
      pickup_date: "",
      return_date: "",
    });
    setReservationErrors({});
    setReservationConfirmed(null);
    setReservationSubmitting(false);
    setReservationSubmitError("");
  };
  const validateReservationDraft = () => {
    const errors: Partial<Record<"full_name" | "email" | "phone" | "pickup_date" | "return_date", string>> = {};
    const requiredMsg = t("field_required");
    if (bookingForm.show_name && !reservationDraft.full_name.trim()) errors.full_name = requiredMsg;
    if (bookingForm.show_email) {
      if (!reservationDraft.email.trim()) errors.email = requiredMsg;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservationDraft.email.trim())) errors.email = t("invalid_email");
    }
    if (bookingForm.show_phone && !reservationDraft.phone.trim()) errors.phone = requiredMsg;
    if (bookingForm.show_pickup_date && !reservationDraft.pickup_date) errors.pickup_date = requiredMsg;
    if (bookingForm.show_return_date && !reservationDraft.return_date) errors.return_date = requiredMsg;
    if (bookingForm.show_pickup_date && bookingForm.show_return_date && reservationDraft.pickup_date && reservationDraft.return_date) {
      if (new Date(reservationDraft.return_date).getTime() < new Date(reservationDraft.pickup_date).getTime()) {
        errors.return_date = t("return_after_pickup");
      }
    }
    return errors;
  };
  const buildReservationWhatsappLink = () => {
    if (!reservationConfirmed) return `https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`;
    const fallbackLines = [
      t("reservation_whatsapp_intro"),
      `${t("reservation_reference")}: ${reservationConfirmed.bookingId}`,
      `${t("select_vehicle")}: ${reservationConfirmed.carName}`,
    ];
    if (reservationConfirmed.fullName) fallbackLines.push(`${t("full_name")}: ${reservationConfirmed.fullName}`);
    if (reservationConfirmed.phone) fallbackLines.push(`${t("phone")}: ${reservationConfirmed.phone}`);
    if (reservationConfirmed.email) fallbackLines.push(`${t("email")}: ${reservationConfirmed.email}`);
    if (reservationConfirmed.pickupDate) fallbackLines.push(`${t("pickup_date")}: ${reservationConfirmed.pickupDate}`);
    if (reservationConfirmed.returnDate) fallbackLines.push(`${t("return_date")}: ${reservationConfirmed.returnDate}`);
    if (reservationConfirmed.estimatedDays && reservationConfirmed.estimatedTotal) {
      fallbackLines.push(`${t("days")}: ${reservationConfirmed.estimatedDays}`);
      fallbackLines.push(`${t("total_estimated")}: ${reservationConfirmed.estimatedTotal}`);
    }
    const fallbackMessage = fallbackLines.join("\n");
    const template = (estimation.whatsapp_message_template || "").trim();
    const rawMsg = template
      ? applyWhatsappTemplate(template, {
        reference: reservationConfirmed.bookingId,
        vehicle: reservationConfirmed.carName,
        full_name: reservationConfirmed.fullName || "",
        name: reservationConfirmed.fullName || "",
        phone: reservationConfirmed.phone || "",
        email: reservationConfirmed.email || "",
        pickup_date: reservationConfirmed.pickupDate || "",
        return_date: reservationConfirmed.returnDate || "",
        duration: reservationConfirmed.estimatedDays ? String(reservationConfirmed.estimatedDays) : "",
        days: reservationConfirmed.estimatedDays ? String(reservationConfirmed.estimatedDays) : "",
        total: reservationConfirmed.estimatedTotal || "",
        total_estimated: reservationConfirmed.estimatedTotal || "",
        currency: curCode,
        city: estimation.default_city || "",
        date: reservationConfirmed.pickupDate || "",
      })
      : fallbackMessage;
    const refLine = `${t("reservation_reference")}: ${reservationConfirmed.bookingId}`;
    const msgWithRef = rawMsg.includes(reservationConfirmed.bookingId) ? rawMsg : `${rawMsg}\n${refLine}`;
    const msg = sanitizeWhatsappMessage(msgWithRef);
    return `https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}?text=${encodeURIComponent(msg)}`;
  };
  const submitReservationDraft = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reservationCar) return;
    setReservationSubmitError("");
    const errors = validateReservationDraft();
    setReservationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    let estimatedDays: number | null = null;
    let estimatedTotal: string | null = null;
    if (reservationDraft.pickup_date && reservationDraft.return_date) {
      const dayMs = 24 * 60 * 60 * 1000;
      const diff = new Date(reservationDraft.return_date).getTime() - new Date(reservationDraft.pickup_date).getTime();
      estimatedDays = Math.max(1, Math.ceil(diff / dayMs));
      const computedTotal = convertFromMad(reservationCar.price_per_day, curCode) * estimatedDays;
      estimatedTotal = formatCurrencyDisplay(computedTotal, curCode, estimation.currency_symbol);
    }

    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const tomorrowIso = new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
    const pickupDate = reservationDraft.pickup_date || todayIso;
    const returnDate = reservationDraft.return_date || (reservationDraft.pickup_date ? reservationDraft.pickup_date : tomorrowIso);

    setReservationSubmitting(true);
    const created = await createBooking({
      customer_name: reservationDraft.full_name.trim(),
      phone: reservationDraft.phone.trim(),
      email: reservationDraft.email.trim(),
      pickup_date: pickupDate,
      return_date: returnDate,
      car_id: reservationCar.id,
    });
    if (!created) {
      setReservationSubmitError(t("booking_save_failed"));
      setReservationSubmitting(false);
      return;
    }
    setReservationSubmitting(false);
    setReservationConfirmed({
      bookingId: created.booking_id,
      carName: reservationCar.name,
      fullName: reservationDraft.full_name.trim(),
      email: reservationDraft.email.trim(),
      phone: reservationDraft.phone.trim(),
      pickupDate: reservationDraft.pickup_date,
      returnDate: reservationDraft.return_date,
      estimatedDays,
      estimatedTotal,
    });
  };

  return (
    <section id="estimation" className="py-16 px-5" style={{ background: sectionBg, fontFamily: theme.font_family }}>
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: formBg, border: `1px solid ${formBorder}`, boxShadow: isFlat ? "none" : "0 25px 60px -12px rgba(0,0,0,0.1)" }}>
          <div className="p-6 space-y-5">
            {estimation.show_city_field && (
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: formLabelColor }}>{t("pickup_city")}</Label>
                <Select value={safeSelectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger
                    className={`relative text-sm h-11 [&>span]:text-[var(--ds-select-value-color)] [&>svg]:text-[var(--ds-select-placeholder-color)] [&>svg]:opacity-90 ${safeSelectedCity ? "" : "text-transparent"}`}
                    style={selectInputStyle}
                  >
                    <SelectValue />
                    {!safeSelectedCity && (
                      <span
                        className={`pointer-events-none absolute ${isRTL ? "right-3" : "left-3"} text-sm`}
                        style={{ color: formPlaceholder }}
                      >
                        {t("pickup_city")}
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent>{adminCities.filter(c => c.enabled).map(c => <SelectItem key={c.id} value={lt(c.name)}>{lt(c.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {estimation.show_duration_field && (
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: formLabelColor }}>{t("rental_duration")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {estimation.pricing_tiers.map(pt => (
                    <button key={pt.id} onClick={() => setSelectedTier(pt.id)}
                      className="py-3 rounded-xl text-xs font-semibold transition-all border btn-animated"
                      style={{ background: selectedTier === pt.id ? estimationButton.background : formInputBg, color: selectedTier === pt.id ? ctaTextColor : formMetaColor, borderColor: selectedTier === pt.id ? estimationButton.background : formInputBorder }}>
                      {lt(pt.label)}
                      {pt.discount_percent > 0 && <span className="block text-[10px] mt-0.5 opacity-70">-{pt.discount_percent}%</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {estimation.show_vehicle_field && (
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: formLabelColor }}>{t("select_vehicle")}</Label>
                <Select value={safeSelectedCarId} onValueChange={setSelectedCarId}>
                  <SelectTrigger
                    className={`relative text-sm h-11 [&>span]:text-[var(--ds-select-value-color)] [&>svg]:text-[var(--ds-select-placeholder-color)] [&>svg]:opacity-90 ${safeSelectedCarId ? "" : "text-transparent"}`}
                    style={selectInputStyle}
                  >
                    <SelectValue />
                    {!safeSelectedCarId && (
                      <span
                        className={`pointer-events-none absolute ${isRTL ? "right-3" : "left-3"} text-sm`}
                        style={{ color: formPlaceholder }}
                      >
                        {t("select_vehicle")}
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent>{availableCars.map(c => <SelectItem key={c.id} value={c.id}>{c.name} · {t(c.transmission)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {estimation.show_date_field && (
              <div>
                <Label className="text-xs font-medium mb-1.5 block" style={{ color: formLabelColor }}>{t("desired_date")}</Label>
                <Input
                  type="date"
                  value={desiredDate}
                  onChange={(e) => setDesiredDate(e.target.value)}
                  className={`h-11 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)] ${isDarkSurface(formInputBg) ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
                  style={dateInputStyle}
                />
              </div>
            )}
            {car && (
              <div className="rounded-xl p-5 text-center animate-fade-in" style={{ background: `hsl(${theme.primary_color} / ${ts.isDark ? "0.15" : "0.06"})` }}>
                <p className="text-xs" style={{ color: formMetaColor }}>{t("price_per_day")}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: ts.primaryHSL, fontFamily: theme.heading_font }}>{formatCurrencyDisplay(pricePerDay, curCode, estimation.currency_symbol)} <span className="text-sm font-normal" style={{ color: formMetaColor }}>{t("per_day")}</span></p>
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${formBorder}` }}>
                  <p className="text-xs" style={{ color: formMetaColor }}>{t("total_estimated")} ({days} {t("days")})</p>
                  <p className="text-4xl font-bold mt-1" style={{ color: ts.primaryHSL, fontFamily: theme.heading_font }}>{formatCurrencyDisplay(total, curCode, estimation.currency_symbol)}</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setInsuranceModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold underline underline-offset-2"
              style={{ color: formMetaColor }}
            >
              <Info size={16} /> {insuranceModalButtonLabel}
            </button>
            <button
              type="button"
              onClick={openReservationModal}
              className={`flex items-center justify-center gap-2 w-full py-4 text-sm font-bold rounded-xl btn-animated ${!car ? "opacity-70 pointer-events-none" : ""}`}
              style={{ background: estimationButton.background, color: ctaTextColor }}
            >
              <MessageCircle size={18} style={{ color: ctaTextColor }} /> {confirmButtonLabel}
            </button>
          </div>
          <div className="px-6 pb-5">
            <div className="flex flex-wrap gap-3 justify-center">
              {estimation.badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: formMetaColor }}>
                  <DynIcon name={badge.icon} size={13} /><span>{lt(badge.label)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={insuranceModalOpen} onOpenChange={setInsuranceModalOpen}>
        <DialogContent
          className="rounded-3xl border p-0 overflow-hidden"
          style={{ background: formBg, borderColor: formBorder }}
        >
          <div className="p-6 sm:p-7 space-y-5">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-3xl leading-tight font-bold" style={{ color: textColor, fontFamily: theme.heading_font }}>
                {insuranceModalTitle}
              </DialogTitle>
              <p className="text-base" style={{ color: mutedColor }}>{insuranceModalDescription}</p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-2xl p-4 space-y-2" style={{ background: withAlpha(colors.surfaceAlt, 0.8) }}>
                <p className="text-lg font-bold" style={{ color: textColor }}>{insuranceLabels.with_caution_title[lang]}</p>
                <ul className="space-y-1.5">
                  {withCautionLines.map((line, i) => (
                    <li key={`with-${i}`} className="text-sm flex gap-2" style={{ color: mutedColor }}>
                      <span aria-hidden="true">-</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-4 space-y-2" style={{ background: withAlpha(colors.surfaceAlt, 0.8) }}>
                <p className="text-lg font-bold" style={{ color: textColor }}>{insuranceLabels.without_caution_title[lang]}</p>
                <ul className="space-y-1.5">
                  {withoutCautionLines.map((line, i) => (
                    <li key={`without-${i}`} className="text-sm flex gap-2" style={{ color: mutedColor }}>
                      <span aria-hidden="true">-</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInsuranceModalOpen(false)}
              className="w-full py-3 text-sm font-bold rounded-xl btn-animated"
              style={{ background: estimationButton.background, color: ctaTextColor }}
            >
              {t("close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={reservationModalOpen}
        onOpenChange={(open) => {
          setReservationModalOpen(open);
          if (!open) {
            setReservationCar(null);
            resetReservationModalState();
          }
        }}
      >
        <DialogContent
          className="w-[calc(100%-1rem)] max-w-md rounded-2xl border shadow-2xl p-4 sm:p-6 top-[max(0.5rem,env(safe-area-inset-top))] -translate-y-0 sm:top-[50%] sm:-translate-y-[50%] max-h-[calc(var(--reservation-vh,100dvh)-max(1rem,env(safe-area-inset-top))-max(1rem,env(safe-area-inset-bottom)))] sm:max-h-[min(92dvh,760px)] overflow-y-auto"
          overlayClassName="bg-slate-900/42 backdrop-blur-[1.5px]"
          style={{
            background: withAlpha(formBg, 0.96),
            borderColor: formBorder,
            color: textColor,
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollPaddingTop: "4.5rem",
            scrollPaddingBottom: "8rem",
            ["--reservation-vh" as string]: reservationViewportHeight ? `${reservationViewportHeight}px` : "100dvh",
          } as React.CSSProperties}
        >
          {!reservationConfirmed ? (
            <>
              <DialogHeader className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: mutedColor }}>{t("book_now")}</p>
                <DialogTitle className="text-2xl leading-tight" style={{ fontFamily: theme.heading_font, color: textColor }}>
                  {reservationCar?.name || t("select_vehicle")}
                </DialogTitle>
                <p className="text-sm" style={{ color: mutedColor }}>{t("reservation_form_hint")}</p>
              </DialogHeader>
              <form className="space-y-3 pb-2" onSubmit={submitReservationDraft} noValidate>
                {bookingForm.show_name && (
                  <div>
                    <Label className="text-xs" style={{ color: formLabelColor }}>{t("full_name")}</Label>
                    <Input
                      ref={setReservationInputRef("full_name")}
                      value={reservationDraft.full_name}
                      onChange={(e) => setReservationDraft(prev => ({ ...prev, full_name: e.target.value }))}
                      onKeyDown={handleReservationFieldKeyDown("full_name")}
                      onFocus={handleReservationFieldFocus("full_name")}
                      autoComplete="name"
                      enterKeyHint="next"
                      className="mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)]"
                      style={modalInputStyle}
                    />
                    {reservationErrors.full_name && <p className="mt-1 text-[11px] text-red-500">{reservationErrors.full_name}</p>}
                  </div>
                )}
                {bookingForm.show_email && (
                  <div>
                    <Label className="text-xs" style={{ color: formLabelColor }}>{t("email")}</Label>
                    <Input
                      ref={setReservationInputRef("email")}
                      type="email"
                      value={reservationDraft.email}
                      onChange={(e) => setReservationDraft(prev => ({ ...prev, email: e.target.value }))}
                      onKeyDown={handleReservationFieldKeyDown("email")}
                      onFocus={handleReservationFieldFocus("email")}
                      autoComplete="email"
                      inputMode="email"
                      enterKeyHint="next"
                      className="mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)]"
                      style={modalInputStyle}
                    />
                    {reservationErrors.email && <p className="mt-1 text-[11px] text-red-500">{reservationErrors.email}</p>}
                  </div>
                )}
                {bookingForm.show_phone && (
                  <div>
                    <Label className="text-xs" style={{ color: formLabelColor }}>{t("phone")}</Label>
                    <Input
                      ref={setReservationInputRef("phone")}
                      value={reservationDraft.phone}
                      onChange={(e) => setReservationDraft(prev => ({ ...prev, phone: e.target.value }))}
                      onKeyDown={handleReservationFieldKeyDown("phone")}
                      onFocus={handleReservationFieldFocus("phone")}
                      autoComplete="tel"
                      inputMode="tel"
                      enterKeyHint="next"
                      className="mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)]"
                      style={modalInputStyle}
                    />
                    {reservationErrors.phone && <p className="mt-1 text-[11px] text-red-500">{reservationErrors.phone}</p>}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bookingForm.show_pickup_date && (
                    <div>
                      <Label className="text-xs" style={{ color: formLabelColor }}>{t("pickup_date")}</Label>
                      <Input
                        ref={setReservationInputRef("pickup_date")}
                        type="date"
                        value={reservationDraft.pickup_date}
                        onChange={(e) => setReservationDraft(prev => ({ ...prev, pickup_date: e.target.value }))}
                        onKeyDown={handleReservationFieldKeyDown("pickup_date")}
                        onFocus={handleReservationFieldFocus("pickup_date")}
                        enterKeyHint="next"
                        className={`mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)] ${isDarkSurface(formInputBg) ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
                        style={modalInputStyle}
                      />
                      {reservationErrors.pickup_date && <p className="mt-1 text-[11px] text-red-500">{reservationErrors.pickup_date}</p>}
                    </div>
                  )}
                  {bookingForm.show_return_date && (
                    <div>
                      <Label className="text-xs" style={{ color: formLabelColor }}>{t("return_date")}</Label>
                      <Input
                        ref={setReservationInputRef("return_date")}
                        type="date"
                        value={reservationDraft.return_date}
                        onChange={(e) => setReservationDraft(prev => ({ ...prev, return_date: e.target.value }))}
                        onKeyDown={handleReservationFieldKeyDown("return_date")}
                        onFocus={handleReservationFieldFocus("return_date")}
                        enterKeyHint="done"
                        className={`mt-1 placeholder:opacity-100 placeholder:text-[var(--ds-input-placeholder-color)] ${isDarkSurface(formInputBg) ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
                        style={modalInputStyle}
                      />
                      {reservationErrors.return_date && <p className="mt-1 text-[11px] text-red-500">{reservationErrors.return_date}</p>}
                    </div>
                  )}
                </div>
                {reservationSubmitError && <p className="text-xs text-red-500">{reservationSubmitError}</p>}
                <button
                  type="submit"
                  disabled={reservationSubmitting}
                  className="w-full py-3.5 text-sm font-bold rounded-xl btn-animated disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: estimationButton.background, color: ctaTextColor, boxShadow: isFlat ? "none" : "0 10px 30px -12px rgba(0,0,0,0.35)" }}
                >
                  {reservationSubmitting ? t("saving_reservation") : t("confirm_booking")}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <DialogHeader className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: mutedColor }}>{t("thank_you")}</p>
                <DialogTitle className="text-2xl leading-tight" style={{ fontFamily: theme.heading_font }}>{t("reservation_confirmed_title")}</DialogTitle>
                <p className="text-sm" style={{ color: mutedColor }}>{t("reservation_confirmed_subtitle")}</p>
              </DialogHeader>
              <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: formBorder, background: withAlpha(colors.surfaceAlt, 0.8) }}>
                <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                  <p className="font-medium" style={{ color: mutedColor }}>{t("reservation_reference")}</p>
                  <p className="font-semibold" style={{ color: textColor }}>{reservationConfirmed.bookingId}</p>
                  <p className="font-medium" style={{ color: mutedColor }}>{t("select_vehicle")}</p>
                  <p className="font-semibold" style={{ color: textColor }}>{reservationConfirmed.carName}</p>
                  {reservationConfirmed.fullName && <><p className="font-medium" style={{ color: mutedColor }}>{t("full_name")}</p><p style={{ color: textColor }}>{reservationConfirmed.fullName}</p></>}
                  {reservationConfirmed.phone && <><p className="font-medium" style={{ color: mutedColor }}>{t("phone")}</p><p style={{ color: textColor }}>{reservationConfirmed.phone}</p></>}
                  {reservationConfirmed.email && <><p className="font-medium" style={{ color: mutedColor }}>{t("email")}</p><p style={{ color: textColor }}>{reservationConfirmed.email}</p></>}
                  {reservationConfirmed.pickupDate && <><p className="font-medium" style={{ color: mutedColor }}>{t("pickup_date")}</p><p style={{ color: textColor }}>{reservationConfirmed.pickupDate}</p></>}
                  {reservationConfirmed.returnDate && <><p className="font-medium" style={{ color: mutedColor }}>{t("return_date")}</p><p style={{ color: textColor }}>{reservationConfirmed.returnDate}</p></>}
                  {reservationConfirmed.estimatedTotal && (
                    <>
                      <p className="font-medium" style={{ color: mutedColor }}>{t("total_estimated")}</p>
                      <p style={{ color: textColor }}>
                        {reservationConfirmed.estimatedTotal}
                        {reservationConfirmed.estimatedDays ? ` (${reservationConfirmed.estimatedDays} ${t("days")})` : ""}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <a
                href={buildReservationWhatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold rounded-xl btn-animated"
                style={{ background: estimationButton.background, color: ctaTextColor, boxShadow: isFlat ? "none" : "0 12px 32px -12px rgba(0,0,0,0.35)" }}
              >
                <MessageCircle size={16} style={{ color: ctaTextColor }} /> {t("send_reservation_whatsapp")}
              </a>
              <button
                type="button"
                onClick={() => {
                  setReservationModalOpen(false);
                  setReservationCar(null);
                  resetReservationModalState();
                }}
                className="w-full py-2.5 text-sm font-semibold rounded-xl border"
                style={{ borderColor: formBorder, color: textColor }}
              >
                {t("close")}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CITIES — unique per theme
   ═══════════════════════════════════════════════════════════════════ */
const CitiesSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { cities } = useAdmin();
  const { lt } = useLanguage();
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;
  const enabled = cities.filter(c => c.enabled);
  const baseBackground = `hsl(${theme.background_color})`;
  const bgColor = ts.isDark ? ts.heroBg : shiftColor(baseBackground, lp === "eco" ? -0.04 : -0.015);
  const textColor = ts.isDark ? "#fff" : ts.heroText;
  const mutedColor = ts.heroMuted;
  const isFlat = theme.flat_design;

  // ── SPORTY: Horizontal full-bleed strip ──
  if (lp === "sporty") {
    return (
      <section id="cities" className="py-16 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
            {enabled.map((city, i) => (
              <div key={city.id} className="shrink-0 w-72 h-48 relative rounded-xl overflow-hidden snap-start group animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}>
                {city.image ? <img src={city.image} alt={lt(city.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  : <div className="w-full h-full" style={{ background: ts.cardBg }} />}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-bold text-white text-lg" style={{ fontFamily: theme.heading_font }}>{lt(city.name)}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── NEON: Glowing card grid ──
  if (lp === "neon") {
    return (
      <section id="cities" className="py-16 px-5" style={{ background: ts.sectionAlt, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {enabled.map((city, i) => (
              <div key={city.id} className="group relative overflow-hidden rounded-xl aspect-square animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s`, boxShadow: `0 0 20px hsl(${theme.primary_color} / 0.1)` }}>
                {city.image ? <img src={city.image} alt={lt(city.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  : <div className="w-full h-full" style={{ background: ts.cardBg }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="font-bold text-white text-sm" style={{ fontFamily: theme.heading_font }}>{lt(city.name)}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── SUNSET: Large alternating cards ──
  if (lp === "sunset") {
    return (
      <section id="cities" className="py-20 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10 animate-fade-in">
            <div className="w-12 h-[2px]" style={{ background: ts.primaryHSL }} />
            <h2 className="text-2xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enabled.map((city, i) => (
              <div key={city.id} className={`group relative overflow-hidden rounded-2xl animate-fade-in ${i === 0 ? "sm:col-span-2 sm:row-span-2 aspect-[4/3]" : "aspect-[4/3]"}`}
                style={{ animationDelay: `${i * 0.1}s`, boxShadow: isFlat ? "none" : "0 8px 30px -10px rgba(0,0,0,0.1)" }}>
                {city.image ? <img src={city.image} alt={lt(city.name)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  : <div className="w-full h-full" style={{ background: `hsl(${theme.primary_color} / 0.1)` }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <h3 className="font-bold text-white text-xl flex items-center gap-2" style={{ fontFamily: theme.heading_font }}>
                    <MapPin size={16} /> {lt(city.name)}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ARCTIC: Horizontal scroll with rounded pill cards ──
  if (lp === "arctic") {
    return (
      <section id="cities" className="py-16 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            {enabled.map((city, i) => (
              <div key={city.id} className="flex items-center gap-3 px-4 py-3 rounded-full border transition-all hover:-translate-y-0.5 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s`, borderColor: "hsl(210 40% 92%)", background: ts.cardBg }}>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  {city.image ? <img src={city.image} alt={lt(city.name)} className="w-full h-full object-cover" />
                    : <div className="w-full h-full" style={{ background: `hsl(${theme.primary_color} / 0.1)` }} />}
                </div>
                <span className="text-sm font-semibold pr-2" style={{ color: textColor }}>{lt(city.name)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── DESERT: Mosaic layout ──
  if (lp === "desert") {
    return (
      <section id="cities" className="py-20 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
          </div>
          <div className="grid grid-cols-6 gap-3 auto-rows-[120px]">
            {enabled.map((city, i) => {
              const spans = [
                "col-span-3 row-span-2",
                "col-span-3 row-span-1",
                "col-span-2 row-span-1",
                "col-span-2 row-span-1",
                "col-span-2 row-span-1",
              ];
              return (
                <div key={city.id} className={`${spans[i % 5]} group relative overflow-hidden rounded-2xl animate-fade-in`}
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  {city.image ? <img src={city.image} alt={lt(city.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    : <div className="w-full h-full" style={{ background: `hsl(${theme.primary_color} / 0.08)` }} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-1" style={{ fontFamily: theme.heading_font }}>
                      <MapPin size={14} /> {lt(city.name)}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ── Default (elegant, eco, classic) ──
  return (
    <section id="cities" className="py-16 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {enabled.map((city, i) => (
            <div key={city.id} className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5] transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.1)" }}>
              {city.image ? (
                <img src={city.image} alt={lt(city.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              ) : (
                <div className="w-full h-full" style={{ background: `linear-gradient(135deg, hsl(${theme.primary_color} / 0.15), ${ts.isDark ? ts.cardBg : "#e2e8f0"})` }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-1" style={{ fontFamily: theme.heading_font }}>
                  <MapPin size={14} /> {lt(city.name)}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   TESTIMONIALS — unique per theme
   ═══════════════════════════════════════════════════════════════════ */
const TestimonialsSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { testimonials } = useAdmin();
  const { lt } = useLanguage();
  const [classicActiveIdx, setClassicActiveIdx] = useState(0);
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;
  const isFlat = theme.flat_design;
  const baseBackground = `hsl(${theme.background_color})`;
  const bgColor = ts.isDark ? ts.sectionAlt : shiftColor(baseBackground, lp === "eco" ? -0.04 : lp === "classic" ? -0.03 : -0.015);
  const textColor = ts.isDark ? "#fff" : ts.heroText;
  const mutedColor = ts.heroMuted;
  const cardBg = ts.isDark ? ts.cardBg : "#fff";
  const cardBorder = ts.isDark ? "rgba(255,255,255,0.06)" : "hsl(220 10% 93%)";

  const renderAvatar = (t: typeof testimonials[0], size = 10) => (
    t.avatar ? <img src={t.avatar} alt={t.name} className={`w-${size} h-${size} rounded-full object-cover`} />
      : <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-sm font-bold`} style={{ background: `hsl(${theme.primary_color} / 0.1)`, color: ts.primaryHSL }}>{t.name.charAt(0)}</div>
  );

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={13} className={j < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}</div>
  );

  // ── SPORTY: Full-width single featured + small grid ──
  if (lp === "sporty") {
    const featured = testimonials[0];
    const rest = testimonials.slice(1);
    return (
      <section id="testimonials" className="py-20 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-10" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
          {featured && (
            <div className="rounded-2xl p-10 mb-8 border border-white/5 animate-fade-in" style={{ background: "rgba(255,255,255,0.03)" }}>
              <Quote size={40} className="mb-4" style={{ color: ts.primaryHSL, opacity: 0.3 }} />
              <p className="text-xl text-white/80 leading-relaxed mb-6 italic" style={{ fontFamily: theme.heading_font }}>&ldquo;{lt(featured.review)}&rdquo;</p>
              <div className="flex items-center gap-3">
                {renderAvatar(featured, 12)}
                <div>
                  <p className="font-bold text-white">{featured.name}</p>
                  {renderStars(featured.rating)}
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rest.map((t, i) => (
              <div key={t.id} className="rounded-xl p-5 border border-white/5 animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3 mb-3">
                  {renderAvatar(t)}
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    {renderStars(t.rating)}
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{lt(t.review)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── NEON: Glowing quote cards ──
  if (lp === "neon") {
    return (
      <section id="testimonials" className="py-16 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t, i) => (
              <div key={t.id} className="rounded-2xl p-6 border transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s`, background: ts.cardBg, borderColor: "rgba(255,255,255,0.06)", boxShadow: `0 0 40px hsl(${theme.primary_color} / 0.05)` }}>
                <Quote size={20} className="mb-3" style={{ color: ts.primaryHSL, opacity: 0.5 }} />
                <p className="text-sm text-white/70 leading-relaxed mb-4">{lt(t.review)}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  {renderAvatar(t)}
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    {renderStars(t.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── CLASSIC: Single featured quote with side navigation ──
  if (lp === "classic") {
    const active = testimonials[classicActiveIdx] || testimonials[0];
    return (
      <section id="testimonials" className="py-20 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="w-10 h-1 mb-4" style={{ background: ts.primaryHSL }} />
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
              <div className="space-y-2">
                {testimonials.map((t, i) => (
                  <button key={t.id} onClick={() => setClassicActiveIdx(i)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style={{ background: classicActiveIdx === i ? `hsl(${theme.primary_color} / 0.08)` : "transparent", color: classicActiveIdx === i ? ts.primaryHSL : mutedColor, fontWeight: classicActiveIdx === i ? 700 : 400 }}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-8 flex items-center">
              {active && (
                <div className="animate-fade-in" key={active.id}>
                  <Quote size={48} className="mb-6" style={{ color: ts.primaryHSL, opacity: 0.15 }} />
                  <p className="text-2xl leading-relaxed italic mb-8" style={{ color: textColor, fontFamily: theme.heading_font }}>&ldquo;{lt(active.review)}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    {renderAvatar(active, 14)}
                    <div>
                      <p className="font-bold text-lg" style={{ color: textColor }}>{active.name}</p>
                      {renderStars(active.rating)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── SUNSET: Masonry-style staggered cards ──
  if (lp === "sunset") {
    return (
      <section id="testimonials" className="py-20 px-5" style={{ background: ts.sectionAlt, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10 animate-fade-in">
            <div className="w-12 h-[2px]" style={{ background: ts.primaryHSL }} />
            <h2 className="text-2xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
            {testimonials.map((t, i) => (
              <div key={t.id} className="break-inside-avoid rounded-2xl p-6 border animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s`, background: cardBg, borderColor: "hsl(20 20% 92%)", boxShadow: isFlat ? "none" : "0 4px 15px -3px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 mb-3">
                  {renderAvatar(t)}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: textColor }}>{t.name}</p>
                    {renderStars(t.rating)}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{lt(t.review)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ARCTIC: Horizontal scrollable cards ──
  if (lp === "arctic") {
    return (
      <section id="testimonials" className="py-16 px-5" style={{ background: ts.sectionAlt, fontFamily: theme.font_family }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
            {testimonials.map((t, i) => (
              <div key={t.id} className="shrink-0 w-80 rounded-2xl p-6 border snap-center animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s`, background: cardBg, borderColor: "hsl(210 40% 94%)" }}>
                {renderStars(t.rating)}
                <p className="text-sm leading-relaxed mt-3 mb-4" style={{ color: mutedColor }}>{lt(t.review)}</p>
                <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: "hsl(210 40% 94%)" }}>
                  {renderAvatar(t)}
                  <p className="text-sm font-semibold" style={{ color: textColor }}>{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── DESERT: Large quote with warm styling ──
  if (lp === "desert") {
    return (
      <section id="testimonials" className="py-20 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
          </div>
          <div className="space-y-6">
            {testimonials.map((t, i) => (
              <div key={t.id} className="flex gap-6 p-6 rounded-2xl border animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s`, background: cardBg, borderColor: "hsl(30 20% 90%)", boxShadow: isFlat ? "none" : "0 4px 15px -5px rgba(0,0,0,0.05)" }}>
                <div className="shrink-0 pt-1">
                  {t.avatar ? <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover" />
                    : <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold" style={{ background: `hsl(${theme.primary_color} / 0.1)`, color: ts.primaryHSL }}>{t.name.charAt(0)}</div>}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-sm" style={{ color: textColor }}>{t.name}</p>
                    {renderStars(t.rating)}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{lt(t.review)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Default (elegant, eco): 2-column grid ──
  return (
    <section id="testimonials" className="py-16 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <div key={t.id} className="rounded-2xl p-6 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s`, background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isFlat ? "none" : "0 4px 15px -3px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-3 mb-3">
                {renderAvatar(t)}
                <div>
                  <p className="text-sm font-semibold" style={{ color: textColor }}>{t.name}</p>
                  {renderStars(t.rating)}
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{lt(t.review)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   ABOUT
   ═══════════════════════════════════════════════════════════════════ */
const AboutSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { lang, lt } = useLanguage();
  const ts = getThemeStyles(theme);
  let contentText = config.content;
  try { const p = JSON.parse(config.content); contentText = p[lang] || p.fr || config.content; } catch {}

  const bgColor = ts.isDark ? ts.heroBg : `hsl(${theme.background_color})`;
  const textColor = ts.isDark ? "#fff" : ts.heroText;
  const mutedColor = ts.heroMuted;

  return (
    <section id="about" className="py-16 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
        </div>
        <div className="max-w-3xl mx-auto"><p className="text-sm leading-relaxed text-center" style={{ color: mutedColor }}>{contentText}</p></div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   FAQ — unique per theme
   ═══════════════════════════════════════════════════════════════════ */
const FAQSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { lt, lang } = useLanguage();
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;
  const isFlat = theme.flat_design;
  let faqs: { q: any; a: any }[] = [];
  try { faqs = JSON.parse(config.content); } catch {}

  const baseBackground = `hsl(${theme.background_color})`;
  const bgColor = ts.isDark ? ts.sectionAlt : shiftColor(baseBackground, lp === "eco" ? -0.04 : lp === "classic" ? -0.03 : -0.015);
  const textColor = ts.isDark ? "#fff" : ts.heroText;
  const mutedColor = ts.heroMuted;

  const getQ = (faq: any) => typeof faq.q === "object" ? (faq.q[lang] || faq.q.fr) : faq.q;
  const getA = (faq: any) => typeof faq.a === "object" ? (faq.a[lang] || faq.a.fr) : faq.a;

  // ── SPORTY: Numbered FAQ with bold styling ──
  if (lp === "sporty") {
    return (
      <section id="faq" className="py-20 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-10" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
          <div className="space-y-0 divide-y divide-white/5">
            {faqs.map((faq, i) => (
              <Accordion type="single" collapsible key={i}>
                <AccordionItem value={`faq-${i}`} className="border-none py-1">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-5 text-white gap-4">
                    <span className="flex items-center gap-4">
                      <span className="text-2xl font-black" style={{ color: ts.primaryHSL, opacity: 0.4 }}>0{i + 1}</span>
                      {getQ(faq)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm pb-5 pl-14 text-white/50">{getA(faq)}</AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── NEON: Glowing accordion items ──
  if (lp === "neon") {
    return (
      <section id="faq" className="py-16 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl px-5 border animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s`, background: ts.cardBg, borderColor: "rgba(255,255,255,0.06)", boxShadow: `0 0 20px hsl(${theme.primary_color} / 0.03)` }}>
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-4 text-white">{getQ(faq)}</AccordionTrigger>
                <AccordionContent className="text-sm pb-4 text-white/50">{getA(faq)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    );
  }

  // ── CLASSIC: Two-column FAQ with sidebar title ──
  if (lp === "classic") {
    return (
      <section id="faq" className="py-20 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="w-10 h-1 mb-4" style={{ background: ts.primaryHSL }} />
              <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
              <p className="mt-3 text-sm" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
            </div>
            <div className="lg:col-span-8">
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl px-5 border-none animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s`, background: ts.cardBg }}>
                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-4" style={{ color: textColor }}>{getQ(faq)}</AccordionTrigger>
                    <AccordionContent className="text-sm pb-4" style={{ color: mutedColor }}>{getA(faq)}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── SUNSET: Cards instead of accordion ──
  if (lp === "sunset") {
    return (
      <section id="faq" className="py-20 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-10 animate-fade-in">
            <div className="w-12 h-[2px]" style={{ background: ts.primaryHSL }} />
            <h2 className="text-2xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl p-6 border animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s`, background: ts.cardBg, borderColor: "hsl(20 20% 92%)", boxShadow: isFlat ? "none" : "0 4px 15px -5px rgba(0,0,0,0.05)" }}>
                <h3 className="font-bold text-sm mb-3 flex items-start gap-2" style={{ color: textColor }}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ background: `hsl(${theme.primary_color} / 0.1)`, color: ts.primaryHSL }}>{i + 1}</span>
                  {getQ(faq)}
                </h3>
                <p className="text-sm leading-relaxed pl-8" style={{ color: mutedColor }}>{getA(faq)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── ARCTIC: Clean minimal with subtle dividers ──
  if (lp === "arctic") {
    return (
      <section id="faq" className="py-16 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
          </div>
          <div className="divide-y" style={{ borderColor: "hsl(210 40% 94%)" }}>
            {faqs.map((faq, i) => (
              <Accordion type="single" collapsible key={i}>
                <AccordionItem value={`faq-${i}`} className="border-none">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-5" style={{ color: textColor }}>{getQ(faq)}</AccordionTrigger>
                  <AccordionContent className="text-sm pb-5" style={{ color: mutedColor }}>{getA(faq)}</AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── DESERT: Warm accordion with icons ──
  if (lp === "desert") {
    return (
      <section id="faq" className="py-20 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
            <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-2xl px-6 border-none animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s`, background: ts.cardBg, boxShadow: isFlat ? "none" : "0 2px 10px -3px rgba(0,0,0,0.06)" }}>
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-5" style={{ color: textColor }}>{getQ(faq)}</AccordionTrigger>
                <AccordionContent className="text-sm pb-5" style={{ color: mutedColor }}>{getA(faq)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    );
  }

  // ── Default (elegant, eco) ──
  const itemBg = ts.isDark ? ts.cardBg : "#f8fafc";
  return (
    <section id="faq" className="py-16 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl px-5 border-none animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, background: itemBg }}>
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-4" style={{ color: textColor }}>{getQ(faq)}</AccordionTrigger>
              <AccordionContent className="text-sm pb-4" style={{ color: mutedColor }}>{getA(faq)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CTA — unique per theme
   ═══════════════════════════════════════════════════════════════════ */
const CTASection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { contact } = useAdmin();
  const { lt, t } = useLanguage();
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;

  let primaryLabel = t("whatsapp_cta");
  let secondaryLabel = t("call_now");
  try {
    const parsed = JSON.parse(config.content);
    if (parsed.primary_label) primaryLabel = lt(parsed.primary_label);
    if (parsed.secondary_label) secondaryLabel = lt(parsed.secondary_label);
  } catch {}

  // ── SPORTY: Full-bleed with diagonal ──
  if (lp === "sporty") {
    return (
      <section className="relative py-24 px-5 overflow-hidden" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(${theme.primary_color} / 0.15), transparent 60%)` }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
          <p className="text-white/50 mb-8 whitespace-pre-line">{lt(config.subtitle)}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-10 py-4 font-bold text-sm text-white btn-animated"
              style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
              <MessageCircle size={18} /> {primaryLabel}
            </a>
            <a href={`tel:${contact.phone}`}
              className="flex items-center gap-2 px-10 py-4 font-bold text-sm text-white border border-white/20 btn-animated hover:bg-white/5"
              style={{ borderRadius: btnRadius(theme.button_style) }}>
              <Phone size={16} /> {secondaryLabel}
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── NEON: Glowing CTA with border ──
  if (lp === "neon") {
    return (
      <section className="py-20 px-5" style={{ background: ts.heroBg, fontFamily: theme.font_family }}>
        <div className="max-w-2xl mx-auto rounded-3xl p-12 text-center border animate-fade-in"
          style={{ borderColor: `hsl(${theme.primary_color} / 0.2)`, background: ts.cardBg, boxShadow: `0 0 80px hsl(${theme.primary_color} / 0.1)` }}>
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
          <p className="text-white/50 mb-8 whitespace-pre-line">{lt(config.subtitle)}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 font-bold text-sm text-white btn-animated"
              style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style), boxShadow: `0 0 30px hsl(${theme.primary_color} / 0.3)` }}>
              <MessageCircle size={16} /> {primaryLabel}
            </a>
            <a href={`tel:${contact.phone}`}
              className="flex items-center gap-2 px-8 py-3.5 font-bold text-sm text-white border border-white/10 btn-animated hover:bg-white/5"
              style={{ borderRadius: btnRadius(theme.button_style) }}>
              <Phone size={16} /> {secondaryLabel}
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── SUNSET: Split CTA with image area ──
  if (lp === "sunset") {
    return (
      <section className="py-0" style={{ fontFamily: theme.font_family }}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-12 lg:p-20 flex flex-col justify-center" style={{ background: ts.primaryHSL }}>
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
            <p className="text-white/70 mb-8 whitespace-pre-line">{lt(config.subtitle)}</p>
            <div className="flex gap-3 flex-wrap">
              <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-3.5 font-bold text-sm bg-white btn-animated"
                style={{ color: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
                <MessageCircle size={16} /> {primaryLabel}
              </a>
              <a href={`tel:${contact.phone}`}
                className="flex items-center gap-2 px-8 py-3.5 font-bold text-sm text-white border-2 border-white/30 btn-animated hover:bg-white/10"
                style={{ borderRadius: btnRadius(theme.button_style) }}>
                <Phone size={16} /> {secondaryLabel}
              </a>
            </div>
          </div>
          <div className="h-64 lg:h-auto" style={{ background: `linear-gradient(135deg, hsl(${theme.accent_color} / 0.3), hsl(${theme.primary_color} / 0.2))` }} />
        </div>
      </section>
    );
  }

  // ── ARCTIC: Minimal floating CTA card ──
  if (lp === "arctic") {
    return (
      <section className="py-16 px-5" style={{ background: ts.sectionAlt, fontFamily: theme.font_family }}>
        <div className="max-w-lg mx-auto rounded-3xl p-10 text-center border animate-fade-in"
          style={{ background: ts.cardBg, borderColor: "hsl(210 40% 94%)", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.06)" }}>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: theme.heading_font, color: ts.heroText }}>{lt(config.title)}</h2>
          <p className="text-sm mb-8 whitespace-pre-line" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
          <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 font-bold text-sm text-white btn-animated"
            style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
            <MessageCircle size={16} /> {primaryLabel}
          </a>
          <a href={`tel:${contact.phone}`} className="flex items-center justify-center gap-2 w-full py-3 mt-2 font-semibold text-sm btn-animated"
            style={{ color: ts.primaryHSL }}>
            <Phone size={14} /> {secondaryLabel}
          </a>
        </div>
      </section>
    );
  }

  // ── DESERT: Warm full-width with accent ──
  if (lp === "desert") {
    return (
      <section className="py-20 px-5" style={{ background: `hsl(${theme.primary_color} / 0.08)`, fontFamily: theme.font_family }}>
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `hsl(${theme.primary_color} / 0.15)`, color: ts.primaryHSL }}>
            <MessageCircle size={24} />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: theme.heading_font, color: ts.heroText }}>{lt(config.title)}</h2>
          <p className="mb-8 whitespace-pre-line" style={{ color: ts.heroMuted }}>{lt(config.subtitle)}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-10 py-4 font-bold text-sm text-white btn-animated"
              style={{ background: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
              <MessageCircle size={16} /> {primaryLabel}
            </a>
            <a href={`tel:${contact.phone}`}
              className="flex items-center gap-2 px-10 py-4 font-bold text-sm border-2 btn-animated hover:scale-105"
              style={{ borderColor: ts.primaryHSL, color: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
              <Phone size={16} /> {secondaryLabel}
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── Default (elegant, eco, classic) ──
  return (
    <section className="py-20 px-5" style={{ background: ts.primaryHSL, fontFamily: theme.font_family }}>
      <div className="max-w-2xl mx-auto text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-white" style={{ fontFamily: theme.heading_font }}>{lt(config.title)}</h2>
        <p className="mt-3 text-white/80 whitespace-pre-line">{lt(config.subtitle)}</p>
        <div className="flex gap-3 justify-center flex-wrap mt-8">
          <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3.5 font-semibold text-sm bg-white rounded-xl btn-animated"
            style={{ color: ts.primaryHSL, borderRadius: btnRadius(theme.button_style) }}>
            <MessageCircle size={16} /> {primaryLabel}
          </a>
          <a href={`tel:${contact.phone}`}
            className="flex items-center gap-2 px-8 py-3.5 font-semibold text-sm text-white border-2 border-white/30 rounded-xl btn-animated hover:bg-white/10"
            style={{ borderRadius: btnRadius(theme.button_style) }}>
            <Phone size={16} /> {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   FOOTER — unique per theme
   ═══════════════════════════════════════════════════════════════════ */
const FooterSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { siteConfig, contact, navItems } = useAdmin();
  const { lt, t } = useLanguage();
  const menuNav = navItems.filter(n => n.enabled && n.show_in_menu);
  const siteName = siteConfig.logo_text?.trim() || theme.site_name?.trim() || "Website";
  const footerCopyright = useMemo(() => {
    const raw = (siteConfig.copyright || "").trim();
    const defaultCopyright = `© ${new Date().getFullYear()} ${siteName}`;
    if (!raw) return defaultCopyright;
    return raw.replaceAll("DriveStyle Studio", siteName).replaceAll("RentFlow", siteName);
  }, [siteConfig.copyright, siteName]);
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;
  const footerText = ensureReadableAccent(`hsl(${theme.footer_text_color || theme.text_color})`, ts.footerBg, 3) || `hsl(${theme.footer_text_color || theme.text_color})`;
  const footerMuted = withAlpha(footerText, 0.72);
  const footerSubtle = withAlpha(footerText, 0.52);
  const footerFaint = withAlpha(footerText, 0.3);
  const footerBorder = withAlpha(footerText, 0.14);
  const renderFooterLogo = (imageClassName: string, textClassName: string) => {
    if (siteConfig.logo_display_mode === "image" && siteConfig.logo_image) {
      return (
        <img
          src={siteConfig.logo_image}
          alt={siteConfig.logo_text}
          className={`${imageClassName} w-auto object-contain`}
        />
      );
    }
    return (
      <span className={textClassName} style={{ fontFamily: theme.heading_font, color: footerText }}>
        <span style={{ color: ts.primaryHSL }}>{siteConfig.logo_text.charAt(0)}</span>
        {siteConfig.logo_text.slice(1)}
      </span>
    );
  };

  // ── SPORTY: Minimal dark footer ──
  if (lp === "sporty") {
    return (
      <footer id="footer" className="py-8 px-5" style={{ background: ts.footerBg, color: footerText, fontFamily: theme.font_family, borderTop: `1px solid ${footerBorder}` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {renderFooterLogo("h-16 sm:h-20 max-w-[340px]", "text-lg sm:text-xl font-bold")}
          <div className="flex gap-4">
            {menuNav.map(n => <a key={n.id} href={n.href} className="text-xs transition-colors" style={{ color: footerSubtle }}>{lt(n.label)}</a>)}
          </div>
          <div className="flex gap-3">
            {contact.social_links.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: footerSubtle }}>
                <DynIcon name={s.icon} size={16} />
              </a>
            ))}
          </div>
        </div>
        <p className="text-center text-[10px] mt-6" style={{ color: footerFaint }}>{footerCopyright}</p>
      </footer>
    );
  }

  // ── SUNSET: Editorial footer ──
  if (lp === "sunset") {
    return (
      <footer id="footer" className="py-16 px-5" style={{ background: ts.footerBg, color: footerText, fontFamily: theme.font_family }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            <div>
              <div className="mb-3">{renderFooterLogo("h-16 sm:h-20 max-w-[360px]", "text-2xl sm:text-3xl font-bold")}</div>
              <p className="text-sm max-w-sm" style={{ color: footerSubtle }}>{lt(siteConfig.logo_tagline)}</p>
              <div className="flex gap-3 mt-6">
                {contact.social_links.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ background: withAlpha(footerText, 0.08), color: footerSubtle }}>
                    <DynIcon name={s.icon} size={16} />
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs uppercase tracking-wider mb-4" style={{ color: footerFaint }}>{t("quick_links")}</h4>
                <div className="space-y-2">
                  {menuNav.map(n => <a key={n.id} href={n.href} className="block text-sm transition-colors" style={{ color: footerMuted }}>{lt(n.label)}</a>)}
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider mb-4" style={{ color: footerFaint }}>{t("contact_us")}</h4>
                <div className="space-y-2 text-sm" style={{ color: footerMuted }}>
                  <p className="flex items-center gap-2"><Phone size={14} /> {contact.phone}</p>
                  <p className="flex items-center gap-2"><Mail size={14} /> {contact.email}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t pt-6" style={{ borderColor: footerBorder }}>
            <p className="text-xs text-center" style={{ color: footerFaint }}>{footerCopyright} · {t("all_rights_reserved")}</p>
          </div>
        </div>
      </footer>
    );
  }

  // ── ARCTIC: Clean minimal footer ──
  if (lp === "arctic") {
    return (
      <footer id="footer" className="py-12 px-5" style={{ background: ts.footerBg, color: footerText, fontFamily: theme.font_family }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-2 flex justify-center">{renderFooterLogo("h-16 sm:h-20 max-w-[340px]", "text-lg sm:text-xl font-bold")}</div>
          <p className="text-xs mb-6" style={{ color: footerFaint }}>{lt(siteConfig.logo_tagline)}</p>
          <div className="flex gap-4 justify-center flex-wrap mb-6">
            {menuNav.map(n => <a key={n.id} href={n.href} className="text-xs transition-colors" style={{ color: footerSubtle }}>{lt(n.label)}</a>)}
          </div>
          <div className="flex gap-3 justify-center mb-6">
            {contact.social_links.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: footerSubtle }}>
                <DynIcon name={s.icon} size={16} />
              </a>
            ))}
          </div>
          <p className="text-[10px]" style={{ color: footerFaint }}>{footerCopyright} · {t("all_rights_reserved")}</p>
        </div>
      </footer>
    );
  }

  // ── Default (elegant, eco, classic, neon, desert) ──
  return (
    <footer id="footer" className="py-12 px-5" style={{ background: ts.footerBg, color: footerText, fontFamily: theme.font_family }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
          <div className="mb-2">{renderFooterLogo("h-16 sm:h-20 max-w-[340px]", "text-lg sm:text-xl font-bold")}</div>
            <p className="text-xs" style={{ color: footerSubtle }}>{lt(siteConfig.logo_tagline)}</p>
            <div className="flex gap-2 mt-4">
              {contact.social_links.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: withAlpha(footerText, 0.08), color: footerSubtle }}>
                  <DynIcon name={s.icon} size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: footerSubtle }}>{t("quick_links")}</h4>
            <div className="space-y-2">
              {menuNav.map(n => <a key={n.id} href={n.href} className="block text-sm transition-colors" style={{ color: footerSubtle }}>{lt(n.label)}</a>)}
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: footerSubtle }}>{t("contact_us")}</h4>
            <div className="space-y-2 text-sm" style={{ color: footerSubtle }}>
              <p className="flex items-center gap-2"><Phone size={14} /> {contact.phone}</p>
              <p className="flex items-center gap-2"><Mail size={14} /> {contact.email}</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> {lt(contact.address)}</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: footerSubtle }}>WhatsApp</h4>
            <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl btn-animated" style={{ background: ts.primaryHSL }}>
              <MessageCircle size={16} /> {t("whatsapp_cta")}
            </a>
          </div>
        </div>
        <div className="border-t mt-8 pt-6" style={{ borderColor: footerBorder }}>
          <p className="text-xs text-center" style={{ color: footerFaint }}>{footerCopyright} · {t("all_rights_reserved")}</p>
        </div>
      </div>
    </footer>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CONTACT SECTION (with Google Maps + agencies)
   ═══════════════════════════════════════════════════════════════════ */
const ContactSection = ({ config, theme }: { config: ExtendedSectionConfig; theme: ExtendedThemeConfig }) => {
  const { contact } = useAdmin();
  const { lt, t } = useLanguage();
  const ts = getThemeStyles(theme);
  const lp = theme.landing_page_theme;
  const isFlat = theme.flat_design;
  const agencies = contact.agencies.filter(a => a.enabled);
  const [selectedAgency, setSelectedAgency] = useState(agencies[0]?.id || "");
  const activeAgency = agencies.find(a => a.id === selectedAgency) || agencies[0];

  const bgColor = ts.isDark ? ts.heroBg : ts.sectionAlt;
  const textColor = ts.isDark ? "#fff" : ts.heroText;
  const mutedColor = ts.heroMuted;
  const cardBg = ts.isDark ? ts.cardBg : "#fff";
  const cardBorder = ts.isDark ? "rgba(255,255,255,0.06)" : "hsl(220 10% 93%)";

  const mapSrc = activeAgency
    ? `https://maps.google.com/maps?q=${activeAgency.lat},${activeAgency.lng}&z=14&output=embed`
    : "";

  const getDirectionsUrl = activeAgency
    ? `https://www.google.com/maps/dir/?api=1&destination=${activeAgency.lat},${activeAgency.lng}`
    : "#";

  return (
    <section id="contact" className="py-16 px-5" style={{ background: bgColor, fontFamily: theme.font_family }}>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold" style={{ fontFamily: theme.heading_font, color: textColor }}>{lt(config.title)}</h2>
          <p className="mt-2" style={{ color: mutedColor }}>{lt(config.subtitle)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl p-6 transition-all hover:-translate-y-0.5" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(142 71% 45% / 0.1)" }}>
                  <MessageCircle size={20} style={{ color: "hsl(142 71% 45%)" }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: textColor }}>WhatsApp</h3>
                  <p className="text-xs" style={{ color: mutedColor }}>{t("response_5min")}</p>
                </div>
              </div>
              <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white rounded-xl btn-animated"
                style={{ background: "hsl(142 71% 45%)" }}>
                <MessageCircle size={16} /> {t("chat_whatsapp")}
              </a>
              <div className="mt-3 space-y-2">
                {[
                  { icon: <Clock size={13} />, text: t("response_5min") },
                  { icon: <CheckCircle2 size={13} />, text: t("human_confirm") },
                  { icon: <CreditCard size={13} />, text: t("no_online_payment") },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ color: mutedColor }}>
                    {item.icon}<span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `hsl(${theme.primary_color} / 0.1)` }}>
                  <PhoneCall size={20} style={{ color: ts.primaryHSL }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: textColor }}>{t("phone")}</h3>
                  <p className="text-xs" style={{ color: mutedColor }}>{t("open_hours")}</p>
                </div>
              </div>
              <a href={`tel:${contact.phone}`} className="text-sm font-semibold hover:underline" style={{ color: ts.primaryHSL }}>
                {contact.phone}
              </a>
            </div>

            <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `hsl(${theme.accent_color} / 0.1)` }}>
                  <MapPin size={20} style={{ color: `hsl(${theme.accent_color})` }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: textColor }}>{t("our_agencies")}</h3>
                  <p className="text-xs" style={{ color: mutedColor }}>{lt(contact.address)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {agencies.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {agencies.map(agency => (
                  <button key={agency.id} onClick={() => setSelectedAgency(agency.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border btn-animated"
                    style={{
                      background: selectedAgency === agency.id ? ts.primaryHSL : "transparent",
                      color: selectedAgency === agency.id ? "#fff" : mutedColor,
                      borderColor: selectedAgency === agency.id ? ts.primaryHSL : cardBorder,
                    }}>
                    <MapPin size={12} className="inline mr-1" />
                    {lt(agency.name)}
                  </button>
                ))}
              </div>
            )}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${cardBorder}`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.06)" }}>
              {mapSrc ? (
                <iframe src={mapSrc} width="100%" height="350" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={activeAgency ? lt(activeAgency.name) : "Map"} />
              ) : (
                <div className="h-[350px] flex items-center justify-center" style={{ background: cardBg }}>
                  <p style={{ color: mutedColor }}>Carte non disponible</p>
                </div>
              )}
            </div>
            {activeAgency && (
              <div className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: isFlat ? "none" : "0 4px 20px -5px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `hsl(${theme.accent_color} / 0.1)` }}>
                    <MapPin size={20} style={{ color: `hsl(${theme.accent_color})` }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: textColor }}>{lt(activeAgency.name)}</h4>
                    <p className="text-xs" style={{ color: mutedColor }}>{lt(activeAgency.address)}</p>
                  </div>
                </div>
                <a href={getDirectionsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-white rounded-xl btn-animated shrink-0"
                  style={{ background: ts.isDark ? "#fff" : "#1e293b", color: ts.isDark ? "#000" : "#fff" }}>
                  <Navigation size={14} /> {t("get_directions")}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8 pt-6" style={{ borderTop: `1px solid ${cardBorder}` }}>
          <p className="text-xs" style={{ color: mutedColor }}>{t("call_directly")}</p>
          <a href={`tel:${contact.phone}`} className="flex items-center justify-center gap-2 mt-2 text-lg font-bold" style={{ color: textColor }}>
            <Phone size={18} /> {contact.phone}
          </a>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   WHATSAPP FLOATING BUTTON
   ═══════════════════════════════════════════════════════════════════ */
const WhatsAppButton = ({ theme }: { theme: ExtendedThemeConfig }) => {
  const { contact } = useAdmin();
  const { isRTL } = useLanguage();
  const ts = getThemeStyles(theme);

  return (
    <a href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, "")}`} target="_blank" rel="noopener noreferrer"
      className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 animate-fade-in`}
      style={{ background: ts.primaryHSL }} aria-label="WhatsApp">
      <MessageCircle className="text-white" size={24} />
    </a>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SECTION MAP & MAIN
   ═══════════════════════════════════════════════════════════════════ */
const sectionMap: Record<string, React.FC<any>> = {
  hero: HeroSection,
  cars: CarsSection,
  features: FeaturesSection,
  cities: CitiesSection,
  testimonials: TestimonialsSection,
  estimation: EstimationSection,
  about: AboutSection,
  faq: FAQSection,
  cta: CTASection,
  contact: ContactSection,
  footer: FooterSection,
};

const FrontendBootLoader = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="h-10 w-36 animate-pulse rounded-md bg-muted" />
      <div className="mt-10 space-y-4">
        <div className="h-7 w-72 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  </div>
);

const DynamicFrontend = () => {
  const pathname = usePathname();
  const { sections, theme, cars, seo, stateReady, customThemes } = useAdmin();
  const [bootTimeoutReached, setBootTimeoutReached] = useState(false);
  const isPreviewRoute = pathname.startsWith("/preview/");
  const previewTheme = useMemo(() => {
    if (!isPreviewRoute) return null;

    const slug = pathname.split("/").filter(Boolean)[1] || "";
    const presetKeys = Object.keys(landingPageThemePresets) as LandingPageTheme[];

    const fromIndex = slug.match(/^theme-(\d+)$/i);
    let presetKey: LandingPageTheme | undefined;

    if (fromIndex) {
      const index = Number(fromIndex[1]) - 1;
      if (Number.isFinite(index) && index >= 0 && index < presetKeys.length) {
        presetKey = presetKeys[index];
      }
    } else if ((presetKeys as string[]).includes(slug)) {
      presetKey = slug as LandingPageTheme;
    }

    if (presetKey) {
      const preset = landingPageThemePresets[presetKey];
      return {
        ...initialExtendedTheme,
        ...preset.overrides,
        landing_page_theme: presetKey,
        footer_background_color: preset.overrides.footer_background_color ?? preset.overrides.secondary_color ?? initialExtendedTheme.footer_background_color,
        footer_text_color: preset.overrides.footer_text_color ?? preset.overrides.text_color ?? initialExtendedTheme.footer_text_color,
      } as ExtendedThemeConfig;
    }

    const customTheme = customThemes.find((t) => t.id === slug);
    if (!customTheme) return null;

    return {
      ...initialExtendedTheme,
      ...customTheme.overrides,
      landing_page_theme: customTheme.id,
      footer_background_color: customTheme.overrides.footer_background_color ?? customTheme.overrides.secondary_color ?? initialExtendedTheme.footer_background_color,
      footer_text_color: customTheme.overrides.footer_text_color ?? customTheme.overrides.text_color ?? initialExtendedTheme.footer_text_color,
    } as ExtendedThemeConfig;
  }, [pathname, customThemes, isPreviewRoute]);
  const effectiveTheme = previewTheme ?? theme;
  const { lt, lang, isRTL } = useLanguage();
  const ts = getThemeStyles(effectiveTheme);
  const rootBg = `hsl(${effectiveTheme.background_color})`;
  const rootText = ensureReadableAccent(`hsl(${effectiveTheme.text_color})`, rootBg, 4.5) || ts.heroText;
  const enabled = [...sections].filter(s => s.enabled).sort((a, b) => a.order - b.order);
  const shouldRenderContent = stateReady || isPreviewRoute || bootTimeoutReached;

  useEffect(() => {
    if (stateReady || isPreviewRoute) {
      setBootTimeoutReached(false);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setBootTimeoutReached(true);
    }, 8000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [stateReady, isPreviewRoute]);

  useEffect(() => {
    if (!shouldRenderContent) return;
    document.title = lt(seo.title);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", lt(seo.description));
  }, [seo, lang, lt, shouldRenderContent]);

  useEffect(() => {
    if (!shouldRenderContent) return;
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const prevHtmlBg = htmlEl.style.backgroundColor;
    const prevBodyBg = bodyEl.style.backgroundColor;
    const prevBodyColor = bodyEl.style.color;
    const prevThemeBgVar = htmlEl.style.getPropertyValue("--background");
    const prevThemeFgVar = htmlEl.style.getPropertyValue("--foreground");

    htmlEl.style.setProperty("--background", effectiveTheme.background_color);
    htmlEl.style.setProperty("--foreground", effectiveTheme.text_color);
    htmlEl.style.backgroundColor = rootBg;
    bodyEl.style.backgroundColor = rootBg;
    bodyEl.style.color = rootText;

    return () => {
      htmlEl.style.setProperty("--background", prevThemeBgVar);
      htmlEl.style.setProperty("--foreground", prevThemeFgVar);
      htmlEl.style.backgroundColor = prevHtmlBg;
      bodyEl.style.backgroundColor = prevBodyBg;
      bodyEl.style.color = prevBodyColor;
    };
  }, [effectiveTheme.background_color, effectiveTheme.text_color, rootBg, rootText, shouldRenderContent]);

  if (!shouldRenderContent) {
    return <FrontendBootLoader />;
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: effectiveTheme.font_family, background: rootBg, color: rootText }} dir={isRTL ? "rtl" : "ltr"}>
      <FrontendHeader theme={effectiveTheme} />
      {enabled.map(section => {
        const Component = sectionMap[section.type];
        if (!Component) return null;
        return <Component key={section.id} config={section} theme={effectiveTheme} cars={cars} />;
      })}
      <WhatsAppButton theme={effectiveTheme} />
    </div>
  );
};

export default DynamicFrontend;
