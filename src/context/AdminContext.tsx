import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  Car, Booking, DashboardStats,
  initialCars, initialBookings, initialStats,
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
  addCar: (car: Car) => void;
  updateCar: (id: string, data: Partial<Car>) => void;
  deleteCar: (id: string) => void;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;

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

  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
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
  const [adminDarkMode, setAdminDarkModeState] = useState<boolean>(() => {
    try { return localStorage.getItem("admin-dark-mode") === "true"; } catch { return true; }
  });

  const persistPatch = useCallback(async (patch: Record<string, unknown>) => {
    try {
      await fetch("/api/admin/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // Keep UI responsive even if persistence is temporarily unavailable.
    }
  }, []);

  const loadRemoteState = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/state", { method: "GET" });
      if (!res.ok) return;
      const data = await res.json();

      setCars(data.cars ?? initialCars);
      setBookings(data.bookings ?? initialBookings);
      setStats(data.stats ?? initialStats);
      setTheme(data.theme ?? initialExtendedTheme);
      setSections(data.sections ?? initialExtendedSections);
      setSiteConfig(data.siteConfig ?? initialSiteConfig);
      setNavItems(data.navItems ?? initialNavItems);
      setCities(data.cities ?? initialCities);
      setTestimonials(data.testimonials ?? initialTestimonials);
      setFeatures(data.features ?? initialFeatures);
      setContact(data.contact ?? initialContact);
      setSEO(data.seo ?? initialSEO);
      setEstimation(data.estimation ?? initialEstimationConfig);
      setBookingForm(data.bookingForm ?? initialBookingFormConfig);
      setCustomThemes(data.customThemes ?? []);
      try { localStorage.setItem("admin-state-cache", JSON.stringify(data)); } catch {}
      try { localStorage.setItem("custom-themes", JSON.stringify(data.customThemes ?? [])); } catch {}
    } catch {
      try {
        const stored = localStorage.getItem("custom-themes");
        setCustomThemes(stored ? JSON.parse(stored) : []);
      } catch {
        setCustomThemes([]);
      }
    } finally {
      setStateReady(true);
    }
  }, []);

  useEffect(() => {
    void loadRemoteState();
  }, [loadRemoteState]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin-state-cache");
      if (!raw) return;
      const data = JSON.parse(raw);
      setCars(data.cars ?? initialCars);
      setBookings(data.bookings ?? initialBookings);
      setStats(data.stats ?? initialStats);
      setTheme(data.theme ?? initialExtendedTheme);
      setSections(data.sections ?? initialExtendedSections);
      setSiteConfig(data.siteConfig ?? initialSiteConfig);
      setNavItems(data.navItems ?? initialNavItems);
      setCities(data.cities ?? initialCities);
      setTestimonials(data.testimonials ?? initialTestimonials);
      setFeatures(data.features ?? initialFeatures);
      setContact(data.contact ?? initialContact);
      setSEO(data.seo ?? initialSEO);
      setEstimation(data.estimation ?? initialEstimationConfig);
      setBookingForm(data.bookingForm ?? initialBookingFormConfig);
      setCustomThemes(data.customThemes ?? []);
      setStateReady(true);
    } catch {
      // Ignore invalid cache.
    }
  }, []);

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
    try { localStorage.setItem("admin-dark-mode", String(v)); } catch {}
  }, []);

  const addCar = useCallback((car: Car) => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(car),
        });
        if (!res.ok) throw new Error("Failed to create car");
        await loadRemoteState();
      } catch {
        setCars(p => [...p, car]);
      }
    })();
  }, [loadRemoteState]);

  const updateCar = useCallback((id: string, data: Partial<Car>) => {
    void (async () => {
      try {
        const existing = cars.find(c => c.id === id);
        const payload = { ...(existing ?? {}), ...data };
        const res = await fetch(`/api/admin/cars/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update car");
        await loadRemoteState();
      } catch {
        setCars(p => p.map(c => c.id === id ? { ...c, ...data } : c));
      }
    })();
  }, [cars, loadRemoteState]);

  const deleteCar = useCallback((id: string) => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete car");
        await loadRemoteState();
      } catch {
        setCars(p => p.filter(c => c.id !== id));
      }
    })();
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
        setBookings(p => p.map(b => b.booking_id === id ? { ...b, status } : b));
      }
    })();
  }, [loadRemoteState]);

  const updateTheme = useCallback((data: Partial<ExtendedThemeConfig>) => {
    setTheme(prev => {
      const next = { ...prev, ...data };
      void persistPatch({ theme: next });
      return next;
    });
  }, [persistPatch]);

  const updateSection = useCallback((id: string, data: Partial<ExtendedSectionConfig>) => {
    setSections(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...data } : s);
      void persistPatch({ sections: next });
      return next;
    });
  }, [persistPatch]);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      const next = sorted.map((s, i) => ({ ...s, order: i }));
      void persistPatch({ sections: next });
      return next;
    });
  }, [persistPatch]);

  const updateSiteConfig = useCallback((data: Partial<SiteConfig>) => {
    setSiteConfig(prev => {
      const next = { ...prev, ...data };
      void persistPatch({ siteConfig: next });
      return next;
    });
  }, [persistPatch]);

  const updateNavItem = useCallback((id: string, data: Partial<NavItem>) => {
    setNavItems(prev => {
      const next = prev.map(n => n.id === id ? { ...n, ...data } : n);
      void persistPatch({ navItems: next });
      return next;
    });
  }, [persistPatch]);

  const addCity = useCallback((city: City) => {
    setCities(prev => {
      const next = [...prev, city];
      void persistPatch({ cities: next });
      return next;
    });
  }, [persistPatch]);

  const updateCity = useCallback((id: string, data: Partial<City>) => {
    setCities(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...data } : c);
      void persistPatch({ cities: next });
      return next;
    });
  }, [persistPatch]);

  const deleteCity = useCallback((id: string) => {
    setCities(prev => {
      const next = prev.filter(c => c.id !== id);
      void persistPatch({ cities: next });
      return next;
    });
  }, [persistPatch]);

  const updateTestimonial = useCallback((id: string, data: Partial<Testimonial>) => {
    setTestimonials(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...data } : t);
      void persistPatch({ testimonials: next });
      return next;
    });
  }, [persistPatch]);

  const addTestimonial = useCallback((t: Testimonial) => {
    setTestimonials(prev => {
      const next = [...prev, t];
      void persistPatch({ testimonials: next });
      return next;
    });
  }, [persistPatch]);

  const deleteTestimonial = useCallback((id: string) => {
    setTestimonials(prev => {
      const next = prev.filter(t => t.id !== id);
      void persistPatch({ testimonials: next });
      return next;
    });
  }, [persistPatch]);

  const addFeature = useCallback((f: Feature) => {
    setFeatures(prev => {
      const next = [...prev, f];
      void persistPatch({ features: next });
      return next;
    });
  }, [persistPatch]);

  const updateFeature = useCallback((id: string, data: Partial<Feature>) => {
    setFeatures(prev => {
      const next = prev.map(f => f.id === id ? { ...f, ...data } : f);
      void persistPatch({ features: next });
      return next;
    });
  }, [persistPatch]);

  const deleteFeature = useCallback((id: string) => {
    setFeatures(prev => {
      const next = prev.filter(f => f.id !== id);
      void persistPatch({ features: next });
      return next;
    });
  }, [persistPatch]);

  const updateContact = useCallback((data: Partial<ContactConfig>) => {
    setContact(prev => {
      const next = { ...prev, ...data };
      void persistPatch({ contact: next });
      return next;
    });
  }, [persistPatch]);

  const addAgency = useCallback((agency: Agency) => {
    setContact(prev => {
      const next = { ...prev, agencies: [...prev.agencies, agency] };
      void persistPatch({ contact: next });
      return next;
    });
  }, [persistPatch]);

  const updateAgency = useCallback((id: string, data: Partial<Agency>) => {
    setContact(prev => {
      const next = { ...prev, agencies: prev.agencies.map(a => a.id === id ? { ...a, ...data } : a) };
      void persistPatch({ contact: next });
      return next;
    });
  }, [persistPatch]);

  const deleteAgency = useCallback((id: string) => {
    setContact(prev => {
      const next = { ...prev, agencies: prev.agencies.filter(a => a.id !== id) };
      void persistPatch({ contact: next });
      return next;
    });
  }, [persistPatch]);

  const updateSEO = useCallback((data: Partial<SEOConfig>) => {
    setSEO(prev => {
      const next = { ...prev, ...data };
      void persistPatch({ seo: next });
      return next;
    });
  }, [persistPatch]);

  const updateEstimation = useCallback((data: Partial<EstimationConfig>) => {
    setEstimation(prev => {
      const next = { ...prev, ...data };
      void persistPatch({ estimation: next });
      return next;
    });
  }, [persistPatch]);

  const updateBookingForm = useCallback((data: Partial<BookingFormConfig>) => {
    setBookingForm(prev => {
      const next = { ...prev, ...data };
      void persistPatch({ bookingForm: next });
      return next;
    });
  }, [persistPatch]);

  const addCustomTheme = useCallback((t: CustomThemePreset) => {
    setCustomThemes(prev => {
      const next = [...prev, t];
      try { localStorage.setItem("custom-themes", JSON.stringify(next)); } catch {}
      void persistPatch({ customThemes: next });
      return next;
    });
  }, [persistPatch]);

  const deleteCustomTheme = useCallback((id: string) => {
    setCustomThemes(prev => {
      const next = prev.filter(t => t.id !== id);
      try { localStorage.setItem("custom-themes", JSON.stringify(next)); } catch {}
      void persistPatch({ customThemes: next });
      return next;
    });
  }, [persistPatch]);

  return (
    <AdminContext.Provider value={{
      cars, bookings, stats,
      addCar, updateCar, deleteCar, updateBookingStatus,
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
      isAuthenticated, login, logout,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
