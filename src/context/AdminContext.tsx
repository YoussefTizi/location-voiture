import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  Car, Booking, DashboardStats,
} from "@/data/mock-database";
import {
  ExtendedThemeConfig, ExtendedSectionConfig, NavItem, City, Testimonial,
  Feature, ContactConfig, SEOConfig, SiteConfig, EstimationConfig, BookingFormConfig,
  Agency, CustomThemePreset,
  initialExtendedTheme, initialExtendedSections, initialNavItems,
  initialCities, initialTestimonials, initialFeatures,
  initialContact, initialSEO, initialSiteConfig, initialEstimationConfig, initialBookingFormConfig,
} from "@/data/site-config";

interface AdminContextType {
  cars: Car[];
  bookings: Booking[];
  stats: DashboardStats;
  addCar: (car: Omit<Car, "id">) => Promise<{ ok: boolean; error?: string }>;
  updateCar: (id: string, data: Partial<Car>) => Promise<{ ok: boolean; error?: string }>;
  deleteCar: (id: string) => Promise<{ ok: boolean; error?: string }>;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<Booking | null>;
  deleteBooking: (id: string) => Promise<boolean>;
  createBooking: (data: {
    customer_name: string;
    phone: string;
    email: string;
    pickup_date: string;
    return_date: string;
    car_id: string;
  }) => Promise<Booking | null>;

  theme: ExtendedThemeConfig;
  sections: ExtendedSectionConfig[];
  updateTheme: (data: Partial<ExtendedThemeConfig>) => void;
  updateSection: (id: string, data: Partial<ExtendedSectionConfig>) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  siteConfig: SiteConfig;
  updateSiteConfig: (data: Partial<SiteConfig>) => void;

  navItems: NavItem[];
  updateNavItem: (id: string, data: Partial<NavItem>) => void;

  cities: City[];
  addCity: (city: City) => void;
  updateCity: (id: string, data: Partial<City>) => void;
  deleteCity: (id: string) => void;

  testimonials: Testimonial[];
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  addTestimonial: (t: Testimonial) => void;
  deleteTestimonial: (id: string) => void;

  features: Feature[];
  addFeature: (f: Feature) => void;
  updateFeature: (id: string, data: Partial<Feature>) => void;
  deleteFeature: (id: string) => void;

  contact: ContactConfig;
  updateContact: (data: Partial<ContactConfig>) => void;

  addAgency: (agency: Agency) => void;
  updateAgency: (id: string, data: Partial<Agency>) => void;
  deleteAgency: (id: string) => void;

  seo: SEOConfig;
  updateSEO: (data: Partial<SEOConfig>) => void;

  estimation: EstimationConfig;
  updateEstimation: (data: Partial<EstimationConfig>) => void;

  bookingForm: BookingFormConfig;
  updateBookingForm: (data: Partial<BookingFormConfig>) => void;

  customThemes: CustomThemePreset[];
  addCustomTheme: (t: CustomThemePreset) => void;
  deleteCustomTheme: (id: string) => void;

  adminDarkMode: boolean;
  setAdminDarkMode: (v: boolean) => void;
  stateReady: boolean;
  stateError: string | null;

  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);
const STATE_CACHE_KEY = "drivestyle-public-state-v1";
const EMPTY_STATS: DashboardStats = {
  total_revenue: 0,
  active_bookings: 0,
  fleet_size: 0,
  utilization_rate: 0,
  monthly_revenue: [],
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [theme, setTheme] = useState<ExtendedThemeConfig>(initialExtendedTheme);
  const [sections, setSections] = useState<ExtendedSectionConfig[]>(initialExtendedSections);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(initialSiteConfig);
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [cities, setCities] = useState<City[]>(initialCities);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [contact, setContact] = useState<ContactConfig>(initialContact);
  const [seo, setSEO] = useState<SEOConfig>(initialSEO);
  const [estimation, setEstimation] = useState<EstimationConfig>(initialEstimationConfig);
  const [bookingForm, setBookingForm] = useState<BookingFormConfig>(initialBookingFormConfig);
  const [customThemes, setCustomThemes] = useState<CustomThemePreset[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [stateReady, setStateReady] = useState<boolean>(false);
  const [stateError, setStateError] = useState<string | null>(null);
  const [adminDarkMode, setAdminDarkModeState] = useState<boolean>(() => {
    try { return localStorage.getItem("admin-dark-mode") === "true"; } catch { return true; }
  });
  const sectionsPersistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSectionsRef = useRef<ExtendedSectionConfig[] | null>(null);

  const applyStatePayload = useCallback((data: any) => {
    setCars(Array.isArray(data?.cars) ? data.cars : []);
    setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
    setStats(data?.stats ?? EMPTY_STATS);
    setTheme(data?.theme ?? initialExtendedTheme);
    setSections(Array.isArray(data?.sections) ? data.sections : []);
    setSiteConfig(data?.siteConfig ?? initialSiteConfig);
    setNavItems(Array.isArray(data?.navItems) ? data.navItems : []);
    setCities(Array.isArray(data?.cities) ? data.cities : []);
    setTestimonials(Array.isArray(data?.testimonials) ? data.testimonials : []);
    setFeatures(Array.isArray(data?.features) ? data.features : []);
    setContact(data?.contact ?? initialContact);
    setSEO(data?.seo ?? initialSEO);
    setEstimation(data?.estimation ?? initialEstimationConfig);
    setBookingForm(data?.bookingForm ?? initialBookingFormConfig);
    setCustomThemes(Array.isArray(data?.customThemes) ? data.customThemes : []);
  }, []);

  const readCachedPublicState = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STATE_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { payload?: unknown; cachedAt?: number };
      if (!parsed?.payload) return null;
      // Keep cache fresh for 24h to improve cold-load speed on mobile.
      const age = Date.now() - Number(parsed.cachedAt || 0);
      if (age > 24 * 60 * 60 * 1000) return null;
      return parsed.payload;
    } catch {
      return null;
    }
  }, []);

  const writeCachedPublicState = useCallback((payload: unknown) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STATE_CACHE_KEY, JSON.stringify({ cachedAt: Date.now(), payload }));
    } catch {
      // ignore storage quota / private mode errors
    }
  }, []);

  const persistPatch = useCallback(async (patch: Record<string, unknown>) => {
    const res = await fetch("/api/admin/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      const error = typeof payload?.error === "string" ? payload.error : "Failed to persist admin state";
      throw new Error(error);
    }
  }, []);

  const loadRemoteState = useCallback(async () => {
    const isAdminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
    const stateUrl = isAdminRoute ? "/api/admin/state?full=1" : "/api/admin/state";
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeout = controller
      ? window.setTimeout(() => controller.abort(), 8000)
      : null;
    try {
      const res = await fetch(stateUrl, {
        method: "GET",
        cache: isAdminRoute ? "no-store" : "force-cache",
        signal: controller?.signal,
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const error = typeof payload?.error === "string" ? payload.error : "Failed to load admin state";
        throw new Error(error);
      }
      const data = await res.json();
      applyStatePayload(data);
      if (!isAdminRoute) writeCachedPublicState(data);
      setStateError(null);
    } catch (error) {
      setStateError(error instanceof Error ? error.message : "Failed to load admin state");
    } finally {
      if (timeout) window.clearTimeout(timeout);
      setStateReady(true);
    }
  }, [applyStatePayload, writeCachedPublicState]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin")) {
      const cached = readCachedPublicState();
      if (cached) {
        applyStatePayload(cached);
        setStateReady(true);
      }
    }
    void loadRemoteState();
  }, [applyStatePayload, loadRemoteState, readCachedPublicState]);

  const syncPatch = useCallback((patch: Record<string, unknown>) => {
    void (async () => {
      try {
        await persistPatch(patch);
        setStateError(null);
      } catch (error) {
        setStateError(error instanceof Error ? error.message : "Failed to persist admin state");
        await loadRemoteState();
      }
    })();
  }, [loadRemoteState, persistPatch]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me");
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  const login = useCallback(async (user: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });
      setIsAuthenticated(res.ok);
      return res.ok;
    } catch {
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    void (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // ignore
      } finally {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  const setAdminDarkMode = useCallback((v: boolean) => {
    setAdminDarkModeState(v);
    try { localStorage.setItem("admin-dark-mode", String(v)); } catch { /* ignore storage errors */ }
  }, []);

  const addCar = useCallback(async (car: Omit<Car, "id">) => {
    try {
      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const error = typeof payload?.error === "string" ? payload.error : "Failed to create car";
        return { ok: false, error };
      }
      await loadRemoteState();
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to create car" };
    }
  }, [loadRemoteState]);

  const updateCar = useCallback(async (id: string, data: Partial<Car>) => {
    try {
      const existing = cars.find(c => c.id === id);
      const payload = { ...(existing ?? {}), ...data };
      const res = await fetch(`/api/admin/cars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const error = typeof payload?.error === "string" ? payload.error : "Failed to update car";
        return { ok: false, error };
      }
      await loadRemoteState();
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to update car" };
    }
  }, [cars, loadRemoteState]);

  const deleteCar = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const error = typeof payload?.error === "string" ? payload.error : "Failed to delete car";
        return { ok: false, error };
      }
      await loadRemoteState();
      return { ok: true };
    } catch {
      return { ok: false, error: "Failed to delete car" };
    }
  }, [loadRemoteState]);

  const updateBookingStatus = useCallback((id: string, status: Booking["status"]) => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/bookings/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update booking");
        await loadRemoteState();
      } catch {
        setStateError("Failed to update booking");
        await loadRemoteState();
      }
    })();
  }, [loadRemoteState]);

  const updateBooking = useCallback(async (id: string, data: Partial<Booking>) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      const updated = await res.json() as Booking;
      setBookings(prev => prev.map((b) => (b.booking_id === id ? updated : b)));
      void loadRemoteState();
      setStateError(null);
      return updated;
    } catch {
      setStateError("Failed to update booking");
      await loadRemoteState();
      return null;
    }
  }, [loadRemoteState]);

  const deleteBooking = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
      setBookings(prev => prev.filter((b) => b.booking_id !== id));
      void loadRemoteState();
      setStateError(null);
      return true;
    } catch {
      setStateError("Failed to delete booking");
      await loadRemoteState();
      return false;
    }
  }, [loadRemoteState]);

  const createBooking = useCallback(async (data: {
    customer_name: string;
    phone: string;
    email: string;
    pickup_date: string;
    return_date: string;
    car_id: string;
  }) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      const created = await res.json() as Booking;
      setBookings(prev => [created, ...prev.filter((b) => b.booking_id !== created.booking_id)]);
      void loadRemoteState();
      setStateError(null);
      return created;
    } catch {
      setStateError("Failed to create booking");
      await loadRemoteState();
      return null;
    }
  }, [loadRemoteState]);

  const updateTheme = useCallback((data: Partial<ExtendedThemeConfig>) => {
    setTheme(prev => {
      const next = { ...prev, ...data };
      syncPatch({ theme: next });
      return next;
    });
  }, [syncPatch]);

  const updateSection = useCallback((id: string, data: Partial<ExtendedSectionConfig>) => {
    setSections(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...data } : s);
      pendingSectionsRef.current = next;
      if (sectionsPersistTimerRef.current) clearTimeout(sectionsPersistTimerRef.current);
      sectionsPersistTimerRef.current = setTimeout(() => {
        if (pendingSectionsRef.current) syncPatch({ sections: pendingSectionsRef.current });
      }, 350);
      return next;
    });
  }, [syncPatch]);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      const next = sorted.map((s, i) => ({ ...s, order: i }));
      if (sectionsPersistTimerRef.current) clearTimeout(sectionsPersistTimerRef.current);
      pendingSectionsRef.current = null;
      syncPatch({ sections: next });
      return next;
    });
  }, [syncPatch]);

  useEffect(() => {
    return () => {
      if (sectionsPersistTimerRef.current) clearTimeout(sectionsPersistTimerRef.current);
    };
  }, []);

  const updateSiteConfig = useCallback((data: Partial<SiteConfig>) => {
    setSiteConfig(prev => {
      const next = { ...prev, ...data };
      syncPatch({ siteConfig: next });
      return next;
    });
  }, [syncPatch]);

  const updateNavItem = useCallback((id: string, data: Partial<NavItem>) => {
    setNavItems(prev => {
      const next = prev.map(n => n.id === id ? { ...n, ...data } : n);
      syncPatch({ navItems: next });
      return next;
    });
  }, [syncPatch]);

  const addCity = useCallback((city: City) => {
    setCities(prev => {
      const next = [...prev, city];
      syncPatch({ cities: next });
      return next;
    });
  }, [syncPatch]);

  const updateCity = useCallback((id: string, data: Partial<City>) => {
    setCities(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...data } : c);
      syncPatch({ cities: next });
      return next;
    });
  }, [syncPatch]);

  const deleteCity = useCallback((id: string) => {
    setCities(prev => {
      const next = prev.filter(c => c.id !== id);
      syncPatch({ cities: next });
      return next;
    });
  }, [syncPatch]);

  const updateTestimonial = useCallback((id: string, data: Partial<Testimonial>) => {
    setTestimonials(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...data } : t);
      syncPatch({ testimonials: next });
      return next;
    });
  }, [syncPatch]);

  const addTestimonial = useCallback((t: Testimonial) => {
    setTestimonials(prev => {
      const next = [...prev, t];
      syncPatch({ testimonials: next });
      return next;
    });
  }, [syncPatch]);

  const deleteTestimonial = useCallback((id: string) => {
    setTestimonials(prev => {
      const next = prev.filter(t => t.id !== id);
      syncPatch({ testimonials: next });
      return next;
    });
  }, [syncPatch]);

  const addFeature = useCallback((f: Feature) => {
    setFeatures(prev => {
      const next = [...prev, f];
      syncPatch({ features: next });
      return next;
    });
  }, [syncPatch]);

  const updateFeature = useCallback((id: string, data: Partial<Feature>) => {
    setFeatures(prev => {
      const next = prev.map(f => f.id === id ? { ...f, ...data } : f);
      syncPatch({ features: next });
      return next;
    });
  }, [syncPatch]);

  const deleteFeature = useCallback((id: string) => {
    setFeatures(prev => {
      const next = prev.filter(f => f.id !== id);
      syncPatch({ features: next });
      return next;
    });
  }, [syncPatch]);

  const updateContact = useCallback((data: Partial<ContactConfig>) => {
    setContact(prev => {
      const next = { ...prev, ...data };
      syncPatch({ contact: next });
      return next;
    });
  }, [syncPatch]);

  const addAgency = useCallback((agency: Agency) => {
    setContact(prev => {
      const next = { ...prev, agencies: [...prev.agencies, agency] };
      syncPatch({ contact: next });
      return next;
    });
  }, [syncPatch]);

  const updateAgency = useCallback((id: string, data: Partial<Agency>) => {
    setContact(prev => {
      const next = { ...prev, agencies: prev.agencies.map(a => a.id === id ? { ...a, ...data } : a) };
      syncPatch({ contact: next });
      return next;
    });
  }, [syncPatch]);

  const deleteAgency = useCallback((id: string) => {
    setContact(prev => {
      const next = { ...prev, agencies: prev.agencies.filter(a => a.id !== id) };
      syncPatch({ contact: next });
      return next;
    });
  }, [syncPatch]);

  const updateSEO = useCallback((data: Partial<SEOConfig>) => {
    setSEO(prev => {
      const next = { ...prev, ...data };
      syncPatch({ seo: next });
      return next;
    });
  }, [syncPatch]);

  const updateEstimation = useCallback((data: Partial<EstimationConfig>) => {
    setEstimation(prev => {
      const next = { ...prev, ...data };
      syncPatch({ estimation: next });
      return next;
    });
  }, [syncPatch]);

  const updateBookingForm = useCallback((data: Partial<BookingFormConfig>) => {
    setBookingForm(prev => {
      const next = { ...prev, ...data };
      syncPatch({ bookingForm: next });
      return next;
    });
  }, [syncPatch]);

  const addCustomTheme = useCallback((t: CustomThemePreset) => {
    setCustomThemes(prev => {
      const next = [...prev, t];
      syncPatch({ customThemes: next });
      return next;
    });
  }, [syncPatch]);

  const deleteCustomTheme = useCallback((id: string) => {
    setCustomThemes(prev => {
      const next = prev.filter(t => t.id !== id);
      syncPatch({ customThemes: next });
      return next;
    });
  }, [syncPatch]);

  return (
    <AdminContext.Provider value={{
      cars, bookings, stats,
      addCar, updateCar, deleteCar, updateBookingStatus, updateBooking, deleteBooking, createBooking,
      theme, sections, updateTheme, updateSection, reorderSections,
      siteConfig, updateSiteConfig,
      navItems, updateNavItem,
      cities, addCity, updateCity, deleteCity,
      testimonials, updateTestimonial, addTestimonial, deleteTestimonial,
      features, addFeature, updateFeature, deleteFeature,
      contact, updateContact, addAgency, updateAgency, deleteAgency,
      seo, updateSEO,
      estimation, updateEstimation,
      bookingForm, updateBookingForm,
      customThemes, addCustomTheme, deleteCustomTheme,
      adminDarkMode, setAdminDarkMode,
      stateReady,
      stateError,
      isAuthenticated, login, logout,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
