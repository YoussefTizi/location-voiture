/* ─── Multilingual & Site Configuration ─── */

export type Language = "fr" | "en" | "ar";
export const DEFAULT_SITE_NAME = "DriveStyle Studio";

export type LocalizedText = { fr: string; en: string; ar: string };

export interface NavItem {
  id: string;
  label: LocalizedText;
  href: string;
  enabled: boolean;
  show_in_menu: boolean;
}

export interface City {
  id: string;
  name: LocalizedText;
  image: string;
  enabled: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  review: LocalizedText;
  avatar: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface Agency {
  id: string;
  name: LocalizedText;
  address: LocalizedText;
  lat: number;
  lng: number;
  phone: string;
  google_maps_url: string;
  enabled: boolean;
}

export interface ContactConfig {
  phone: string;
  whatsapp: string;
  email: string;
  address: LocalizedText;
  social_links: SocialLink[];
  agencies: Agency[];
}

export interface SEOConfig {
  title: LocalizedText;
  description: LocalizedText;
  keywords: string;
  og_image: string;
}

export interface SiteConfig {
  logo_text: string;
  logo_image: string;
  logo_display_mode: "text" | "image";
  logo_size: number;
  logo_tagline: LocalizedText;
  hero_background_image: string;
  hero_side_image: string;
  hero_side_image_mode: "image" | "car_showcase";
  copyright: string;
}

export interface PricingTier {
  id: string;
  label: LocalizedText;
  duration_label: string;
  min_days: number;
  max_days: number | null;
  discount_percent: number;
}

export interface BookingFormConfig {
  show_name: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_pickup_date: boolean;
  show_return_date: boolean;
}

export interface EstimationConfig {
  enabled: boolean;
  default_city: string;
  delivery_free_start: string;
  delivery_free_end: string;
  night_delivery_fee: number;
  currency: string;
  currency_symbol: string;
  whatsapp_message_template: string;
  pricing_tiers: PricingTier[];
  badges: { icon: string; label: LocalizedText }[];
  show_city_field: boolean;
  show_duration_field: boolean;
  show_vehicle_field: boolean;
  show_date_field: boolean;
}

export type CardStyleVariant = "minimal" | "luxury" | "glass" | "detailed" | "compact";

export type HeroBackgroundType = "solid" | "image" | "pattern";
export type HeroPatternType = "dots" | "grid" | "diagonal" | "hexagons" | "waves";

export type LandingPageTheme = "elegant" | "sporty" | "eco" | "classic" | "neon" | "sunset" | "arctic" | "desert" | string;

export interface CustomThemePreset {
  id: string;
  name: string;
  description: string;
  preview_colors: string[];
  overrides: Partial<ExtendedThemeConfig>;
  isCustom: true;
  createdAt: string;
}

export interface ExtendedThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  footer_background_color: string;
  footer_text_color: string;
  font_family: string;
  heading_font: string;
  border_radius: string;
  layout_style: "modern" | "classic" | "minimal";
  button_style: "rounded" | "sharp" | "pill";
  card_style: "elevated" | "flat" | "bordered";
  card_style_variant: CardStyleVariant;
  spacing_density: "compact" | "normal" | "spacious";
  dark_mode_enabled: boolean;
  header_style: "transparent" | "solid" | "glass";
  site_name: string;
  landing_page_theme: LandingPageTheme;
  hero_image_position: "left" | "right";
  flat_design: boolean;
  selected_currency: string;
  hero_background_image: string;
  hero_background_enabled: boolean;
  hero_background_type: HeroBackgroundType;
  hero_pattern_type: HeroPatternType;
  hero_pattern_opacity: number;
  hero_solid_color: string;
}

export interface ExtendedSectionConfig {
  id: string;
  type: "hero" | "search" | "cars" | "features" | "cities" | "testimonials" | "about" | "faq" | "cta" | "estimation" | "contact" | "footer";
  enabled: boolean;
  title: LocalizedText;
  subtitle: LocalizedText;
  content: string;
  background_style: "light" | "dark" | "gradient" | "accent";
  layout_variant: "default" | "centered" | "split" | "minimal";
  order: number;
  background_image?: string;
}

/* ─── UI Translations ─── */
export const uiTranslations: Record<string, LocalizedText> = {
  book_now: { fr: "Réserver maintenant", en: "Book Now", ar: "احجز الآن" },
  browse_fleet: { fr: "Parcourir la flotte", en: "Browse Fleet", ar: "تصفح الأسطول" },
  learn_more: { fr: "En savoir plus", en: "Learn More", ar: "اعرف المزيد" },
  view_details: { fr: "Voir détails", en: "View Details", ar: "عرض التفاصيل" },
  reserve_whatsapp: { fr: "Réserver sur WhatsApp", en: "Reserve on WhatsApp", ar: "احجز عبر واتساب" },
  search: { fr: "Rechercher", en: "Search", ar: "بحث" },
  pickup_city: { fr: "Ville de prise en charge", en: "Pick-up City", ar: "مدينة الاستلام" },
  pickup_date: { fr: "Date de prise en charge", en: "Pick-up Date", ar: "تاريخ الاستلام" },
  return_date: { fr: "Date de retour", en: "Return Date", ar: "تاريخ الإرجاع" },
  per_day: { fr: "/jour", en: "/day", ar: "/يوم" },
  seats: { fr: "places", en: "seats", ar: "مقاعد" },
  full_name: { fr: "Nom complet", en: "Full Name", ar: "الاسم الكامل" },
  email: { fr: "Email", en: "Email", ar: "البريد الإلكتروني" },
  phone: { fr: "Téléphone", en: "Phone", ar: "الهاتف" },
  confirm_booking: { fr: "Confirmer la réservation", en: "Confirm Booking", ar: "تأكيد الحجز" },
  quick_links: { fr: "Liens rapides", en: "Quick Links", ar: "روابط سريعة" },
  contact_us: { fr: "Contactez-nous", en: "Contact Us", ar: "اتصل بنا" },
  follow_us: { fr: "Suivez-nous", en: "Follow Us", ar: "تابعنا" },
  whatsapp_cta: { fr: "Réserver sur WhatsApp", en: "Reserve on WhatsApp", ar: "احجز عبر واتساب" },
  call_now: { fr: "Appeler maintenant", en: "Call Now", ar: "اتصل الآن" },
  all_rights_reserved: { fr: "Tous droits réservés", en: "All rights reserved", ar: "جميع الحقوق محفوظة" },
  category: { fr: "Catégorie", en: "Category", ar: "الفئة" },
  transmission: { fr: "Transmission", en: "Transmission", ar: "ناقل الحركة" },
  fuel: { fr: "Carburant", en: "Fuel", ar: "الوقود" },
  automatic: { fr: "Automatique", en: "Automatic", ar: "أوتوماتيك" },
  manual: { fr: "Manuelle", en: "Manual", ar: "يدوي" },
  petrol: { fr: "Essence", en: "Petrol", ar: "بنزين" },
  diesel: { fr: "Diesel", en: "Diesel", ar: "ديزل" },
  electric: { fr: "Électrique", en: "Electric", ar: "كهربائي" },
  hybrid: { fr: "Hybride", en: "Hybrid", ar: "هجين" },
  book_this_car: { fr: "Réserver ce véhicule", en: "Book This Car", ar: "احجز هذه السيارة" },
  estimate_title: { fr: "Calculez votre budget de location", en: "Estimate your rental budget", ar: "احسب ميزانية الإيجار" },
  estimate_subtitle: { fr: "Obtenez un prix instantané et confirmez sur WhatsApp", en: "Get an instant price and confirm on WhatsApp", ar: "احصل على سعر فوري وأكد عبر واتساب" },
  select_vehicle: { fr: "Sélectionner un véhicule", en: "Select a vehicle", ar: "اختر مركبة" },
  rental_duration: { fr: "Durée de location", en: "Rental duration", ar: "مدة الإيجار" },
  price_per_day: { fr: "Prix par jour", en: "Price per day", ar: "السعر لليوم" },
  total_estimated: { fr: "Total estimé", en: "Estimated total", ar: "المجموع المقدر" },
  confirm_whatsapp: { fr: "Confirmer le prix sur WhatsApp", en: "Confirm price on WhatsApp", ar: "أكد السعر على واتساب" },
  insurance_included: { fr: "Assurance incluse", en: "Insurance included", ar: "التأمين مشمول" },
  no_credit_card: { fr: "Sans carte bancaire", en: "No credit card", ar: "بدون بطاقة ائتمان" },
  free_delivery: { fr: "Livraison gratuite 8h–20h", en: "Free delivery 8am–8pm", ar: "توصيل مجاني 8ص–8م" },
  days: { fr: "jours", en: "days", ar: "أيام" },
  desired_date: { fr: "Date souhaitée", en: "Desired date", ar: "التاريخ المطلوب" },
  how_to_book: { fr: "Comment réserver en 3 étapes", en: "How to book in 3 steps", ar: "كيف تحجز في 3 خطوات" },
  step_1_title: { fr: "Choisissez votre véhicule", en: "Choose your vehicle", ar: "اختر سيارتك" },
  step_1_desc: { fr: "Parcourez notre flotte et sélectionnez le véhicule qui vous convient.", en: "Browse our fleet and select the vehicle that suits you.", ar: "تصفح أسطولنا واختر السيارة المناسبة لك." },
  step_2_title: { fr: "Obtenez une estimation", en: "Get an estimate", ar: "احصل على تقدير" },
  step_2_desc: { fr: "Calculez votre budget instantanément avec notre estimateur.", en: "Calculate your budget instantly with our estimator.", ar: "احسب ميزانيتك فوراً مع أداة التقدير." },
  step_3_title: { fr: "Confirmez sur WhatsApp", en: "Confirm on WhatsApp", ar: "أكد عبر واتساب" },
  step_3_desc: { fr: "Réservez en 5 minutes via WhatsApp. Réponse immédiate.", en: "Book in 5 minutes via WhatsApp. Immediate response.", ar: "احجز في 5 دقائق عبر واتساب. رد فوري." },
  all_categories: { fr: "Tous", en: "All", ar: "الكل" },
  our_fleet: { fr: "Notre Flotte", en: "Our Fleet", ar: "أسطولنا" },
  fleet_subtitle: { fr: "Des véhicules fiables et confortables pour chaque besoin.", en: "Reliable and comfortable vehicles for every need.", ar: "مركبات موثوقة ومريحة لكل حاجة." },
  see_all_vehicles: { fr: "Voir tous les véhicules", en: "See all vehicles", ar: "عرض جميع المركبات" },
  ready_for_adventure: { fr: "Prêt à Partir ?", en: "Ready to Go?", ar: "مستعد للانطلاق؟" },
  cta_subtitle: { fr: "Réservez votre voiture en moins de 2 minutes via WhatsApp.\nNotre équipe vous répondra immédiatement.", en: "Book your car in less than 2 minutes via WhatsApp.\nOur team will respond immediately.", ar: "احجز سيارتك في أقل من دقيقتين عبر واتساب.\nفريقنا سيرد عليك فوراً." },
  get_directions: { fr: "Obtenir l'itinéraire", en: "Get Directions", ar: "الحصول على الاتجاهات" },
  open_in_maps: { fr: "Ouvrir dans Google Maps", en: "Open in Google Maps", ar: "فتح في خرائط جوجل" },
  our_agencies: { fr: "Nos agences", en: "Our agencies", ar: "وكالاتنا" },
  whatsapp_quick: { fr: "Réponse rapide sur WhatsApp", en: "Quick reply on WhatsApp", ar: "رد سريع على واتساب" },
  calculate_rate: { fr: "Calculer mon tarif", en: "Calculate my rate", ar: "احسب سعري" },
  available: { fr: "Disponible", en: "Available", ar: "متاح" },
  on_demand: { fr: "Selon disponibilité", en: "On demand", ar: "حسب الطلب" },
  starting_from: { fr: "À partir de", en: "Starting from", ar: "ابتداءً من" },
  choose_model: { fr: "Choisir ce modèle", en: "Choose this model", ar: "اختر هذا الموديل" },
  baggage: { fr: "Bagages", en: "Baggage", ar: "أمتعة" },
  response_5min: { fr: "Réponse en 5 minutes", en: "Response in 5 minutes", ar: "رد في 5 دقائق" },
  human_confirm: { fr: "Confirmation humaine", en: "Human confirmation", ar: "تأكيد بشري" },
  no_online_payment: { fr: "Sans paiement en ligne", en: "No online payment", ar: "بدون دفع إلكتروني" },
  chat_whatsapp: { fr: "Discuter sur WhatsApp", en: "Chat on WhatsApp", ar: "تحدث على واتساب" },
  open_hours: { fr: "Ouvert 7j/7 - 24h/24", en: "Open 24/7", ar: "مفتوح 24/7" },
  call_directly: { fr: "Ou appelez-nous directement", en: "Or call us directly", ar: "أو اتصل بنا مباشرة" },
  field_required: { fr: "Ce champ est requis", en: "This field is required", ar: "هذا الحقل مطلوب" },
  invalid_email: { fr: "Email invalide", en: "Invalid email address", ar: "بريد إلكتروني غير صالح" },
  return_after_pickup: { fr: "La date de retour doit être après la date de prise en charge", en: "Return date must be after pick-up date", ar: "يجب أن يكون تاريخ الإرجاع بعد تاريخ الاستلام" },
  reservation_confirmed_title: { fr: "Réservation confirmée", en: "Reservation Confirmed", ar: "تم تأكيد الحجز" },
  reservation_confirmed_subtitle: { fr: "Merci. Vérifiez les détails puis envoyez la confirmation sur WhatsApp.", en: "Thank you. Review the details and send confirmation on WhatsApp.", ar: "شكرًا لك. راجع التفاصيل ثم أرسل التأكيد عبر واتساب." },
  send_reservation_whatsapp: { fr: "Envoyer la confirmation sur WhatsApp", en: "Send confirmation on WhatsApp", ar: "إرسال التأكيد عبر واتساب" },
  reservation_whatsapp_intro: { fr: "Bonjour, je confirme ma demande de réservation.", en: "Hello, I confirm my reservation request.", ar: "مرحبًا، أؤكد طلب الحجز الخاص بي." },
  close: { fr: "Fermer", en: "Close", ar: "إغلاق" },
  reservation_reference: { fr: "Référence", en: "Reference", ar: "المرجع" },
  reservation_form_hint: { fr: "Complétez les informations pour finaliser votre demande.", en: "Complete your details to finalize your request.", ar: "أكمل بياناتك لإتمام طلبك." },
  saving_reservation: { fr: "Enregistrement en cours...", en: "Saving reservation...", ar: "جارٍ حفظ الحجز..." },
  booking_save_failed: { fr: "Impossible d'enregistrer la réservation. Réessayez.", en: "Unable to save reservation. Please try again.", ar: "تعذر حفظ الحجز. يرجى المحاولة مرة أخرى." },
  thank_you: { fr: "Merci", en: "Thank you", ar: "شكرًا" },
};

/* ─── Initial Data ─── */

export const initialNavItems: NavItem[] = [
  { id: "nav-1", label: { fr: "Accueil", en: "Home", ar: "الرئيسية" }, href: "#hero", enabled: true, show_in_menu: true },
  { id: "nav-2", label: { fr: "Véhicules", en: "Vehicles", ar: "المركبات" }, href: "#cars", enabled: true, show_in_menu: true },
  { id: "nav-3", label: { fr: "Tarifs", en: "Pricing", ar: "التسعير" }, href: "#estimation", enabled: true, show_in_menu: true },
  { id: "nav-4", label: { fr: "Villes", en: "Cities", ar: "المدن" }, href: "#cities", enabled: true, show_in_menu: false },
  { id: "nav-5", label: { fr: "Avis", en: "Reviews", ar: "التقييمات" }, href: "#testimonials", enabled: true, show_in_menu: true },
  { id: "nav-6", label: { fr: "FAQ", en: "FAQ", ar: "الأسئلة" }, href: "#faq", enabled: true, show_in_menu: false },
  { id: "nav-7", label: { fr: "Contact", en: "Contact", ar: "اتصل بنا" }, href: "#footer", enabled: true, show_in_menu: true },
];

export const initialCities: City[] = [
  { id: "city-1", name: { fr: "Casablanca", en: "Casablanca", ar: "الدار البيضاء" }, image: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=400&h=500&fit=crop", enabled: true },
  { id: "city-2", name: { fr: "Marrakech", en: "Marrakech", ar: "مراكش" }, image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&h=500&fit=crop", enabled: true },
  { id: "city-3", name: { fr: "Rabat", en: "Rabat", ar: "الرباط" }, image: "https://images.unsplash.com/photo-1570735515793-17e41825dac7?w=400&h=500&fit=crop", enabled: true },
  { id: "city-4", name: { fr: "Tanger", en: "Tangier", ar: "طنجة" }, image: "https://images.unsplash.com/photo-1553899017-84b35e3c648d?w=400&h=500&fit=crop", enabled: true },
  { id: "city-5", name: { fr: "Agadir", en: "Agadir", ar: "أكادير" }, image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=500&fit=crop", enabled: true },
];

export const initialTestimonials: Testimonial[] = [
  { id: "t-1", name: "Youssef Amrani", rating: 5, review: { fr: "Service exceptionnel, voiture en parfait état. Je recommande vivement !", en: "Exceptional service, car in perfect condition. I highly recommend!", ar: "خدمة استثنائية، سيارة في حالة ممتازة. أنصح بشدة!" }, avatar: "" },
  { id: "t-2", name: "Sophie Laurent", rating: 5, review: { fr: "Processus de réservation très simple et prix transparents. Excellente expérience.", en: "Very simple booking process and transparent pricing. Excellent experience.", ar: "عملية حجز بسيطة جدًا وأسعار شفافة. تجربة ممتازة." }, avatar: "" },
  { id: "t-3", name: "Ahmed Benali", rating: 4, review: { fr: "Large choix de véhicules et équipe très professionnelle. Service rapide.", en: "Wide selection of vehicles and very professional team. Fast service.", ar: "مجموعة واسعة من المركبات وفريق محترف جدًا. خدمة سريعة." }, avatar: "" },
  { id: "t-4", name: "Marie Dubois", rating: 5, review: { fr: "La meilleure agence de location au Maroc. Véhicules premium et service impeccable.", en: "The best rental agency in Morocco. Premium vehicles and impeccable service.", ar: "أفضل وكالة تأجير في المغرب. سيارات فاخرة وخدمة لا تشوبها شائبة." }, avatar: "" },
];

export const initialFeatures: Feature[] = [
  { id: "f-1", icon: "Shield", title: { fr: "Assurance complète", en: "Full Insurance", ar: "تأمين شامل" }, description: { fr: "Tous nos véhicules incluent une assurance tous risques pour votre tranquillité.", en: "All our vehicles include comprehensive insurance for your peace of mind.", ar: "جميع مركباتنا تشمل تأمينًا شاملاً لراحة بالك." } },
  { id: "f-2", icon: "Zap", title: { fr: "Réservation instantanée", en: "Instant Booking", ar: "حجز فوري" }, description: { fr: "Réservez en quelques clics. Confirmation immédiate et processus simplifié.", en: "Book in a few clicks. Instant confirmation and simplified process.", ar: "احجز بنقرات قليلة. تأكيد فوري وعملية مبسطة." } },
  { id: "f-3", icon: "Headphones", title: { fr: "Assistance 24/7", en: "24/7 Support", ar: "دعم على مدار الساعة" }, description: { fr: "Notre équipe est disponible jour et nuit pour vous assister.", en: "Our team is available day and night to assist you.", ar: "فريقنا متاح ليلاً ونهارًا لمساعدتك." } },
  { id: "f-4", icon: "Gem", title: { fr: "Flotte premium", en: "Premium Fleet", ar: "أسطول فاخر" }, description: { fr: "Des véhicules récents, entretenus aux plus hauts standards.", en: "Recent vehicles, maintained to the highest standards.", ar: "مركبات حديثة بأعلى معايير الجودة." } },
];

export const initialContact: ContactConfig = {
  phone: "+212 5 22 00 00 00",
  whatsapp: "+212 6 35 08 16 48",
  email: "contact@rentflow.ma",
  address: { fr: "123 Boulevard Mohammed V, Casablanca, Maroc", en: "123 Mohammed V Boulevard, Casablanca, Morocco", ar: "123 شارع محمد الخامس، الدار البيضاء، المغرب" },
  social_links: [
    { platform: "Instagram", url: "https://instagram.com", icon: "Instagram" },
    { platform: "Facebook", url: "https://facebook.com", icon: "Facebook" },
  ],
  agencies: [
    {
      id: "agency-1",
      name: { fr: "Agence Casablanca", en: "Casablanca Agency", ar: "وكالة الدار البيضاء" },
      address: { fr: "123 Bd Mohammed V, Casablanca", en: "123 Mohammed V Blvd, Casablanca", ar: "123 شارع محمد الخامس، الدار البيضاء" },
      lat: 33.5731,
      lng: -7.5898,
      phone: "+212 5 22 00 00 00",
      google_maps_url: "https://maps.google.com/?q=33.5731,-7.5898",
      enabled: true,
    },
    {
      id: "agency-2",
      name: { fr: "Agence Marrakech", en: "Marrakech Agency", ar: "وكالة مراكش" },
      address: { fr: "45 Avenue Mohammed VI, Marrakech", en: "45 Mohammed VI Ave, Marrakech", ar: "45 شارع محمد السادس، مراكش" },
      lat: 31.6295,
      lng: -7.9811,
      phone: "+212 5 24 00 00 00",
      google_maps_url: "https://maps.google.com/?q=31.6295,-7.9811",
      enabled: true,
    },
    {
      id: "agency-3",
      name: { fr: "Agence Rabat", en: "Rabat Agency", ar: "وكالة الرباط" },
      address: { fr: "10 Avenue Hassan II, Rabat", en: "10 Hassan II Ave, Rabat", ar: "10 شارع الحسن الثاني، الرباط" },
      lat: 34.0209,
      lng: -6.8416,
      phone: "+212 5 37 00 00 00",
      google_maps_url: "https://maps.google.com/?q=34.0209,-6.8416",
      enabled: true,
    },
  ],
};

export const initialSEO: SEOConfig = {
  title: {
    fr: `${DEFAULT_SITE_NAME} — Location de voitures premium au Maroc`,
    en: `${DEFAULT_SITE_NAME} — Premium Car Rental in Morocco`,
    ar: `${DEFAULT_SITE_NAME} — تأجير سيارات فاخرة في المغرب`,
  },
  description: { fr: "Louez des voitures de luxe au Maroc. Réservation simple et rapide.", en: "Rent luxury cars in Morocco. Simple and fast booking.", ar: "استأجر سيارات فاخرة في المغرب. حجز بسيط وسريع." },
  keywords: "car rental, morocco, luxury, location voiture, maroc",
  og_image: "",
};

export const initialSiteConfig: SiteConfig = {
  logo_text: DEFAULT_SITE_NAME,
  logo_image: "",
  logo_display_mode: "text",
  logo_size: 96,
  logo_tagline: { fr: "Location premium au Maroc", en: "Premium rental in Morocco", ar: "تأجير فاخر في المغرب" },
  hero_background_image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&h=1080&fit=crop",
  hero_side_image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
  hero_side_image_mode: "image",
  copyright: `© 2026 ${DEFAULT_SITE_NAME}`,
};

export const initialBookingFormConfig: BookingFormConfig = {
  show_name: true,
  show_email: true,
  show_phone: true,
  show_pickup_date: true,
  show_return_date: true,
};

export const initialEstimationConfig: EstimationConfig = {
  enabled: true,
  default_city: "Rabat",
  delivery_free_start: "08:00",
  delivery_free_end: "20:00",
  night_delivery_fee: 200,
  currency: "MAD",
  currency_symbol: "DH",
  whatsapp_message_template: "Bonjour, je souhaite réserver :\n🚗 Véhicule : {vehicle}\n📅 Durée : {duration} jours\n💰 Prix estimé : {total} {currency}\n📍 Ville : {city}\n📆 Date souhaitée : {date}\n\nMerci de confirmer la disponibilité.",
  pricing_tiers: [
    { id: "tier-1", label: { fr: "3–7 jours", en: "3–7 days", ar: "3–7 أيام" }, duration_label: "3-7", min_days: 3, max_days: 7, discount_percent: 0 },
    { id: "tier-2", label: { fr: "8–14 jours", en: "8–14 days", ar: "8–14 أيام" }, duration_label: "8-14", min_days: 8, max_days: 14, discount_percent: 10 },
    { id: "tier-3", label: { fr: "15+ jours", en: "15+ days", ar: "+15 أيام" }, duration_label: "15+", min_days: 15, max_days: null, discount_percent: 20 },
  ],
  badges: [
    { icon: "Shield", label: { fr: "Assurance incluse", en: "Insurance included", ar: "التأمين مشمول" } },
    { icon: "CreditCard", label: { fr: "Sans carte bancaire", en: "No credit card", ar: "بدون بطاقة ائتمان" } },
    { icon: "Truck", label: { fr: "Livraison gratuite 8h–20h", en: "Free delivery 8am–8pm", ar: "توصيل مجاني 8ص–8م" } },
  ],
  show_city_field: true,
  show_duration_field: true,
  show_vehicle_field: true,
  show_date_field: true,
};

export type CurrencyOption = {
  code: string;
  symbol: string;
  label: string;
  rate_from_mad: number;
};

export const currencyOptions: CurrencyOption[] = [
  { code: "MAD", symbol: "DH", label: "MAD (DH)", rate_from_mad: 1 },
  { code: "USD", symbol: "$", label: "USD ($)", rate_from_mad: 0.1 },
  { code: "EUR", symbol: "€", label: "EUR (€)", rate_from_mad: 0.092 },
];

export const initialExtendedTheme: ExtendedThemeConfig = {
  primary_color: "142 71% 45%",
  secondary_color: "220 15% 25%",
  accent_color: "220 60% 55%",
  background_color: "0 0% 100%",
  text_color: "220 20% 10%",
  footer_background_color: "220 15% 25%",
  footer_text_color: "0 0% 100%",
  font_family: "Figtree",
  heading_font: "Figtree",
  border_radius: "0.75rem",
  layout_style: "modern",
  button_style: "rounded",
  card_style: "elevated",
  card_style_variant: "minimal",
  spacing_density: "normal",
  dark_mode_enabled: false,
  header_style: "transparent",
  site_name: DEFAULT_SITE_NAME,
  landing_page_theme: "elegant",
  hero_image_position: "right",
  flat_design: false,
  selected_currency: "MAD",
  hero_background_image: "",
  hero_background_enabled: false,
  hero_background_type: "solid",
  hero_pattern_type: "dots",
  hero_pattern_opacity: 8,
  hero_solid_color: "220 15% 96%",
};

export const initialExtendedSections: ExtendedSectionConfig[] = [
  {
    id: "sec-hero", type: "hero", enabled: true, order: 0,
    title: { fr: "Votre Voiture Idéale\nLivrée en 30 Minutes", en: "Your Perfect Car\nDelivered in 30 Minutes", ar: "سيارتك المثالية\nتُسلّم في 30 دقيقة" },
    subtitle: { fr: "Location de véhicules premium au Maroc.\nRéservation simple, livraison gratuite entre 08:00 et 20:00.", en: "Premium vehicle rental in Morocco.\nSimple booking, free delivery between 08:00 and 20:00.", ar: "تأجير مركبات فاخرة في المغرب.\nحجز بسيط، توصيل مجاني بين 08:00 و 20:00." },
    content: JSON.stringify({
      badge_text: { fr: "Location premium au Maroc", en: "Premium rental in Morocco", ar: "تأجير فاخر في المغرب" },
      primary_cta: {
        enabled: true,
        action: "whatsapp",
        label: { fr: "Réserver sur WhatsApp", en: "Reserve on WhatsApp", ar: "احجز عبر واتساب" },
      },
      secondary_cta: {
        enabled: true,
        action: "anchor",
        href: "#cars",
        label: { fr: "Parcourir la flotte", en: "Browse Fleet", ar: "تصفح الأسطول" },
      },
      show_secondary_cta: true,
      show_info_items: true,
      show_mini_estimator: true,
      show_car_strip: true,
      info_items: [
        { icon: "Shield", label: { fr: "Assurance incluse", en: "Insurance included", ar: "التأمين مشمول" } },
        { icon: "CreditCard", label: { fr: "Sans carte bancaire", en: "No credit card", ar: "بدون بطاقة ائتمان" } },
        { icon: "Truck", label: { fr: "Livraison gratuite 8h–20h", en: "Free delivery 8am–8pm", ar: "توصيل مجاني 8ص–8م" } },
      ],
      theme_overrides: {
        arctic: { show_secondary_cta: false, show_info_items: false, show_car_strip: true },
        sporty: { show_secondary_cta: true, show_info_items: true },
        neon: { show_secondary_cta: true, show_info_items: true },
        eco: { show_secondary_cta: true, show_info_items: false, show_mini_estimator: false },
        sunset: { show_secondary_cta: true, show_info_items: false, show_mini_estimator: false },
        desert: { show_secondary_cta: true, show_info_items: true, show_mini_estimator: false },
      },
    }),
    background_style: "light", layout_variant: "default",
  },
  {
    id: "sec-features", type: "features", enabled: true, order: 1,
    title: { fr: "Pourquoi Nous Choisir", en: "Why Choose Us", ar: "لماذا تختارنا" },
    subtitle: { fr: "La confiance de milliers de conducteurs à travers le Maroc", en: "Trusted by thousands of drivers across Morocco", ar: "موثوق من آلاف السائقين في المغرب" },
    content: "", background_style: "light", layout_variant: "default",
  },
  {
    id: "sec-cars", type: "cars", enabled: true, order: 2,
    title: { fr: "Notre Flotte de Véhicules", en: "Our Vehicle Fleet", ar: "أسطول مركباتنا" },
    subtitle: { fr: "Des véhicules soigneusement sélectionnés pour chaque besoin.", en: "Carefully selected vehicles for every need.", ar: "مركبات مختارة بعناية لكل حاجة." },
    content: "", background_style: "light", layout_variant: "default",
  },
  {
    id: "sec-estimation", type: "estimation", enabled: true, order: 3,
    title: { fr: "Calculez Votre Budget", en: "Estimate Your Budget", ar: "احسب ميزانيتك" },
    subtitle: { fr: "Obtenez un prix instantané et confirmez sur WhatsApp", en: "Get an instant price and confirm on WhatsApp", ar: "احصل على سعر فوري وأكد عبر واتساب" },
    content: "", background_style: "light", layout_variant: "centered",
  },
  {
    id: "sec-cities", type: "cities", enabled: true, order: 4,
    title: { fr: "Nos Villes", en: "Our Cities", ar: "مدننا" },
    subtitle: { fr: "Disponible dans les principales villes du Maroc", en: "Available in major cities across Morocco", ar: "متوفر في المدن الرئيسية في المغرب" },
    content: "", background_style: "light", layout_variant: "default",
  },
  {
    id: "sec-testimonials", type: "testimonials", enabled: true, order: 5,
    title: { fr: "Avis de Nos Clients", en: "Customer Reviews", ar: "آراء عملائنا" },
    subtitle: { fr: "Ce que disent nos clients satisfaits", en: "What our satisfied customers say", ar: "ماذا يقول عملاؤنا الراضون" },
    content: "", background_style: "light", layout_variant: "default",
  },
  {
    id: "sec-cta", type: "cta", enabled: true, order: 6,
    title: { fr: "Prêt à Prendre la Route ?", en: "Ready to Hit the Road?", ar: "مستعد للانطلاق؟" },
    subtitle: { fr: "Réservez votre voiture en moins de 2 minutes via WhatsApp.\nNotre équipe vous répondra immédiatement.", en: "Book your car in less than 2 minutes via WhatsApp.\nOur team will respond immediately.", ar: "احجز سيارتك في أقل من دقيقتين عبر واتساب.\nفريقنا سيرد عليك فوراً." },
    content: "", background_style: "accent", layout_variant: "centered",
  },
  {
    id: "sec-about", type: "about", enabled: true, order: 7,
    title: { fr: "Conditions de Location", en: "Rental Conditions", ar: "شروط الإيجار" },
    subtitle: { fr: "Des conditions claires pour une location sereine", en: "Clear conditions for a worry-free rental", ar: "شروط واضحة لإيجار بدون قلق" },
    content: JSON.stringify({
      fr: "Plus de 10 ans d'expérience. Prix transparents, assistance routière 24/7, flotte entretenue aux plus hauts standards.",
      en: "Over 10 years of experience. Transparent pricing, 24/7 roadside assistance, fleet maintained to the highest standards.",
      ar: "أكثر من 10 سنوات من الخبرة. أسعار شفافة، مساعدة على الطريق 24/7."
    }),
    background_style: "light", layout_variant: "split",
  },
  {
    id: "sec-faq", type: "faq", enabled: true, order: 8,
    title: { fr: "Questions Fréquentes", en: "Common Questions", ar: "الأسئلة الشائعة" },
    subtitle: { fr: "Tout ce que vous devez savoir", en: "Everything you need to know", ar: "كل ما تحتاج معرفته" },
    content: JSON.stringify([
      { q: { fr: "Quels documents sont nécessaires ?", en: "What documents do I need?", ar: "ما هي الوثائق المطلوبة؟" }, a: { fr: "Un permis de conduire valide et une pièce d'identité.", en: "A valid driving license and an ID card.", ar: "رخصة قيادة سارية وبطاقة هوية." } },
      { q: { fr: "L'assurance est-elle incluse ?", en: "Is insurance included?", ar: "هل التأمين مشمول؟" }, a: { fr: "Oui, l'assurance de base est incluse.", en: "Yes, basic insurance is included.", ar: "نعم، التأمين الأساسي مشمول." } },
      { q: { fr: "Quelle est la politique carburant ?", en: "What is the fuel policy?", ar: "ما هي سياسة الوقود؟" }, a: { fr: "Voitures fournies avec le plein, à rendre avec le plein.", en: "Cars provided full, return full.", ar: "السيارات مزودة بخزان ممتلئ، يجب إعادتها ممتلئة." } },
    ]),
    background_style: "light", layout_variant: "default",
  },
  {
    id: "sec-contact", type: "contact", enabled: true, order: 9,
    title: { fr: "Contactez-Nous", en: "Contact Us", ar: "اتصل بنا" },
    subtitle: { fr: "Une équipe humaine, disponible 24/7 partout au Maroc", en: "A human team, available 24/7 across Morocco", ar: "فريق بشري، متاح على مدار الساعة في جميع أنحاء المغرب" },
    content: "", background_style: "light", layout_variant: "default",
  },
  {
    id: "sec-footer", type: "footer", enabled: true, order: 10,
    title: { fr: DEFAULT_SITE_NAME, en: DEFAULT_SITE_NAME, ar: DEFAULT_SITE_NAME },
    subtitle: { fr: "", en: "", ar: "" },
    content: "", background_style: "dark", layout_variant: "default",
  },
];

/* ─── Landing Page Theme Presets ─── */
export const landingPageThemePresets: Record<LandingPageTheme, {
  name: string;
  description: string;
  preview_colors: string[];
  overrides: Partial<ExtendedThemeConfig>;
}> = {
  elegant: {
    name: "Élégant & Moderne",
    description: "Design épuré avec des tons verts et une typographie moderne",
    preview_colors: ["142 71% 45%", "220 15% 25%", "220 60% 55%"],
    overrides: {
      primary_color: "142 71% 45%",
      secondary_color: "220 15% 25%",
      accent_color: "220 60% 55%",
      background_color: "0 0% 100%",
      text_color: "220 20% 10%",
      font_family: "Figtree",
      heading_font: "Figtree",
      button_style: "rounded",
      card_style_variant: "minimal",
    },
  },
  sporty: {
    name: "Sportif & Dynamique",
    description: "Couleurs vives avec du rouge et un style audacieux",
    preview_colors: ["0 84% 60%", "220 20% 15%", "35 95% 55%"],
    overrides: {
      primary_color: "0 84% 60%",
      secondary_color: "220 20% 15%",
      accent_color: "35 95% 55%",
      background_color: "220 20% 7%",
      text_color: "0 0% 100%",
      font_family: "Outfit",
      heading_font: "Outfit",
      button_style: "sharp",
      card_style_variant: "luxury",
    },
  },
  eco: {
    name: "Éco & Nature",
    description: "Tons terreux et naturels, ambiance zen et responsable",
    preview_colors: ["160 45% 40%", "40 30% 25%", "45 70% 55%"],
    overrides: {
      primary_color: "160 45% 40%",
      secondary_color: "40 30% 25%",
      accent_color: "45 70% 55%",
      background_color: "140 25% 96%",
      text_color: "150 30% 20%",
      font_family: "DM Sans",
      heading_font: "Playfair Display",
      button_style: "pill",
      card_style_variant: "glass",
    },
  },
  classic: {
    name: "Classique & Luxe",
    description: "Bleu marine et or, un style intemporel et raffiné",
    preview_colors: ["220 50% 35%", "220 30% 15%", "43 80% 55%"],
    overrides: {
      primary_color: "220 50% 35%",
      secondary_color: "220 30% 15%",
      accent_color: "43 80% 55%",
      background_color: "40 25% 95%",
      text_color: "220 35% 16%",
      font_family: "Inter",
      heading_font: "Playfair Display",
      button_style: "rounded",
      card_style_variant: "luxury",
    },
  },
  neon: {
    name: "Néon & Cyberpunk",
    description: "Fond sombre, accents néon, ambiance futuriste et audacieuse",
    preview_colors: ["280 80% 55%", "190 100% 50%", "330 85% 60%"],
    overrides: {
      primary_color: "280 80% 55%",
      secondary_color: "220 25% 10%",
      accent_color: "190 100% 50%",
      background_color: "230 30% 8%",
      text_color: "0 0% 100%",
      font_family: "Space Grotesk",
      heading_font: "Space Grotesk",
      button_style: "sharp",
      card_style_variant: "glass",
    },
  },
  sunset: {
    name: "Sunset & Éditorial",
    description: "Tons chauds corail et abricot, mise en page éditoriale élégante",
    preview_colors: ["15 85% 55%", "35 90% 60%", "350 70% 50%"],
    overrides: {
      primary_color: "15 85% 55%",
      secondary_color: "25 30% 20%",
      accent_color: "35 90% 60%",
      background_color: "28 70% 96%",
      text_color: "20 35% 18%",
      font_family: "DM Sans",
      heading_font: "Playfair Display",
      button_style: "pill",
      card_style_variant: "luxury",
    },
  },
  arctic: {
    name: "Arctique & Cristal",
    description: "Bleus glacés, blancs purs, minimalisme épuré et aérien",
    preview_colors: ["200 80% 55%", "210 40% 90%", "180 60% 45%"],
    overrides: {
      primary_color: "200 80% 55%",
      secondary_color: "210 40% 90%",
      accent_color: "180 60% 45%",
      background_color: "205 45% 96%",
      text_color: "215 45% 20%",
      font_family: "Figtree",
      heading_font: "Figtree",
      button_style: "rounded",
      card_style_variant: "minimal",
    },
  },
  desert: {
    name: "Désert & Terracotta",
    description: "Tons sable, terracotta et ocre, ambiance organique et chaleureuse",
    preview_colors: ["20 60% 50%", "35 40% 75%", "45 50% 55%"],
    overrides: {
      primary_color: "20 60% 50%",
      secondary_color: "35 25% 20%",
      accent_color: "45 50% 55%",
      background_color: "35 45% 92%",
      text_color: "24 30% 20%",
      font_family: "DM Sans",
      heading_font: "Playfair Display",
      button_style: "rounded",
      card_style_variant: "detailed",
    },
  },
};
