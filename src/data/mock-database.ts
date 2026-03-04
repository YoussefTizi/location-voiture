import { DEFAULT_SITE_NAME } from "@/data/site-config";

export interface Car {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  images: string[];
  transmission: "automatic" | "manual";
  fuel_type: "petrol" | "diesel" | "electric" | "hybrid";
  seats: number;
  availability_status: "available" | "rented" | "maintenance";
  featured: boolean;
  description: string;
}

export interface Booking {
  booking_id: string;
  customer_name: string;
  phone: string;
  email: string;
  pickup_date: string;
  return_date: string;
  car_id: string;
  status: "pending" | "confirmed" | "cancelled";
  price_per_day_snapshot: number;
  total_amount_snapshot: number;
  currency_code: string;
}

export interface SectionConfig {
  id: string;
  type: "hero" | "cars" | "about" | "testimonials" | "faq" | "cta" | "footer";
  enabled: boolean;
  title: string;
  subtitle: string;
  content: string;
  background_style: "light" | "dark" | "gradient" | "accent";
  layout_variant: "default" | "centered" | "split" | "minimal";
  order: number;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  border_radius: string;
  layout_style: "modern" | "classic" | "minimal";
  button_style: "rounded" | "sharp" | "pill";
  card_style: "elevated" | "flat" | "bordered";
  spacing_density: "compact" | "normal" | "spacious";
  site_name: string;
}

export interface DashboardStats {
  total_revenue: number;
  active_bookings: number;
  fleet_size: number;
  utilization_rate: number;
  monthly_revenue: { month: string; revenue: number }[];
}

export const initialCars: Car[] = [
  {
    id: "car-1",
    name: "Mercedes-Benz Classe C",
    category: "Sedan",
    price_per_day: 450,
    images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop"],
    transmission: "automatic",
    fuel_type: "petrol",
    seats: 5,
    availability_status: "available",
    featured: true,
    description: "Berline de luxe avec finitions premium et aide à la conduite avancée.",
  },
  {
    id: "car-2",
    name: "BMW X5",
    category: "SUV",
    price_per_day: 650,
    images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop"],
    transmission: "automatic",
    fuel_type: "diesel",
    seats: 7,
    availability_status: "available",
    featured: true,
    description: "SUV imposant alliant confort luxueux et capacité tout-terrain.",
  },
  {
    id: "car-3",
    name: "Audi A4 Avant",
    category: "Wagon",
    price_per_day: 380,
    images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop"],
    transmission: "automatic",
    fuel_type: "petrol",
    seats: 5,
    availability_status: "rented",
    featured: false,
    description: "Break polyvalent avec espace de chargement généreux et transmission intégrale.",
  },
  {
    id: "car-4",
    name: "Tesla Model 3",
    category: "Electric",
    price_per_day: 500,
    images: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop"],
    transmission: "automatic",
    fuel_type: "electric",
    seats: 5,
    availability_status: "available",
    featured: true,
    description: "Berline 100% électrique avec pilote automatique et zéro émission.",
  },
  {
    id: "car-5",
    name: "Porsche 911 Carrera",
    category: "Sports",
    price_per_day: 1200,
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop"],
    transmission: "automatic",
    fuel_type: "petrol",
    seats: 2,
    availability_status: "available",
    featured: true,
    description: "Voiture de sport iconique offrant des performances et un design intemporel.",
  },
  {
    id: "car-6",
    name: "Volkswagen Golf",
    category: "Compact",
    price_per_day: 250,
    images: ["https://images.unsplash.com/photo-1471479917193-f00955256257?w=600&h=400&fit=crop"],
    transmission: "manual",
    fuel_type: "petrol",
    seats: 5,
    availability_status: "available",
    featured: false,
    description: "Compacte fiable, parfaite pour la conduite en ville.",
  },
];

export const initialBookings: Booking[] = [
  { booking_id: "BK-001", customer_name: "Youssef Amrani", phone: "+212 6 00 11 22 33", email: "youssef@email.com", pickup_date: "2026-03-01", return_date: "2026-03-05", car_id: "car-1", status: "confirmed", price_per_day_snapshot: 450, total_amount_snapshot: 1800, currency_code: "MAD" },
  { booking_id: "BK-002", customer_name: "Sofia Martinez", phone: "+212 6 00 44 55 66", email: "sofia@email.com", pickup_date: "2026-03-03", return_date: "2026-03-10", car_id: "car-2", status: "pending", price_per_day_snapshot: 650, total_amount_snapshot: 4550, currency_code: "MAD" },
  { booking_id: "BK-003", customer_name: "Ahmed Benali", phone: "+212 6 00 77 88 99", email: "ahmed@email.com", pickup_date: "2026-02-25", return_date: "2026-03-02", car_id: "car-3", status: "confirmed", price_per_day_snapshot: 380, total_amount_snapshot: 1900, currency_code: "MAD" },
  { booking_id: "BK-004", customer_name: "Marie Dubois", phone: "+212 6 00 12 34 56", email: "marie@email.com", pickup_date: "2026-03-08", return_date: "2026-03-12", car_id: "car-5", status: "pending", price_per_day_snapshot: 1200, total_amount_snapshot: 4800, currency_code: "MAD" },
  { booking_id: "BK-005", customer_name: "Karim El Fassi", phone: "+212 6 00 65 43 21", email: "karim@email.com", pickup_date: "2026-02-20", return_date: "2026-02-23", car_id: "car-4", status: "cancelled", price_per_day_snapshot: 500, total_amount_snapshot: 1500, currency_code: "MAD" },
];

export const initialSections: SectionConfig[] = [
  { id: "sec-hero", type: "hero", enabled: true, title: "Drive Your Dream", subtitle: "Premium car rental experience tailored for you", content: "", background_style: "dark", layout_variant: "default", order: 0 },
  { id: "sec-cars", type: "cars", enabled: true, title: "Our Fleet", subtitle: "Handpicked vehicles for every journey", content: "", background_style: "light", layout_variant: "default", order: 1 },
  { id: "sec-about", type: "about", enabled: true, title: "Why Choose Us", subtitle: "Trusted by thousands", content: "", background_style: "gradient", layout_variant: "split", order: 2 },
  { id: "sec-faq", type: "faq", enabled: true, title: "Common Questions", subtitle: "Everything you need to know", content: "[]", background_style: "light", layout_variant: "default", order: 3 },
  { id: "sec-cta", type: "cta", enabled: true, title: "Ready?", subtitle: "Book your car today", content: "", background_style: "accent", layout_variant: "centered", order: 4 },
  { id: "sec-footer", type: "footer", enabled: true, title: DEFAULT_SITE_NAME, subtitle: "© 2026", content: "", background_style: "dark", layout_variant: "default", order: 5 },
];

export const initialTheme: ThemeConfig = {
  primary_color: "43 72% 58%",
  secondary_color: "220 15% 25%",
  font_family: "DM Sans",
  border_radius: "0.75rem",
  layout_style: "modern",
  button_style: "rounded",
  card_style: "elevated",
  spacing_density: "normal",
  site_name: DEFAULT_SITE_NAME,
};

export const initialStats: DashboardStats = {
  total_revenue: 48750,
  active_bookings: 12,
  fleet_size: 6,
  utilization_rate: 78,
  monthly_revenue: [
    { month: "Sep", revenue: 32000 },
    { month: "Oct", revenue: 38500 },
    { month: "Nov", revenue: 41200 },
    { month: "Dec", revenue: 52000 },
    { month: "Jan", revenue: 44800 },
    { month: "Feb", revenue: 48750 },
  ],
};
