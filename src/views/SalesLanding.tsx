"use client";

import { useState, useEffect } from "react";
import productBox from "@/assets/product-box.png";
import { Check, Globe, Smartphone, Shield, Zap, Car, Settings, BarChart3, MapPin, MessageSquare, Star, Languages, Palette, Image, ToggleLeft, CreditCard, Layout, Monitor, Search, Lock, Infinity, ChevronDown, ChevronUp, Phone, ArrowRight, Sparkles, Users, TrendingUp, Clock, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingPageThemePresets } from "@/data/site-config";
import { useAdmin } from "@/context/AdminContext";

type Lang = "fr" | "en" | "ar";

const t = (translations: Record<Lang, string>, lang: Lang) => translations[lang];

// ─── TRANSLATIONS ────────────────────────────────────────────
const copy = {
  nav: {
    features: { fr: "Fonctionnalités", en: "Features", ar: "المميزات" },
    pricing: { fr: "Tarifs", en: "Pricing", ar: "الأسعار" },
    faq: { fr: "FAQ", en: "FAQ", ar: "الأسئلة" },
    cta: { fr: "Commencer", en: "Get Started", ar: "ابدأ الآن" },
  },
  hero: {
    badge: { fr: "🚀 Solution tout-en-un pour agences de location", en: "🚀 All-in-one solution for rental agencies", ar: "🚀 حل شامل لوكالات تأجير السيارات" },
    title1: { fr: "Votre agence de location", en: "Your car rental agency", ar: "وكالة تأجير سياراتك" },
    title2: { fr: "en ligne en 24h", en: "online in 24 hours", ar: "على الإنترنت في 24 ساعة" },
    subtitle: { fr: "Un site web professionnel, un système de réservation intelligent et un panneau d'administration complet. Tout ce dont vous avez besoin pour digitaliser votre agence et doubler vos réservations.", en: "A professional website, intelligent booking system, and complete admin panel. Everything you need to digitize your agency and double your bookings.", ar: "موقع ويب احترافي، نظام حجز ذكي ولوحة تحكم كاملة. كل ما تحتاجه لرقمنة وكالتك ومضاعفة حجوزاتك." },
    cta: { fr: "Obtenir mon site maintenant", en: "Get my website now", ar: "احصل على موقعي الآن" },
    ctaSub: { fr: "Voir la démo", en: "See the demo", ar: "مشاهدة العرض" },
    price: { fr: "1199 DH", en: "1199 MAD", ar: "1199 درهم" },
    priceNote: { fr: "Domaine + Hébergement offerts", en: "Free domain + hosting included", ar: "النطاق + الاستضافة مجانًا" },
    trustedBy: { fr: "Déjà adopté par +50 agences au Maroc", en: "Already adopted by 50+ agencies in Morocco", ar: "تم اعتماده بالفعل من قبل +50 وكالة في المغرب" },
  },
  problem: {
    title: { fr: "Vous perdez des clients chaque jour", en: "You're losing clients every day", ar: "أنت تفقد عملاء كل يوم" },
    subtitle: { fr: "Sans présence en ligne professionnelle, votre agence est invisible.", en: "Without a professional online presence, your agency is invisible.", ar: "بدون حضور احترافي على الإنترنت، وكالتك غير مرئية." },
    items: [
      { fr: "Pas de site web ? Vos concurrents captent vos clients sur Google.", en: "No website? Your competitors are capturing your clients on Google.", ar: "لا يوجد موقع؟ منافسوك يستحوذون على عملائك من جوجل." },
      { fr: "Gestion manuelle des réservations = erreurs, oublis et pertes.", en: "Manual booking management = errors, missed bookings, and losses.", ar: "إدارة الحجوزات يدويًا = أخطاء ونسيان وخسائر." },
      { fr: "Aucun outil de suivi ni de visibilité sur votre activité.", en: "No tracking tools or visibility on your activity.", ar: "لا توجد أدوات تتبع أو رؤية لنشاطك." },
      { fr: "Des solutions existantes trop chères et trop compliquées.", en: "Existing solutions are too expensive and too complicated.", ar: "الحلول الحالية مكلفة للغاية ومعقدة." },
    ]
  },
  solution: {
    title: { fr: "La solution complète pour votre agence", en: "The complete solution for your agency", ar: "الحل الشامل لوكالتك" },
    subtitle: { fr: "Un système clé en main qui digitalise votre agence en 24 heures.", en: "A turnkey system that digitizes your agency in 24 hours.", ar: "نظام جاهز يرقمن وكالتك في 24 ساعة." },
    points: [
      { icon: "monitor", title: { fr: "Site professionnel", en: "Professional website", ar: "موقع احترافي" }, desc: { fr: "Un site moderne, rapide et optimisé SEO qui impressionne vos clients.", en: "A modern, fast, SEO-optimized site that impresses your clients.", ar: "موقع حديث وسريع ومحسّن لمحركات البحث يبهر عملاءك." }},
      { icon: "settings", title: { fr: "Admin tout-en-un", en: "All-in-one admin", ar: "لوحة تحكم شاملة" }, desc: { fr: "Gérez véhicules, réservations, prix et contenu depuis un seul panneau.", en: "Manage vehicles, bookings, prices and content from a single panel.", ar: "إدارة المركبات والحجوزات والأسعار والمحتوى من لوحة واحدة." }},
      { icon: "zap", title: { fr: "Mise en ligne en 24h", en: "Online in 24h", ar: "على الإنترنت في 24 ساعة" }, desc: { fr: "Aucune compétence technique requise. On s'occupe de tout.", en: "No technical skills required. We handle everything.", ar: "لا حاجة لمهارات تقنية. نحن نتكفل بكل شيء." }},
    ]
  },
  features: {
    title: { fr: "Tout est inclus. Sans exception.", en: "Everything's included. No exceptions.", ar: "كل شيء مضمّن. بدون استثناء." },
    subtitle: { fr: "+25 fonctionnalités professionnelles pour propulser votre agence.", en: "25+ professional features to propel your agency.", ar: "+25 ميزة احترافية لتعزيز وكالتك." },
  },
  demos: {
    title: { fr: "Aperçu de tous les thèmes", en: "Preview all themes", ar: "معاينة كل القوالب" },
    subtitle: {
      fr: "Choisissez un design et ouvrez sa preview avant activation.",
      en: "Pick a design and open its preview before activation.",
      ar: "اختر تصميمًا وافتح معاينته قبل التفعيل.",
    },
    preview: { fr: "Voir preview", en: "View preview", ar: "عرض المعاينة" },
  },
  pricing: {
    title: { fr: "Un investissement, pas une dépense", en: "An investment, not an expense", ar: "استثمار وليس مصروف" },
    subtitle: { fr: "Tout inclus. Pas de frais cachés. Pas d'abonnement.", en: "All included. No hidden fees. No subscription.", ar: "الكل مضمّن. بدون رسوم مخفية. بدون اشتراك." },
    price: { fr: "1199", en: "1199", ar: "1199" },
    currency: { fr: "DH", en: "MAD", ar: "درهم" },
    oneTime: { fr: "Paiement unique", en: "One-time payment", ar: "دفعة واحدة" },
    includes: [
      { fr: "Site web professionnel complet", en: "Complete professional website", ar: "موقع ويب احترافي كامل" },
      { fr: "Panneau d'administration dynamique", en: "Dynamic admin panel", ar: "لوحة تحكم ديناميكية" },
      { fr: "Nom de domaine offert", en: "Free domain name", ar: "اسم نطاق مجاني" },
      { fr: "Hébergement offert", en: "Free hosting", ar: "استضافة مجانية" },
      { fr: "Système de réservation", en: "Booking system", ar: "نظام الحجز" },
      { fr: "Support multilingue (FR/AR/EN)", en: "Multilingual support (FR/AR/EN)", ar: "دعم متعدد اللغات (FR/AR/EN)" },
      { fr: "Multi-devises (MAD, USD, EUR)", en: "Multi-currency (MAD, USD, EUR)", ar: "متعدد العملات (MAD, USD, EUR)" },
      { fr: "Responsive mobile", en: "Mobile responsive", ar: "متجاوب مع الجوال" },
      { fr: "Optimisation SEO", en: "SEO optimization", ar: "تحسين محركات البحث" },
      { fr: "Mises à jour gratuites", en: "Free updates", ar: "تحديثات مجانية" },
      { fr: "Accès à vie", en: "Lifetime access", ar: "وصول مدى الحياة" },
    ],
    cta: { fr: "Démarrer maintenant →", en: "Start now →", ar: "ابدأ الآن ←" },
    guarantee: { fr: "✅ Satisfait ou remboursé sous 7 jours", en: "✅ 7-day money-back guarantee", ar: "✅ ضمان استرداد الأموال خلال 7 أيام" },
  },
  testimonials: {
    title: { fr: "Ils nous font confiance", en: "They trust us", ar: "يثقون بنا" },
    subtitle: { fr: "Des agences qui ont transformé leur activité.", en: "Agencies that have transformed their business.", ar: "وكالات حولت أعمالها." },
    items: [
      { name: "Youssef B.", role: { fr: "Agence Atlas Cars, Marrakech", en: "Atlas Cars Agency, Marrakech", ar: "وكالة أطلس كارز، مراكش" }, text: { fr: "Depuis que j'ai mon site, je reçois 3x plus de demandes. L'investissement a été rentabilisé en 2 semaines.", en: "Since I got my website, I receive 3x more inquiries. The investment paid off in 2 weeks.", ar: "منذ حصولي على موقعي، أتلقى 3 أضعاف الطلبات. تم استرداد الاستثمار في أسبوعين." }, rating: 5 },
      { name: "Fatima Z.", role: { fr: "Location Premium, Casablanca", en: "Premium Rental, Casablanca", ar: "تأجير بريميوم، الدار البيضاء" }, text: { fr: "Le panneau admin est incroyablement simple. Je gère tout depuis mon téléphone.", en: "The admin panel is incredibly simple. I manage everything from my phone.", ar: "لوحة التحكم بسيطة بشكل لا يصدق. أدير كل شيء من هاتفي." }, rating: 5 },
      { name: "Karim M.", role: { fr: "AutoLoc Express, Tanger", en: "AutoLoc Express, Tangier", ar: "أوتولوك إكسبريس، طنجة" }, text: { fr: "La meilleure décision business que j'ai prise cette année. Mes clients adorent le site.", en: "The best business decision I made this year. My clients love the website.", ar: "أفضل قرار تجاري اتخذته هذا العام. عملائي يحبون الموقع." }, rating: 5 },
    ]
  },
  faq: {
    title: { fr: "Questions fréquentes", en: "Frequently asked questions", ar: "الأسئلة الشائعة" },
    items: [
      { q: { fr: "Ai-je besoin de compétences techniques ?", en: "Do I need technical skills?", ar: "هل أحتاج إلى مهارات تقنية؟" }, a: { fr: "Non, absolument pas. Le panneau d'administration est 100% visuel et intuitif. Vous gérez tout en quelques clics.", en: "No, absolutely not. The admin panel is 100% visual and intuitive. You manage everything in a few clicks.", ar: "لا، على الإطلاق. لوحة التحكم مرئية 100% وسهلة الاستخدام. تدير كل شيء بنقرات قليلة." }},
      { q: { fr: "Le domaine et l'hébergement sont vraiment gratuits ?", en: "Are domain and hosting really free?", ar: "هل النطاق والاستضافة مجانيان حقًا؟" }, a: { fr: "Oui ! Le domaine (.com ou .ma) et l'hébergement sont inclus dans le prix. Aucun frais supplémentaire.", en: "Yes! The domain (.com or .ma) and hosting are included in the price. No additional fees.", ar: "نعم! النطاق (.com أو .ma) والاستضافة مضمنان في السعر. بدون رسوم إضافية." }},
      { q: { fr: "Combien de temps pour avoir mon site en ligne ?", en: "How long to get my website online?", ar: "كم من الوقت ليكون موقعي على الإنترنت؟" }, a: { fr: "24 à 48 heures maximum. On configure tout pour vous et on vous livre un site 100% prêt.", en: "24 to 48 hours maximum. We set everything up for you and deliver a 100% ready website.", ar: "24 إلى 48 ساعة كحد أقصى. نقوم بإعداد كل شيء لك ونسلمك موقعًا جاهزًا 100%." }},
      { q: { fr: "Puis-je modifier le contenu moi-même ?", en: "Can I modify the content myself?", ar: "هل يمكنني تعديل المحتوى بنفسي؟" }, a: { fr: "Oui ! Tout est modifiable : véhicules, prix, images, textes, couleurs, sections… Tout depuis votre admin.", en: "Yes! Everything is editable: vehicles, prices, images, texts, colors, sections… All from your admin.", ar: "نعم! كل شيء قابل للتعديل: المركبات، الأسعار، الصور، النصوص، الألوان، الأقسام… كل ذلك من لوحة التحكم." }},
      { q: { fr: "Y a-t-il un abonnement mensuel ?", en: "Is there a monthly subscription?", ar: "هل يوجد اشتراك شهري؟" }, a: { fr: "Non. C'est un paiement unique de 1199 DH. Pas de frais cachés, pas d'abonnement.", en: "No. It's a one-time payment of 1199 MAD. No hidden fees, no subscription.", ar: "لا. إنها دفعة واحدة بقيمة 1199 درهم. بدون رسوم مخفية، بدون اشتراك." }},
      { q: { fr: "Mon site sera-t-il visible sur Google ?", en: "Will my website be visible on Google?", ar: "هل سيكون موقعي مرئيًا على جوجل؟" }, a: { fr: "Oui ! Le site est optimisé SEO : balises meta, performance, responsive. Vous serez visible sur Google.", en: "Yes! The site is SEO optimized: meta tags, performance, responsive. You'll be visible on Google.", ar: "نعم! الموقع محسّن لمحركات البحث: علامات ميتا، أداء، متجاوب. ستكون مرئيًا على جوجل." }},
    ]
  },
  finalCta: {
    title: { fr: "Ne laissez plus vos concurrents prendre vos clients", en: "Don't let your competitors take your clients anymore", ar: "لا تدع منافسيك يأخذون عملاءك بعد الآن" },
    subtitle: { fr: "Chaque jour sans site web, c'est de l'argent perdu. Lancez-vous maintenant.", en: "Every day without a website is money lost. Launch now.", ar: "كل يوم بدون موقع ويب هو أموال ضائعة. انطلق الآن." },
    cta: { fr: "Obtenir mon site pour 1199 DH", en: "Get my website for 1199 MAD", ar: "احصل على موقعي بـ 1199 درهم" },
    urgency: { fr: "🔥 Offre limitée — Domaine + Hébergement offerts", en: "🔥 Limited offer — Free Domain + Hosting", ar: "🔥 عرض محدود — النطاق + الاستضافة مجانًا" },
  },
  footer: {
    rights: { fr: "Tous droits réservés.", en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
  },
};

const featuresList: { icon: React.ElementType; title: Record<Lang, string>; desc: Record<Lang, string> }[] = [
  { icon: Palette, title: { fr: "Multi-thèmes professionnels", en: "Professional multi-themes", ar: "قوالب احترافية متعددة" }, desc: { fr: "8+ thèmes prédéfinis avec des structures uniques", en: "8+ preset themes with unique structures", ar: "أكثر من 8 قوالب مصممة مسبقًا بهياكل فريدة" }},
  { icon: Settings, title: { fr: "Admin 100% dynamique", en: "100% dynamic admin", ar: "لوحة تحكم ديناميكية 100%" }, desc: { fr: "Interface d'administration complète en français", en: "Complete admin interface in French", ar: "واجهة إدارة كاملة بالفرنسية" }},
  { icon: Car, title: { fr: "Gestion des véhicules", en: "Vehicle management", ar: "إدارة المركبات" }, desc: { fr: "Ajout, modification, suppression de véhicules", en: "Add, edit, delete vehicles", ar: "إضافة وتعديل وحذف المركبات" }},
  { icon: CreditCard, title: { fr: "Tarification dynamique", en: "Dynamic pricing", ar: "تسعير ديناميكي" }, desc: { fr: "Prix flexibles par véhicule et par saison", en: "Flexible prices per vehicle and season", ar: "أسعار مرنة لكل مركبة وموسم" }},
  { icon: MapPin, title: { fr: "Villes dynamiques", en: "Dynamic cities", ar: "مدن ديناميكية" }, desc: { fr: "Gestion des villes avec images personnalisées", en: "City management with custom images", ar: "إدارة المدن مع صور مخصصة" }},
  { icon: BarChart3, title: { fr: "Système de réservation", en: "Booking system", ar: "نظام الحجز" }, desc: { fr: "Réservations en ligne avec suivi complet", en: "Online bookings with full tracking", ar: "حجوزات عبر الإنترنت مع تتبع كامل" }},
  { icon: TrendingUp, title: { fr: "Calculateur de budget", en: "Budget calculator", ar: "حاسبة الميزانية" }, desc: { fr: "Estimation automatique du coût de location", en: "Automatic rental cost estimation", ar: "تقدير تلقائي لتكلفة الإيجار" }},
  { icon: Users, title: { fr: "Gestion de flotte", en: "Fleet management", ar: "إدارة الأسطول" }, desc: { fr: "Module complet de gestion de parc automobile", en: "Complete fleet management module", ar: "وحدة كاملة لإدارة أسطول السيارات" }},
  { icon: MessageSquare, title: { fr: "Contact avec carte", en: "Contact with map", ar: "اتصال مع خريطة" }, desc: { fr: "Page contact avec Google Maps dynamique", en: "Contact page with dynamic Google Maps", ar: "صفحة اتصال مع خرائط جوجل ديناميكية" }},
  { icon: ChevronDown, title: { fr: "Gestion FAQ", en: "FAQ management", ar: "إدارة الأسئلة الشائعة" }, desc: { fr: "Questions/réponses éditables depuis l'admin", en: "Editable Q&A from the admin", ar: "أسئلة وأجوبة قابلة للتحرير من لوحة التحكم" }},
  { icon: Star, title: { fr: "Gestion des avis", en: "Testimonials management", ar: "إدارة التقييمات" }, desc: { fr: "Ajout et gestion d'avis clients", en: "Add and manage client reviews", ar: "إضافة وإدارة تقييمات العملاء" }},
  { icon: Languages, title: { fr: "Multilingue FR/AR/EN", en: "Multilingual FR/AR/EN", ar: "متعدد اللغات FR/AR/EN" }, desc: { fr: "Support complet avec direction RTL", en: "Full support with RTL direction", ar: "دعم كامل مع اتجاه RTL" }},
  { icon: Globe, title: { fr: "Multi-devises", en: "Multi-currency", ar: "متعدد العملات" }, desc: { fr: "MAD, USD, EUR avec changement dynamique", en: "MAD, USD, EUR with dynamic switching", ar: "MAD, USD, EUR مع تبديل ديناميكي" }},
  { icon: Palette, title: { fr: "Upload de thèmes", en: "Theme upload system", ar: "نظام رفع القوالب" }, desc: { fr: "Importation de thèmes personnalisés en JSON", en: "Import custom themes via JSON", ar: "استيراد قوالب مخصصة بصيغة JSON" }},
  { icon: Image, title: { fr: "Image hero dynamique", en: "Dynamic hero image", ar: "صورة رئيسية ديناميكية" }, desc: { fr: "Image principale personnalisable par ville", en: "Main image customizable per city", ar: "صورة رئيسية قابلة للتخصيص لكل مدينة" }},
  { icon: ToggleLeft, title: { fr: "Gestion des sections", en: "Section management", ar: "إدارة الأقسام" }, desc: { fr: "Activer/désactiver les sections du site", en: "Enable/disable website sections", ar: "تفعيل/تعطيل أقسام الموقع" }},
  { icon: Layout, title: { fr: "Contrôle des formulaires", en: "Form field control", ar: "التحكم في حقول النماذج" }, desc: { fr: "Activer/désactiver les champs à votre guise", en: "Enable/disable fields as you wish", ar: "تفعيل/تعطيل الحقول حسب رغبتك" }},
  { icon: Monitor, title: { fr: "Styles de cartes véhicules", en: "Vehicle card styles", ar: "أنماط بطاقات المركبات" }, desc: { fr: "Choix parmi plusieurs styles de cartes", en: "Choose from multiple card styles", ar: "اختر من بين أنماط بطاقات متعددة" }},
  { icon: Sparkles, title: { fr: "Animations fluides", en: "Smooth animations", ar: "رسوم متحركة سلسة" }, desc: { fr: "Transitions et effets visuels élégants", en: "Elegant transitions and visual effects", ar: "انتقالات وتأثيرات بصرية أنيقة" }},
  { icon: Smartphone, title: { fr: "Responsive design", en: "Responsive design", ar: "تصميم متجاوب" }, desc: { fr: "Parfait sur mobile, tablette et desktop", en: "Perfect on mobile, tablet and desktop", ar: "مثالي على الجوال والتابلت وسطح المكتب" }},
  { icon: Search, title: { fr: "SEO optimisé", en: "SEO optimized", ar: "محسّن لمحركات البحث" }, desc: { fr: "Référencement naturel intégré", en: "Built-in organic search optimization", ar: "تحسين محركات البحث المدمج" }},
  { icon: Zap, title: { fr: "Chargement rapide", en: "Fast loading", ar: "تحميل سريع" }, desc: { fr: "Performance optimisée pour un chargement éclair", en: "Optimized performance for lightning-fast loading", ar: "أداء محسّن لتحميل فائق السرعة" }},
  { icon: Lock, title: { fr: "Système sécurisé", en: "Secure system", ar: "نظام آمن" }, desc: { fr: "Protection des données et accès sécurisé", en: "Data protection and secure access", ar: "حماية البيانات والوصول الآمن" }},
  { icon: Infinity, title: { fr: "Accès à vie", en: "Lifetime access", ar: "وصول مدى الحياة" }, desc: { fr: "Pas d'abonnement, c'est à vous pour toujours", en: "No subscription, it's yours forever", ar: "بدون اشتراك، إنه لك للأبد" }},
];

// ─── COMPONENTS ──────────────────────────────────────────────

const SalesLanding = () => {
  const { siteConfig } = useAdmin();
  const [lang, setLang] = useState<Lang>("fr");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isRTL = lang === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  const whatsappLink = "https://wa.me/212635081648?text=" + encodeURIComponent(
    lang === "fr" ? "Bonjour, je suis intéressé par la solution de location de voitures à 1199 DH." :
    lang === "ar" ? "مرحبًا، أنا مهتم بحل تأجير السيارات بـ 1199 درهم." :
    "Hello, I'm interested in the car rental solution for 1199 MAD."
  );
  const demoThemes = Object.entries(landingPageThemePresets);
  const previewImageOverrides = siteConfig.theme_preview_images || {};
  const getThemePreviewImage = (slug: string, preset: (typeof landingPageThemePresets)[keyof typeof landingPageThemePresets]) => {
    const override = previewImageOverrides[slug];
    if (typeof override === "string" && override.trim()) return override.trim();
    if (typeof preset.preview_image === "string" && preset.preview_image.trim()) return preset.preview_image.trim();
    return "";
  };

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] text-[hsl(220,15%,90%)] overflow-x-hidden" dir={dir}>
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[hsl(220,20%,4%)]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-[hsl(45,90%,60%)] to-[hsl(35,85%,50%)] bg-clip-text text-transparent">
            RentalPro
          </span>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo("features")} className="text-sm text-white/60 hover:text-white transition-colors">{t(copy.nav.features, lang)}</button>
            <button onClick={() => scrollTo("pricing")} className="text-sm text-white/60 hover:text-white transition-colors">{t(copy.nav.pricing, lang)}</button>
            <button onClick={() => scrollTo("faq")} className="text-sm text-white/60 hover:text-white transition-colors">{t(copy.nav.faq, lang)}</button>
            <div className="flex items-center gap-1 border border-white/10 rounded-full px-1 py-0.5">
              {(["fr", "en", "ar"] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all ${lang === l ? "bg-white/15 text-white font-semibold" : "text-white/40 hover:text-white/70"}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-[hsl(45,90%,55%)] to-[hsl(30,85%,50%)] text-[hsl(220,20%,8%)] font-semibold text-sm h-9 px-5 rounded-full hover:shadow-lg hover:shadow-[hsl(45,90%,55%)]/20 transition-all border-0">
                {t(copy.nav.cta, lang)}
              </Button>
            </a>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-white/70">
            {mobileMenu ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-white/5 bg-[hsl(220,20%,6%)] px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
            <button onClick={() => scrollTo("features")} className="block text-sm text-white/70">{t(copy.nav.features, lang)}</button>
            <button onClick={() => scrollTo("pricing")} className="block text-sm text-white/70">{t(copy.nav.pricing, lang)}</button>
            <button onClick={() => scrollTo("faq")} className="block text-sm text-white/70">{t(copy.nav.faq, lang)}</button>
            <div className="flex gap-2 pt-2">
              {(["fr", "en", "ar"] as Lang[]).map(l => (
                <button key={l} onClick={() => { setLang(l); setMobileMenu(false); }}
                  className={`text-xs px-3 py-1.5 rounded-full ${lang === l ? "bg-white/15 text-white" : "text-white/40 border border-white/10"}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block pt-2">
              <Button className="w-full bg-gradient-to-r from-[hsl(45,90%,55%)] to-[hsl(30,85%,50%)] text-[hsl(220,20%,8%)] font-semibold rounded-full border-0">
                {t(copy.nav.cta, lang)}
              </Button>
            </a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 pb-20 px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(45,80%,50%)]/5 blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto relative grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className={`text-center lg:text-start ${isRTL ? "lg:order-2" : ""}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 mb-8">
              {t(copy.hero.badge, lang)}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              {t(copy.hero.title1, lang)}{" "}
              <span className="bg-gradient-to-r from-[hsl(45,90%,60%)] to-[hsl(30,85%,50%)] bg-clip-text text-transparent">
                {t(copy.hero.title2, lang)}
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-xl mb-10 leading-relaxed">
              {t(copy.hero.subtitle, lang)}
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-8">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-[hsl(45,90%,55%)] to-[hsl(30,85%,50%)] text-[hsl(220,20%,8%)] font-bold text-base h-12 px-8 rounded-full hover:shadow-xl hover:shadow-[hsl(45,90%,55%)]/25 transition-all border-0 hover:scale-105">
                  {t(copy.hero.cta, lang)}
                </Button>
              </a>
              <button onClick={() => scrollTo("features")} className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4">
                {t(copy.hero.ctaSub, lang)}
              </button>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-[hsl(45,90%,60%)] to-[hsl(30,85%,50%)] bg-clip-text text-transparent">
                  {t(copy.hero.price, lang)}
                </span>
                <span className="text-xs text-white/40 line-through">2999 DH</span>
              </div>
              <p className="text-xs text-white/40 flex items-center gap-1.5">
                <Check size={12} className="text-[hsl(145,60%,50%)]" />
                {t(copy.hero.priceNote, lang)}
              </p>
            </div>
            <p className="text-xs text-white/30 mt-8">{t(copy.hero.trustedBy, lang)}</p>
          </div>

          {/* Right: Product Box */}
          <div className={`flex justify-center lg:justify-end ${isRTL ? "lg:order-1 lg:justify-start" : ""}`}>
            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-[hsl(45,80%,55%)]/10 to-transparent blur-2xl pointer-events-none" />
              <img
                src={productBox.src}
                alt="AjirCar - Solution Complète - Car Rental Business System"
                className="relative w-full max-w-sm lg:max-w-md drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t(copy.problem.title, lang)}</h2>
            <p className="text-white/50">{t(copy.problem.subtitle, lang)}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {copy.problem.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-xl bg-[hsl(0,60%,50%)]/5 border border-[hsl(0,60%,50%)]/10">
                <X size={18} className="text-[hsl(0,60%,55%)] mt-0.5 shrink-0" />
                <p className="text-sm text-white/70">{t(item, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t(copy.solution.title, lang)}</h2>
          <p className="text-white/50 mb-12">{t(copy.solution.subtitle, lang)}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {copy.solution.points.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[hsl(45,80%,55%)]/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(45,80%,55%)]/15 to-transparent flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  {p.icon === "monitor" && <Monitor size={22} className="text-[hsl(45,80%,60%)]" />}
                  {p.icon === "settings" && <Settings size={22} className="text-[hsl(45,80%,60%)]" />}
                  {p.icon === "zap" && <Zap size={22} className="text-[hsl(45,80%,60%)]" />}
                </div>
                <h3 className="font-semibold mb-2">{t(p.title, lang)}</h3>
                <p className="text-sm text-white/50">{t(p.desc, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t(copy.features.title, lang)}</h2>
            <p className="text-white/50">{t(copy.features.subtitle, lang)}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuresList.map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[hsl(45,80%,55%)]/15 transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[hsl(45,80%,55%)]/10 flex items-center justify-center shrink-0 group-hover:bg-[hsl(45,80%,55%)]/20 transition-colors">
                    <f.icon size={16} className="text-[hsl(45,80%,60%)]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t(f.title, lang)}</h4>
                    <p className="text-xs text-white/40 leading-relaxed">{t(f.desc, lang)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THEMES DEMOS ─── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t(copy.demos.title, lang)}</h2>
            <p className="text-white/50">{t(copy.demos.subtitle, lang)}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {demoThemes.map(([slug, preset]) => (
              <div key={slug} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-4">
                {getThemePreviewImage(slug, preset) ? (
                  <div className="h-28 rounded-lg overflow-hidden border border-white/10">
                    <img src={getThemePreviewImage(slug, preset)} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="h-28 rounded-lg border border-white/10"
                    style={{ background: `linear-gradient(135deg, hsl(${preset.preview_colors[0]}) 0%, hsl(${preset.preview_colors[1]}) 55%, hsl(${preset.preview_colors[2]}) 100%)` }}
                  />
                )}
                <div className="flex items-center gap-2">
                  {preset.preview_colors.map((color, i) => (
                    <span key={`${slug}-${i}`} className="w-5 h-5 rounded-full border border-white/10" style={{ background: `hsl(${color})` }} />
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{preset.name}</h3>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2">{preset.description}</p>
                </div>
                <a
                  href={`/preview/${slug}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[hsl(45,80%,55%)]/30 text-[hsl(45,90%,60%)] text-xs font-semibold px-4 py-2 hover:bg-[hsl(45,80%,55%)]/10 transition-colors"
                >
                  {t(copy.demos.preview, lang)} <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t(copy.pricing.title, lang)}</h2>
          <p className="text-white/50 mb-10">{t(copy.pricing.subtitle, lang)}</p>
          <div className="rounded-2xl border border-[hsl(45,80%,55%)]/20 bg-gradient-to-b from-[hsl(45,80%,55%)]/5 to-transparent p-8 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(45,80%,55%)]/50 to-transparent" />
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-5xl font-bold bg-gradient-to-r from-[hsl(45,90%,60%)] to-[hsl(30,85%,50%)] bg-clip-text text-transparent">
                {t(copy.pricing.price, lang)}
              </span>
              <span className="text-lg text-white/50">{t(copy.pricing.currency, lang)}</span>
            </div>
            <p className="text-sm text-white/40 mb-8">{t(copy.pricing.oneTime, lang)}</p>
            <div className="space-y-3 text-start mb-8">
              {copy.pricing.includes.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check size={16} className="text-[hsl(145,60%,50%)] shrink-0" />
                  <span className="text-sm text-white/70">{t(item, lang)}</span>
                </div>
              ))}
            </div>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-gradient-to-r from-[hsl(45,90%,55%)] to-[hsl(30,85%,50%)] text-[hsl(220,20%,8%)] font-bold text-base h-12 rounded-full hover:shadow-xl hover:shadow-[hsl(45,90%,55%)]/25 transition-all border-0 hover:scale-[1.02]">
                {t(copy.pricing.cta, lang)}
              </Button>
            </a>
            <p className="text-xs text-white/40 mt-4">{t(copy.pricing.guarantee, lang)}</p>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t(copy.testimonials.title, lang)}</h2>
            <p className="text-white/50">{t(copy.testimonials.subtitle, lang)}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {copy.testimonials.items.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-[hsl(45,80%,55%)] fill-[hsl(45,80%,55%)]" />
                  ))}
                </div>
                <p className="text-sm text-white/60 mb-5 leading-relaxed italic">"{t(item.text, lang)}"</p>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-white/40">{t(item.role, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">{t(copy.faq.title, lang)}</h2>
          <div className="space-y-2">
            {copy.faq.items.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-start hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium pe-4">{t(item.q, lang)}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-white/40 shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-white/50 leading-relaxed">{t(item.a, lang)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 border-t border-white/5 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[hsl(45,80%,50%)]/5 blur-[100px]" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t(copy.finalCta.title, lang)}</h2>
          <p className="text-white/50 mb-4">{t(copy.finalCta.subtitle, lang)}</p>
          <p className="text-sm text-[hsl(45,80%,60%)] font-medium mb-8">{t(copy.finalCta.urgency, lang)}</p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-[hsl(45,90%,55%)] to-[hsl(30,85%,50%)] text-[hsl(220,20%,8%)] font-bold text-base h-14 px-10 rounded-full hover:shadow-2xl hover:shadow-[hsl(45,90%,55%)]/30 transition-all border-0 hover:scale-105">
              {t(copy.finalCta.cta, lang)}
            </Button>
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <p className="text-xs text-white/30">© 2026 RentalPro. {t(copy.footer.rights, lang)}</p>
      </footer>

      {/* ─── WHATSAPP FLOATING ─── */}
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 end-6 z-50 w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center shadow-lg shadow-[hsl(142,70%,45%)]/30 hover:scale-110 transition-transform">
        <Phone size={22} className="text-white" />
      </a>
    </div>
  );
};

export default SalesLanding;
