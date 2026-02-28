"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, ChevronRight, ChevronDown, Search, Globe, ArrowLeft,
  LayoutDashboard, Car, MapPin, CalendarCheck, Calculator, Palette,
  Layers, Phone, Languages, DollarSign, FormInput, Image, Users,
  Settings, Shield, HelpCircle, Menu, X
} from "lucide-react";

type Lang = "fr" | "en" | "ar";

const t = (texts: Record<Lang, string>, lang: Lang) => texts[lang];

/* ─── translations ─── */
const ui = {
  title: { fr: "Documentation", en: "Documentation", ar: "التوثيق" },
  search: { fr: "Rechercher dans la documentation…", en: "Search documentation…", ar: "…البحث في التوثيق" },
  backToSite: { fr: "Retour au site", en: "Back to site", ar: "العودة للموقع" },
  tableOfContents: { fr: "Table des matières", en: "Table of Contents", ar: "جدول المحتويات" },
  screenshotPlaceholder: { fr: "📷 Capture d'écran à venir", en: "📷 Screenshot coming soon", ar: "📷 لقطة شاشة قريبًا" },
  tip: { fr: "💡 Astuce", en: "💡 Tip", ar: "💡 نصيحة" },
  note: { fr: "📌 Note", en: "📌 Note", ar: "📌 ملاحظة" },
};

interface DocSection {
  id: string;
  icon: React.ReactNode;
  title: Record<Lang, string>;
  content: Record<Lang, React.ReactNode>;
}

const Screenshot = ({ lang }: { lang: Lang }) => (
  <div className="my-4 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
    {t(ui.screenshotPlaceholder, lang)}
  </div>
);

const Tip = ({ lang, children }: { lang: Lang; children: Record<Lang, string> }) => (
  <div className="my-4 rounded-lg border-l-4 border-amber-500 bg-amber-500/5 p-4 text-sm">
    <strong>{t(ui.tip, lang)} :</strong> {t(children, lang)}
  </div>
);

const Note = ({ lang, children }: { lang: Lang; children: Record<Lang, string> }) => (
  <div className="my-4 rounded-lg border-l-4 border-blue-500 bg-blue-500/5 p-4 text-sm">
    <strong>{t(ui.note, lang)} :</strong> {t(children, lang)}
  </div>
);

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div className="flex gap-3 my-3">
    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{n}</span>
    <div className="pt-0.5">{children}</div>
  </div>
);

const sections: DocSection[] = [
  /* 1 ─ Introduction */
  {
    id: "introduction",
    icon: <BookOpen size={18} />,
    title: { fr: "Introduction", en: "Introduction", ar: "مقدمة" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Présentation de la solution</h3>
          <p><strong>AJIRCAR</strong> est une solution digitale complète conçue spécifiquement pour les agences de location de voitures au Maroc et dans le monde entier. Elle combine un site web professionnel multi-thèmes avec un panneau d'administration puissant et 100 % dynamique.</p>
          <h4 className="font-semibold mt-4 mb-2">Ce que fait AJIRCAR</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fournit un site web professionnel clé en main pour votre agence de location</li>
            <li>Gère votre flotte de véhicules, vos réservations et vos tarifs</li>
            <li>Offre un panneau d'administration complet en français</li>
            <li>Supporte 3 langues (FR, AR, EN) et 3 devises (MAD, USD, EUR)</li>
            <li>Inclut un système de thèmes personnalisables</li>
            <li>Optimisé SEO, rapide et sécurisé</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">À qui s'adresse AJIRCAR ?</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Agences de location de voitures existantes souhaitant digitaliser leur activité</li>
            <li>Entrepreneurs démarrant une nouvelle activité de location de véhicules</li>
            <li>Agences multi-villes cherchant une solution centralisée</li>
          </ul>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Solution Overview</h3>
          <p><strong>AJIRCAR</strong> is a complete digital solution designed specifically for car rental agencies in Morocco and worldwide. It combines a professional multi-theme website with a powerful, 100% dynamic administration panel.</p>
          <h4 className="font-semibold mt-4 mb-2">What AJIRCAR Does</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provides a turnkey professional website for your rental agency</li>
            <li>Manages your vehicle fleet, bookings, and pricing</li>
            <li>Offers a comprehensive admin panel in French</li>
            <li>Supports 3 languages (FR, AR, EN) and 3 currencies (MAD, USD, EUR)</li>
            <li>Includes a customizable theme system</li>
            <li>SEO optimized, fast, and secure</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Who Is AJIRCAR For?</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Existing car rental agencies wanting to digitalize their business</li>
            <li>Entrepreneurs starting a new vehicle rental business</li>
            <li>Multi-city agencies looking for a centralized solution</li>
          </ul>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">نظرة عامة على الحل</h3>
          <p><strong>AJIRCAR</strong> هو حل رقمي متكامل مصمم خصيصًا لوكالات تأجير السيارات في المغرب وحول العالم. يجمع بين موقع ويب احترافي متعدد القوالب ولوحة إدارة قوية وديناميكية بالكامل.</p>
          <h4 className="font-semibold mt-4 mb-2">ماذا يفعل AJIRCAR؟</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>يوفر موقع ويب احترافي جاهز لوكالتك</li>
            <li>يدير أسطول مركباتك والحجوزات والأسعار</li>
            <li>يقدم لوحة إدارة شاملة باللغة الفرنسية</li>
            <li>يدعم 3 لغات (FR, AR, EN) و3 عملات (MAD, USD, EUR)</li>
            <li>يتضمن نظام قوالب قابل للتخصيص</li>
            <li>محسّن لمحركات البحث، سريع وآمن</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">لمن AJIRCAR؟</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>وكالات تأجير السيارات الحالية التي ترغب في رقمنة نشاطها</li>
            <li>رواد الأعمال الذين يبدأون نشاط تأجير جديد</li>
            <li>الوكالات متعددة المدن التي تبحث عن حل مركزي</li>
          </ul>
        </>
      ),
    },
  },

  /* 2 ─ Getting Started */
  {
    id: "getting-started",
    icon: <Settings size={18} />,
    title: { fr: "Démarrage rapide", en: "Getting Started", ar: "البدء السريع" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Accéder au panneau d'administration</h3>
          <Step n={1}>Ouvrez votre navigateur et accédez à <code className="bg-muted px-2 py-0.5 rounded text-sm">votresite.com/admin</code></Step>
          <Step n={2}>Entrez vos identifiants de connexion (nom d'utilisateur et mot de passe)</Step>
          <Step n={3}>Cliquez sur <strong>"Se connecter"</strong></Step>
          <Screenshot lang="fr" />
          <Tip lang="fr">{{ fr: "Identifiants par défaut : admin / admin. Changez-les immédiatement après votre première connexion.", en: "", ar: "" }}</Tip>
          <h4 className="font-semibold mt-5 mb-2">Configuration initiale</h4>
          <p>Après votre première connexion, nous vous recommandons de suivre cet ordre :</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>Configurer les <strong>informations de votre agence</strong> (nom, logo, coordonnées)</li>
            <li>Ajouter vos <strong>véhicules</strong> avec photos et tarifs</li>
            <li>Configurer vos <strong>villes</strong> de couverture</li>
            <li>Personnaliser le <strong>thème</strong> et les couleurs de votre site</li>
            <li>Configurer les <strong>sections</strong> de votre page d'accueil</li>
            <li>Activer les <strong>langues</strong> et <strong>devises</strong> souhaitées</li>
          </ol>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Accessing the Admin Panel</h3>
          <Step n={1}>Open your browser and navigate to <code className="bg-muted px-2 py-0.5 rounded text-sm">yoursite.com/admin</code></Step>
          <Step n={2}>Enter your login credentials (username and password)</Step>
          <Step n={3}>Click <strong>"Log in"</strong></Step>
          <Screenshot lang="en" />
          <Tip lang="en">{{ fr: "", en: "Default credentials: admin / admin. Change them immediately after your first login.", ar: "" }}</Tip>
          <h4 className="font-semibold mt-5 mb-2">Initial Setup</h4>
          <p>After your first login, we recommend following this order:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>Configure your <strong>agency information</strong> (name, logo, contact details)</li>
            <li>Add your <strong>vehicles</strong> with photos and pricing</li>
            <li>Set up your <strong>coverage cities</strong></li>
            <li>Customize your site's <strong>theme</strong> and colors</li>
            <li>Configure your <strong>homepage sections</strong></li>
            <li>Enable desired <strong>languages</strong> and <strong>currencies</strong></li>
          </ol>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">الوصول إلى لوحة الإدارة</h3>
          <Step n={1}>افتح المتصفح وانتقل إلى <code className="bg-muted px-2 py-0.5 rounded text-sm">yoursite.com/admin</code></Step>
          <Step n={2}>أدخل بيانات تسجيل الدخول (اسم المستخدم وكلمة المرور)</Step>
          <Step n={3}>انقر على <strong>"تسجيل الدخول"</strong></Step>
          <Screenshot lang="ar" />
          <h4 className="font-semibold mt-5 mb-2">الإعداد الأولي</h4>
          <p>بعد أول تسجيل دخول، نوصي باتباع هذا الترتيب:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>تكوين <strong>معلومات وكالتك</strong> (الاسم، الشعار، بيانات الاتصال)</li>
            <li>إضافة <strong>المركبات</strong> مع الصور والأسعار</li>
            <li>إعداد <strong>المدن</strong> المغطاة</li>
            <li>تخصيص <strong>القالب</strong> والألوان</li>
            <li>تكوين <strong>أقسام</strong> الصفحة الرئيسية</li>
            <li>تفعيل <strong>اللغات</strong> و<strong>العملات</strong> المطلوبة</li>
          </ol>
        </>
      ),
    },
  },

  /* 3 ─ Dashboard */
  {
    id: "dashboard",
    icon: <LayoutDashboard size={18} />,
    title: { fr: "Tableau de bord", en: "Dashboard Overview", ar: "لوحة التحكم" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Vue d'ensemble du tableau de bord</h3>
          <p>Le tableau de bord vous donne une vision globale de votre activité en temps réel.</p>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Statistiques affichées</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Chiffre d'affaires</strong> – Revenus totaux du mois en cours</li>
            <li><strong>Réservations actives</strong> – Nombre de réservations confirmées et en attente</li>
            <li><strong>Flotte</strong> – Nombre total de véhicules et véhicules disponibles</li>
            <li><strong>Taux d'utilisation</strong> – Pourcentage d'utilisation de votre flotte</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Graphique d'évolution</h4>
          <p>Un graphique interactif montre l'évolution de votre chiffre d'affaires sur les derniers mois.</p>
          <h4 className="font-semibold mt-4 mb-2">Sections rapides</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Réservations récentes</strong> – Les 4 dernières réservations avec leur statut</li>
            <li><strong>Véhicules en vedette</strong> – Les véhicules mis en avant sur le site</li>
          </ul>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Dashboard Overview</h3>
          <p>The dashboard gives you a real-time overview of your business activity.</p>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">Displayed Statistics</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Revenue</strong> – Total revenue for the current month</li>
            <li><strong>Active Bookings</strong> – Number of confirmed and pending bookings</li>
            <li><strong>Fleet</strong> – Total vehicles and available vehicles</li>
            <li><strong>Utilization Rate</strong> – Percentage of fleet usage</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Revenue Chart</h4>
          <p>An interactive chart shows revenue trends over recent months.</p>
          <h4 className="font-semibold mt-4 mb-2">Quick Sections</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Recent Bookings</strong> – Last 4 bookings with their status</li>
            <li><strong>Featured Vehicles</strong> – Highlighted vehicles on the site</li>
          </ul>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">نظرة عامة على لوحة التحكم</h3>
          <p>تمنحك لوحة التحكم نظرة شاملة على نشاطك التجاري في الوقت الفعلي.</p>
          <Screenshot lang="ar" />
          <h4 className="font-semibold mt-4 mb-2">الإحصائيات المعروضة</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>الإيرادات</strong> – إجمالي إيرادات الشهر الحالي</li>
            <li><strong>الحجوزات النشطة</strong> – عدد الحجوزات المؤكدة والمعلقة</li>
            <li><strong>الأسطول</strong> – إجمالي المركبات والمتاحة</li>
            <li><strong>معدل الاستخدام</strong> – نسبة استخدام الأسطول</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">مخطط الإيرادات</h4>
          <p>مخطط تفاعلي يعرض تطور الإيرادات خلال الأشهر الأخيرة.</p>
        </>
      ),
    },
  },

  /* 4 ─ Vehicle Management */
  {
    id: "vehicles",
    icon: <Car size={18} />,
    title: { fr: "Gestion des véhicules", en: "Vehicle Management", ar: "إدارة المركبات" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion de votre flotte</h3>
          <p>Le module de gestion des véhicules vous permet de gérer l'intégralité de votre flotte depuis l'administration.</p>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Ajouter un véhicule</h4>
          <Step n={1}>Accédez à l'onglet <strong>"Flotte"</strong></Step>
          <Step n={2}>Cliquez sur <strong>"Ajouter un véhicule"</strong></Step>
          <Step n={3}>Remplissez les informations : nom, catégorie, prix/jour, transmission, carburant, nombre de places</Step>
          <Step n={4}>Ajoutez des images (URL ou téléchargement)</Step>
          <Step n={5}>Activez <strong>"Véhicule vedette"</strong> si vous souhaitez le mettre en avant</Step>
          <Step n={6}>Cliquez sur <strong>"Enregistrer"</strong></Step>
          <h4 className="font-semibold mt-4 mb-2">Modifier un véhicule</h4>
          <p>Cliquez sur le bouton <strong>"Modifier"</strong> sur la carte du véhicule pour accéder au formulaire d'édition.</p>
          <h4 className="font-semibold mt-4 mb-2">Supprimer un véhicule</h4>
          <p>Cliquez sur le bouton <strong>"Supprimer"</strong> et confirmez la suppression.</p>
          <h4 className="font-semibold mt-4 mb-2">Gestion des images</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ajoutez des images par URL ou par téléchargement de fichier</li>
            <li>Réorganisez l'ordre des images avec les flèches</li>
            <li>La première image est automatiquement l'image principale</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Catégories disponibles</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Économique, Berline, SUV, Luxe, Utilitaire</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Statuts</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Disponible</strong> – Le véhicule est prêt à être loué</li>
            <li><strong>Loué</strong> – Actuellement en location</li>
            <li><strong>En maintenance</strong> – En cours de réparation ou entretien</li>
          </ul>
          <Tip lang="fr">{{ fr: "Marquez vos meilleurs véhicules comme 'Vedette' pour les afficher en priorité sur votre site.", en: "", ar: "" }}</Tip>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Fleet Management</h3>
          <p>The vehicle management module lets you manage your entire fleet from the admin panel.</p>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">Add a Vehicle</h4>
          <Step n={1}>Go to the <strong>"Fleet"</strong> tab</Step>
          <Step n={2}>Click <strong>"Add Vehicle"</strong></Step>
          <Step n={3}>Fill in: name, category, price/day, transmission, fuel, seats</Step>
          <Step n={4}>Add images (URL or file upload)</Step>
          <Step n={5}>Enable <strong>"Featured"</strong> to highlight the vehicle</Step>
          <Step n={6}>Click <strong>"Save"</strong></Step>
          <h4 className="font-semibold mt-4 mb-2">Edit a Vehicle</h4>
          <p>Click the <strong>"Edit"</strong> button on the vehicle card to open the edit form.</p>
          <h4 className="font-semibold mt-4 mb-2">Delete a Vehicle</h4>
          <p>Click <strong>"Delete"</strong> and confirm the deletion.</p>
          <h4 className="font-semibold mt-4 mb-2">Image Management</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Add images via URL or file upload</li>
            <li>Reorder images using arrow buttons</li>
            <li>The first image is automatically the main image</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Available Categories</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Economy, Sedan, SUV, Luxury, Utility</li>
          </ul>
          <Tip lang="en">{{ fr: "", en: "Mark your best vehicles as 'Featured' to display them prominently on your site.", ar: "" }}</Tip>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة الأسطول</h3>
          <p>يتيح لك نظام إدارة المركبات إدارة أسطولك بالكامل من لوحة الإدارة.</p>
          <Screenshot lang="ar" />
          <h4 className="font-semibold mt-4 mb-2">إضافة مركبة</h4>
          <Step n={1}>انتقل إلى علامة تبويب <strong>"الأسطول"</strong></Step>
          <Step n={2}>انقر على <strong>"إضافة مركبة"</strong></Step>
          <Step n={3}>املأ المعلومات: الاسم، الفئة، السعر/اليوم، ناقل الحركة، الوقود، المقاعد</Step>
          <Step n={4}>أضف الصور (رابط أو تحميل)</Step>
          <Step n={5}>فعّل <strong>"مميزة"</strong> لعرضها بشكل بارز</Step>
          <Step n={6}>انقر على <strong>"حفظ"</strong></Step>
          <h4 className="font-semibold mt-4 mb-2">تعديل مركبة</h4>
          <p>انقر على زر <strong>"تعديل"</strong> في بطاقة المركبة.</p>
          <h4 className="font-semibold mt-4 mb-2">حذف مركبة</h4>
          <p>انقر على <strong>"حذف"</strong> وأكد العملية.</p>
        </>
      ),
    },
  },

  /* 5 ─ City Management */
  {
    id: "cities",
    icon: <MapPin size={18} />,
    title: { fr: "Gestion des villes", en: "City Management", ar: "إدارة المدن" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion des villes</h3>
          <p>Configurez les villes dans lesquelles vous opérez. Chaque ville peut avoir sa propre image hero et ses tarifs spécifiques.</p>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Ajouter une ville</h4>
          <Step n={1}>Accédez aux <strong>Paramètres du site → Villes</strong></Step>
          <Step n={2}>Cliquez sur <strong>"Ajouter une ville"</strong></Step>
          <Step n={3}>Renseignez le nom (FR/EN/AR), l'image, et le slug</Step>
          <Step n={4}>Enregistrez</Step>
          <h4 className="font-semibold mt-4 mb-2">Image Hero par ville</h4>
          <p>Chaque ville peut avoir une image de fond unique affichée dans la section hero du site.</p>
          <h4 className="font-semibold mt-4 mb-2">Modifier / Supprimer</h4>
          <p>Utilisez les boutons d'édition et de suppression dans la liste des villes.</p>
          <Tip lang="fr">{{ fr: "Utilisez des images de haute qualité représentant chaque ville pour un impact visuel maximal.", en: "", ar: "" }}</Tip>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">City Management</h3>
          <p>Configure the cities where you operate. Each city can have its own hero image and specific pricing.</p>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">Add a City</h4>
          <Step n={1}>Go to <strong>Site Settings → Cities</strong></Step>
          <Step n={2}>Click <strong>"Add City"</strong></Step>
          <Step n={3}>Enter the name (FR/EN/AR), image, and slug</Step>
          <Step n={4}>Save</Step>
          <h4 className="font-semibold mt-4 mb-2">Hero Image per City</h4>
          <p>Each city can have a unique background image displayed in the hero section.</p>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة المدن</h3>
          <p>قم بتكوين المدن التي تعمل فيها. يمكن لكل مدينة أن تحتوي على صورة بطل خاصة بها.</p>
          <Screenshot lang="ar" />
          <h4 className="font-semibold mt-4 mb-2">إضافة مدينة</h4>
          <Step n={1}>انتقل إلى <strong>إعدادات الموقع ← المدن</strong></Step>
          <Step n={2}>انقر على <strong>"إضافة مدينة"</strong></Step>
          <Step n={3}>أدخل الاسم (FR/EN/AR) والصورة والمعرف</Step>
          <Step n={4}>احفظ</Step>
        </>
      ),
    },
  },

  /* 6 ─ Bookings */
  {
    id: "bookings",
    icon: <CalendarCheck size={18} />,
    title: { fr: "Gestion des réservations", en: "Booking Management", ar: "إدارة الحجوزات" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion des réservations</h3>
          <p>Visualisez et gérez toutes les réservations reçues depuis votre site web.</p>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Voir les réservations</h4>
          <p>Accédez à l'onglet <strong>"Réservations"</strong>. Vous verrez la liste complète avec :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Référence de la réservation</li>
            <li>Nom du client, email, téléphone</li>
            <li>Véhicule réservé</li>
            <li>Dates de prise en charge et de retour</li>
            <li>Statut (Confirmée, En attente, Annulée)</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Filtrer les réservations</h4>
          <p>Utilisez les filtres en haut pour afficher : Toutes, En attente, Confirmées, ou Annulées.</p>
          <h4 className="font-semibold mt-4 mb-2">Modifier le statut</h4>
          <Step n={1}>Cliquez sur <strong>"Détails"</strong> d'une réservation</Step>
          <Step n={2}>Dans la popup, changez le statut via le menu déroulant</Step>
          <Step n={3}>Le statut est mis à jour instantanément</Step>
          <h4 className="font-semibold mt-4 mb-2">Réservation via WhatsApp</h4>
          <p>Les clients peuvent réserver directement via WhatsApp. Le lien est généré automatiquement avec les détails de la réservation.</p>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Booking Management</h3>
          <p>View and manage all bookings received from your website.</p>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">View Bookings</h4>
          <p>Go to the <strong>"Bookings"</strong> tab to see the full list with reference, client info, vehicle, dates, and status.</p>
          <h4 className="font-semibold mt-4 mb-2">Filter Bookings</h4>
          <p>Use top filters: All, Pending, Confirmed, or Cancelled.</p>
          <h4 className="font-semibold mt-4 mb-2">Change Status</h4>
          <Step n={1}>Click <strong>"Details"</strong> on a booking</Step>
          <Step n={2}>Change the status via the dropdown</Step>
          <Step n={3}>Status updates instantly</Step>
          <h4 className="font-semibold mt-4 mb-2">WhatsApp Reservations</h4>
          <p>Clients can book directly via WhatsApp. The link is auto-generated with booking details.</p>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة الحجوزات</h3>
          <p>عرض وإدارة جميع الحجوزات المستلمة من موقعك.</p>
          <Screenshot lang="ar" />
          <h4 className="font-semibold mt-4 mb-2">عرض الحجوزات</h4>
          <p>انتقل إلى علامة تبويب <strong>"الحجوزات"</strong> لرؤية القائمة الكاملة.</p>
          <h4 className="font-semibold mt-4 mb-2">تغيير الحالة</h4>
          <Step n={1}>انقر على <strong>"التفاصيل"</strong></Step>
          <Step n={2}>غيّر الحالة من القائمة المنسدلة</Step>
          <Step n={3}>يتم التحديث فورًا</Step>
        </>
      ),
    },
  },

  /* 7 ─ Budget Calculator */
  {
    id: "calculator",
    icon: <Calculator size={18} />,
    title: { fr: "Calculateur de budget", en: "Budget Calculator", ar: "حاسبة الميزانية" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion du calculateur de budget</h3>
          <p>Le calculateur de budget permet aux visiteurs d'estimer le coût de leur location en fonction de la durée et de la ville.</p>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Configurer les tarifs</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Définissez un <strong>prix de base par jour</strong></li>
            <li>Ajoutez des <strong>règles de tarification</strong> selon la durée</li>
            <li>Configurez des <strong>tarifs par ville</strong></li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Activer/Désactiver des champs</h4>
          <p>Dans les paramètres, vous pouvez choisir quels champs du calculateur afficher sur le site.</p>
          <Note lang="fr">{{ fr: "Le calculateur utilise les villes configurées dans la section Villes.", en: "", ar: "" }}</Note>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Budget Calculator Management</h3>
          <p>The budget calculator lets visitors estimate rental costs based on duration and city.</p>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">Configure Pricing</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Set a <strong>base price per day</strong></li>
            <li>Add <strong>duration-based pricing rules</strong></li>
            <li>Configure <strong>per-city pricing</strong></li>
          </ul>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة حاسبة الميزانية</h3>
          <p>تتيح حاسبة الميزانية للزوار تقدير تكلفة الإيجار حسب المدة والمدينة.</p>
          <Screenshot lang="ar" />
          <ul className="list-disc pl-5 space-y-1">
            <li>حدد <strong>السعر الأساسي لليوم</strong></li>
            <li>أضف <strong>قواعد تسعير حسب المدة</strong></li>
            <li>كوّن <strong>أسعار حسب المدينة</strong></li>
          </ul>
        </>
      ),
    },
  },

  /* 8 ─ Theme Management */
  {
    id: "theme",
    icon: <Palette size={18} />,
    title: { fr: "Gestion des thèmes", en: "Theme Management", ar: "إدارة القوالب" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Personnalisation du thème</h3>
          <p>AJIRCAR offre un moteur de thèmes complet pour personnaliser l'apparence de votre site.</p>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Thèmes prédéfinis</h4>
          <p>Choisissez parmi plusieurs thèmes professionnels : Default, Minimal, Bold, Elegant, etc. Cliquez simplement sur <strong>"Appliquer"</strong>.</p>
          <h4 className="font-semibold mt-4 mb-2">Personnalisation des couleurs</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Couleur primaire</strong> – Couleur principale du site</li>
            <li><strong>Couleur secondaire</strong> – Couleur d'accentuation</li>
            <li><strong>Arrière-plan</strong> – Couleur de fond</li>
            <li><strong>Texte</strong> – Couleur du texte principal</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Mode Flat</h4>
          <p>Activez le <strong>Mode Flat</strong> pour désactiver toutes les ombres et effets de profondeur.</p>
          <h4 className="font-semibold mt-4 mb-2">Importer un thème personnalisé</h4>
          <Step n={1}>Allez dans <strong>"Thèmes"</strong></Step>
          <Step n={2}>Cliquez sur <strong>"Ajouter un thème"</strong></Step>
          <Step n={3}>Sélectionnez un fichier JSON de thème</Step>
          <Step n={4}>Prévisualisez et confirmez l'import</Step>
          <h4 className="font-semibold mt-4 mb-2">Exporter un thème</h4>
          <p>Cliquez sur <strong>"Exporter"</strong> pour télécharger la configuration d'un thème en fichier JSON.</p>
          <Tip lang="fr">{{ fr: "Exportez votre thème actuel avant d'en tester un nouveau pour pouvoir revenir en arrière facilement.", en: "", ar: "" }}</Tip>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Theme Customization</h3>
          <p>AJIRCAR offers a complete theme engine to customize your site's appearance.</p>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">Preset Themes</h4>
          <p>Choose from professional themes: Default, Minimal, Bold, Elegant, etc. Click <strong>"Apply"</strong>.</p>
          <h4 className="font-semibold mt-4 mb-2">Color Customization</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Primary Color</strong> – Main site color</li>
            <li><strong>Secondary Color</strong> – Accent color</li>
            <li><strong>Background</strong> – Background color</li>
            <li><strong>Text</strong> – Main text color</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Flat Mode</h4>
          <p>Enable <strong>Flat Mode</strong> to disable all shadows and depth effects.</p>
          <h4 className="font-semibold mt-4 mb-2">Import/Export Themes</h4>
          <p>Import JSON theme files or export your current theme for backup.</p>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">تخصيص القالب</h3>
          <p>يوفر AJIRCAR محرك قوالب متكامل لتخصيص مظهر موقعك.</p>
          <Screenshot lang="ar" />
          <h4 className="font-semibold mt-4 mb-2">القوالب الجاهزة</h4>
          <p>اختر من بين عدة قوالب احترافية وانقر على <strong>"تطبيق"</strong>.</p>
          <h4 className="font-semibold mt-4 mb-2">تخصيص الألوان</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>اللون الأساسي</strong></li>
            <li><strong>اللون الثانوي</strong></li>
            <li><strong>الخلفية</strong></li>
            <li><strong>النص</strong></li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">استيراد / تصدير القوالب</h4>
          <p>استورد ملفات JSON أو صدّر قالبك الحالي.</p>
        </>
      ),
    },
  },

  /* 9 ─ Section Management */
  {
    id: "sections",
    icon: <Layers size={18} />,
    title: { fr: "Gestion des sections", en: "Section Management", ar: "إدارة الأقسام" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion des sections du site</h3>
          <p>Contrôlez les sections affichées sur votre page d'accueil.</p>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Sections disponibles</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Hero</strong> – Bannière principale avec image et CTA</li>
            <li><strong>Véhicules</strong> – Catalogue de votre flotte</li>
            <li><strong>Avantages</strong> – Vos points forts</li>
            <li><strong>Villes</strong> – Zones de couverture</li>
            <li><strong>Estimation</strong> – Calculateur de budget</li>
            <li><strong>À propos</strong> – Présentation de votre agence</li>
            <li><strong>FAQ</strong> – Questions fréquentes</li>
            <li><strong>CTA</strong> – Appel à l'action</li>
            <li><strong>Témoignages</strong> – Avis clients</li>
            <li><strong>Contact</strong> – Formulaire et carte</li>
            <li><strong>Footer</strong> – Pied de page</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Actions possibles</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Activer/Désactiver</strong> – Affichez ou masquez une section</li>
            <li><strong>Réorganiser</strong> – Changez l'ordre d'affichage avec les flèches</li>
            <li><strong>Modifier le contenu</strong> – Éditez les titres et contenus en 3 langues</li>
            <li><strong>Navigation</strong> – Choisissez quelles sections apparaissent dans le menu</li>
          </ul>
          <Note lang="fr">{{ fr: "La désactivation d'une section ne supprime pas son contenu. Vous pouvez la réactiver à tout moment.", en: "", ar: "" }}</Note>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Website Section Management</h3>
          <p>Control the sections displayed on your homepage.</p>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">Available Sections</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Hero, Vehicles, Features, Cities, Estimation, About, FAQ, CTA, Testimonials, Contact, Footer</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Available Actions</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Enable/Disable</strong> – Show or hide a section</li>
            <li><strong>Reorder</strong> – Change display order with arrows</li>
            <li><strong>Edit Content</strong> – Edit titles and content in 3 languages</li>
            <li><strong>Navigation</strong> – Choose which sections appear in the menu</li>
          </ul>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة أقسام الموقع</h3>
          <p>تحكم في الأقسام المعروضة على صفحتك الرئيسية.</p>
          <Screenshot lang="ar" />
          <h4 className="font-semibold mt-4 mb-2">الأقسام المتاحة</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>البطل، المركبات، المزايا، المدن، التقدير، حول، الأسئلة الشائعة، CTA، الشهادات، الاتصال، التذييل</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">الإجراءات المتاحة</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>تفعيل/تعطيل</strong> – إظهار أو إخفاء قسم</li>
            <li><strong>إعادة الترتيب</strong> – تغيير ترتيب العرض</li>
            <li><strong>تعديل المحتوى</strong> – تحرير العناوين بثلاث لغات</li>
          </ul>
        </>
      ),
    },
  },

  /* 10 ─ Contact & Map */
  {
    id: "contact",
    icon: <Phone size={18} />,
    title: { fr: "Contact et carte", en: "Contact & Map", ar: "الاتصال والخريطة" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Configuration du contact</h3>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Informations de contact</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Modifiez le <strong>numéro de téléphone</strong>, <strong>email</strong>, et <strong>adresse</strong></li>
            <li>Configurez les <strong>liens vers les réseaux sociaux</strong></li>
            <li>Ajoutez votre <strong>numéro WhatsApp</strong> pour les réservations</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Agences multiples</h4>
          <Step n={1}>Allez dans <strong>Paramètres → Agences</strong></Step>
          <Step n={2}>Cliquez sur <strong>"Ajouter une agence"</strong></Step>
          <Step n={3}>Renseignez le nom, l'adresse, le téléphone et les coordonnées Google Maps</Step>
          <Step n={4}>La carte interactive se met à jour automatiquement</Step>
          <Tip lang="fr">{{ fr: "L'URL Google Maps est générée automatiquement à partir de l'adresse si vous ne la spécifiez pas.", en: "", ar: "" }}</Tip>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Contact Configuration</h3>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">Contact Information</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Edit <strong>phone</strong>, <strong>email</strong>, and <strong>address</strong></li>
            <li>Configure <strong>social media links</strong></li>
            <li>Add your <strong>WhatsApp number</strong> for bookings</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Multiple Agencies</h4>
          <p>Add multiple agencies with their own addresses and Google Maps locations.</p>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">تكوين الاتصال</h3>
          <Screenshot lang="ar" />
          <ul className="list-disc pl-5 space-y-1">
            <li>تعديل <strong>الهاتف</strong> و<strong>البريد الإلكتروني</strong> و<strong>العنوان</strong></li>
            <li>تكوين <strong>روابط التواصل الاجتماعي</strong></li>
            <li>إضافة <strong>رقم واتساب</strong> للحجوزات</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">وكالات متعددة</h4>
          <p>أضف وكالات متعددة بعناوينها ومواقعها على خرائط جوجل.</p>
        </>
      ),
    },
  },

  /* 11 ─ Multi-Language */
  {
    id: "languages",
    icon: <Languages size={18} />,
    title: { fr: "Système multilingue", en: "Multi-Language System", ar: "نظام متعدد اللغات" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion des langues</h3>
          <p>AJIRCAR supporte nativement 3 langues avec prise en charge RTL pour l'arabe.</p>
          <h4 className="font-semibold mt-4 mb-2">Langues supportées</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Français</strong> (par défaut) – LTR</li>
            <li><strong>Anglais</strong> – LTR</li>
            <li><strong>Arabe</strong> – RTL (direction droite à gauche)</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Modifier les traductions</h4>
          <p>Lors de l'édition des sections (titres, FAQ, témoignages, etc.), vous pouvez basculer entre les langues FR/EN/AR pour éditer chaque version.</p>
          <h4 className="font-semibold mt-4 mb-2">Sélecteur de langue</h4>
          <p>Un sélecteur de langue est automatiquement affiché dans l'en-tête du site pour les visiteurs.</p>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Language Management</h3>
          <p>AJIRCAR natively supports 3 languages with RTL support for Arabic.</p>
          <h4 className="font-semibold mt-4 mb-2">Supported Languages</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>French</strong> (default) – LTR</li>
            <li><strong>English</strong> – LTR</li>
            <li><strong>Arabic</strong> – RTL</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Edit Translations</h4>
          <p>When editing sections, switch between FR/EN/AR tabs to edit each language version.</p>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة اللغات</h3>
          <p>يدعم AJIRCAR 3 لغات مع دعم RTL للعربية.</p>
          <h4 className="font-semibold mt-4 mb-2">اللغات المدعومة</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>الفرنسية</strong> (افتراضي) – LTR</li>
            <li><strong>الإنجليزية</strong> – LTR</li>
            <li><strong>العربية</strong> – RTL</li>
          </ul>
        </>
      ),
    },
  },

  /* 12 ─ Multi-Currency */
  {
    id: "currency",
    icon: <DollarSign size={18} />,
    title: { fr: "Système multi-devises", en: "Multi-Currency System", ar: "نظام متعدد العملات" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion des devises</h3>
          <p>Affichez vos prix dans la devise de votre choix.</p>
          <h4 className="font-semibold mt-4 mb-2">Devises disponibles</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>MAD</strong> – Dirham marocain (DH)</li>
            <li><strong>USD</strong> – Dollar américain ($)</li>
            <li><strong>EUR</strong> – Euro (€)</li>
          </ul>
          <p className="mt-2">Le symbole monétaire se met à jour dynamiquement sur tout le site via un sélecteur dans l'en-tête.</p>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Currency Management</h3>
          <p>Display prices in your preferred currency.</p>
          <h4 className="font-semibold mt-4 mb-2">Available Currencies</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>MAD</strong> – Moroccan Dirham (DH)</li>
            <li><strong>USD</strong> – US Dollar ($)</li>
            <li><strong>EUR</strong> – Euro (€)</li>
          </ul>
          <p className="mt-2">Currency symbol updates dynamically across the entire site via a header selector.</p>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة العملات</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>MAD</strong> – الدرهم المغربي</li>
            <li><strong>USD</strong> – الدولار الأمريكي</li>
            <li><strong>EUR</strong> – اليورو</li>
          </ul>
          <p className="mt-2">يتم تحديث رمز العملة ديناميكيًا عبر الموقع بالكامل.</p>
        </>
      ),
    },
  },

  /* 13 ─ Form Settings */
  {
    id: "forms",
    icon: <FormInput size={18} />,
    title: { fr: "Paramètres des formulaires", en: "Form Settings", ar: "إعدادات النماذج" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Configuration des formulaires</h3>
          <p>Personnalisez les champs affichés dans le formulaire de réservation.</p>
          <h4 className="font-semibold mt-4 mb-2">Champs configurables</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Nom complet</strong> – Activer/Désactiver</li>
            <li><strong>Email</strong> – Activer/Désactiver</li>
            <li><strong>Téléphone</strong> – Activer/Désactiver</li>
            <li><strong>Ville de prise en charge</strong> – Activer/Désactiver</li>
          </ul>
          <p className="mt-2">Accédez à ces paramètres via <strong>Paramètres du site → Formulaire de réservation</strong>.</p>
          <Note lang="fr">{{ fr: "Au moins un champ de contact (email ou téléphone) doit rester actif pour recevoir les demandes.", en: "", ar: "" }}</Note>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Form Configuration</h3>
          <p>Customize which fields appear in the booking form.</p>
          <h4 className="font-semibold mt-4 mb-2">Configurable Fields</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Full Name</strong> – Enable/Disable</li>
            <li><strong>Email</strong> – Enable/Disable</li>
            <li><strong>Phone</strong> – Enable/Disable</li>
            <li><strong>Pickup City</strong> – Enable/Disable</li>
          </ul>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">تكوين النماذج</h3>
          <p>خصص الحقول المعروضة في نموذج الحجز.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>الاسم الكامل</strong></li>
            <li><strong>البريد الإلكتروني</strong></li>
            <li><strong>الهاتف</strong></li>
            <li><strong>مدينة الاستلام</strong></li>
          </ul>
        </>
      ),
    },
  },

  /* 14 ─ Media */
  {
    id: "media",
    icon: <Image size={18} />,
    title: { fr: "Gestion des médias", en: "Media Management", ar: "إدارة الوسائط" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion des images et médias</h3>
          <h4 className="font-semibold mt-4 mb-2">Téléchargement d'images</h4>
          <p>Les images peuvent être ajoutées de deux manières :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Par URL</strong> – Collez un lien direct vers l'image</li>
            <li><strong>Par téléchargement</strong> – Utilisez le bouton de téléchargement pour charger un fichier depuis votre ordinateur</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Types d'images</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Logo</strong> – Logo de votre agence (dans les paramètres)</li>
            <li><strong>Favicon</strong> – Icône du navigateur</li>
            <li><strong>Images véhicules</strong> – Photos de votre flotte</li>
            <li><strong>Images villes</strong> – Photos hero pour chaque ville</li>
            <li><strong>Avatars témoignages</strong> – Photos des clients</li>
          </ul>
          <Tip lang="fr">{{ fr: "Utilisez des images optimisées (WebP ou JPEG compressé) pour un chargement rapide du site.", en: "", ar: "" }}</Tip>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Image & Media Management</h3>
          <h4 className="font-semibold mt-4 mb-2">Image Upload</h4>
          <p>Images can be added in two ways:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>By URL</strong> – Paste a direct image link</li>
            <li><strong>By Upload</strong> – Use the upload button to load a file from your computer</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Image Types</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Logo, Favicon, Vehicle images, City hero images, Testimonial avatars</li>
          </ul>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة الصور والوسائط</h3>
          <h4 className="font-semibold mt-4 mb-2">تحميل الصور</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>عبر الرابط</strong> – الصق رابط مباشر للصورة</li>
            <li><strong>عبر التحميل</strong> – استخدم زر التحميل</li>
          </ul>
        </>
      ),
    },
  },

  /* 15 ─ User Roles */
  {
    id: "roles",
    icon: <Users size={18} />,
    title: { fr: "Rôles utilisateurs", en: "User Roles", ar: "أدوار المستخدمين" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Gestion des accès</h3>
          <h4 className="font-semibold mt-4 mb-2">Administrateur</h4>
          <p>L'administrateur a un accès complet à toutes les fonctionnalités du panneau d'administration :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestion complète de la flotte</li>
            <li>Gestion des réservations</li>
            <li>Configuration du site et des thèmes</li>
            <li>Gestion des paramètres</li>
          </ul>
          <Note lang="fr">{{ fr: "Dans la version actuelle, un seul compte administrateur est disponible. La gestion multi-utilisateurs sera disponible dans une future mise à jour.", en: "", ar: "" }}</Note>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Access Management</h3>
          <h4 className="font-semibold mt-4 mb-2">Administrator</h4>
          <p>The administrator has full access to all admin panel features.</p>
          <Note lang="en">{{ fr: "", en: "In the current version, only one admin account is available. Multi-user management will be available in a future update.", ar: "" }}</Note>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">إدارة الوصول</h3>
          <h4 className="font-semibold mt-4 mb-2">المسؤول</h4>
          <p>يتمتع المسؤول بوصول كامل لجميع ميزات لوحة الإدارة.</p>
        </>
      ),
    },
  },

  /* 16 ─ SEO */
  {
    id: "seo",
    icon: <Search size={18} />,
    title: { fr: "Paramètres SEO", en: "SEO Settings", ar: "إعدادات SEO" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Optimisation pour les moteurs de recherche</h3>
          <Screenshot lang="fr" />
          <h4 className="font-semibold mt-4 mb-2">Paramètres disponibles</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Meta Title</strong> – Titre affiché dans les résultats de recherche (max 60 caractères)</li>
            <li><strong>Meta Description</strong> – Description du site (max 160 caractères)</li>
            <li><strong>Open Graph Image</strong> – Image de partage sur les réseaux sociaux</li>
          </ul>
          <p className="mt-2">Accédez à ces paramètres via <strong>Paramètres du site → SEO</strong>.</p>
          <Tip lang="fr">{{ fr: "Incluez votre ville principale et le mot 'location de voiture' dans votre meta title pour un meilleur référencement local.", en: "", ar: "" }}</Tip>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Search Engine Optimization</h3>
          <Screenshot lang="en" />
          <h4 className="font-semibold mt-4 mb-2">Available Settings</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Meta Title</strong> – Title shown in search results (max 60 chars)</li>
            <li><strong>Meta Description</strong> – Site description (max 160 chars)</li>
            <li><strong>Open Graph Image</strong> – Social media sharing image</li>
          </ul>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">تحسين محركات البحث</h3>
          <Screenshot lang="ar" />
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>عنوان الميتا</strong> – العنوان في نتائج البحث</li>
            <li><strong>وصف الميتا</strong> – وصف الموقع</li>
            <li><strong>صورة Open Graph</strong> – صورة المشاركة</li>
          </ul>
        </>
      ),
    },
  },

  /* 17 ─ Security */
  {
    id: "security",
    icon: <Shield size={18} />,
    title: { fr: "Sécurité", en: "Security", ar: "الأمان" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Sécurité du système</h3>
          <h4 className="font-semibold mt-4 mb-2">Bonnes pratiques</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Changez le mot de passe par défaut dès la première connexion</li>
            <li>Utilisez un mot de passe fort (min. 8 caractères, majuscules, chiffres)</li>
            <li>Ne partagez jamais vos identifiants de connexion</li>
            <li>Déconnectez-vous après chaque session d'administration</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Protection du site</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Le panneau d'administration est protégé par authentification</li>
            <li>Les sessions sont gérées de manière sécurisée</li>
            <li>Aucune donnée sensible n'est exposée côté client</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Sauvegarde</h4>
          <p>Exportez régulièrement vos thèmes et configurations pour créer des sauvegardes.</p>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">System Security</h3>
          <h4 className="font-semibold mt-4 mb-2">Best Practices</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Change the default password after first login</li>
            <li>Use a strong password (min 8 chars, mixed case, numbers)</li>
            <li>Never share your login credentials</li>
            <li>Log out after each admin session</li>
          </ul>
          <h4 className="font-semibold mt-4 mb-2">Backup</h4>
          <p>Regularly export themes and configurations for backups.</p>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">أمان النظام</h3>
          <h4 className="font-semibold mt-4 mb-2">أفضل الممارسات</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>غيّر كلمة المرور الافتراضية بعد أول تسجيل دخول</li>
            <li>استخدم كلمة مرور قوية</li>
            <li>لا تشارك بيانات الدخول أبدًا</li>
            <li>سجّل الخروج بعد كل جلسة</li>
          </ul>
        </>
      ),
    },
  },

  /* 18 ─ FAQ & Troubleshooting */
  {
    id: "faq",
    icon: <HelpCircle size={18} />,
    title: { fr: "FAQ et dépannage", en: "FAQ & Troubleshooting", ar: "الأسئلة الشائعة واستكشاف الأخطاء" },
    content: {
      fr: (
        <>
          <h3 className="text-lg font-semibold mb-3">Questions fréquentes</h3>
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q : Comment changer le logo de mon site ?</p>
              <p className="text-muted-foreground">R : Allez dans Paramètres du site → Branding → Logo. Uploadez votre logo ou collez l'URL.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q : Comment ajouter une nouvelle ville ?</p>
              <p className="text-muted-foreground">R : Paramètres du site → Villes → Ajouter une ville. Renseignez le nom en 3 langues et une image.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q : Puis-je cacher une section sans la supprimer ?</p>
              <p className="text-muted-foreground">R : Oui, dans Sections, utilisez le toggle pour désactiver une section. Son contenu est conservé.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q : Le site est lent, que faire ?</p>
              <p className="text-muted-foreground">R : Optimisez vos images (format WebP, taille &lt; 500KB), désactivez les animations si nécessaire, et limitez le nombre de véhicules affichés.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q : Comment changer la langue par défaut ?</p>
              <p className="text-muted-foreground">R : Le français est la langue par défaut. Les visiteurs peuvent changer via le sélecteur de langue dans l'en-tête.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q : J'ai oublié mon mot de passe, que faire ?</p>
              <p className="text-muted-foreground">R : Contactez le support technique pour une réinitialisation de mot de passe.</p>
            </div>
          </div>
          <h4 className="font-semibold mt-6 mb-2">Erreurs courantes</h4>
          <div className="space-y-3">
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1 text-red-400">Les images ne s'affichent pas</p>
              <p className="text-muted-foreground">Vérifiez que l'URL de l'image est accessible publiquement. Si vous utilisez le téléchargement, vérifiez que le fichier fait moins de 5MB.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1 text-red-400">Le thème importé ne s'applique pas</p>
              <p className="text-muted-foreground">Vérifiez que le fichier JSON est valide et contient les champs requis (name, overrides).</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1 text-red-400">La carte Google Maps ne s'affiche pas</p>
              <p className="text-muted-foreground">Assurez-vous que l'URL embed de Google Maps est correcte et commence par https://www.google.com/maps/embed</p>
            </div>
          </div>
        </>
      ),
      en: (
        <>
          <h3 className="text-lg font-semibold mb-3">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q: How do I change my site logo?</p>
              <p className="text-muted-foreground">A: Go to Site Settings → Branding → Logo. Upload or paste the URL.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q: How do I add a new city?</p>
              <p className="text-muted-foreground">A: Site Settings → Cities → Add City. Fill in the name in 3 languages and an image.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q: Can I hide a section without deleting it?</p>
              <p className="text-muted-foreground">A: Yes, use the toggle in Sections to disable it. Content is preserved.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">Q: The site is slow, what should I do?</p>
              <p className="text-muted-foreground">A: Optimize images (WebP, &lt;500KB), disable animations if needed, limit displayed vehicles.</p>
            </div>
          </div>
          <h4 className="font-semibold mt-6 mb-2">Common Errors</h4>
          <div className="space-y-3">
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1 text-red-400">Images not displaying</p>
              <p className="text-muted-foreground">Verify the URL is publicly accessible and files are under 5MB.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1 text-red-400">Imported theme not applying</p>
              <p className="text-muted-foreground">Ensure the JSON file is valid and contains required fields (name, overrides).</p>
            </div>
          </div>
        </>
      ),
      ar: (
        <>
          <h3 className="text-lg font-semibold mb-3">الأسئلة الشائعة</h3>
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">س: كيف أغير شعار موقعي؟</p>
              <p className="text-muted-foreground">ج: انتقل إلى إعدادات الموقع ← العلامة التجارية ← الشعار.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">س: كيف أضيف مدينة جديدة؟</p>
              <p className="text-muted-foreground">ج: إعدادات الموقع ← المدن ← إضافة مدينة.</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1">س: هل يمكنني إخفاء قسم بدون حذفه؟</p>
              <p className="text-muted-foreground">ج: نعم، استخدم مفتاح التبديل في الأقسام لتعطيله. يتم الحفاظ على المحتوى.</p>
            </div>
          </div>
          <h4 className="font-semibold mt-6 mb-2">الأخطاء الشائعة</h4>
          <div className="space-y-3">
            <div className="border border-border rounded-lg p-4">
              <p className="font-semibold mb-1 text-red-400">الصور لا تظهر</p>
              <p className="text-muted-foreground">تحقق من أن الرابط متاح للعامة وأن الملف أقل من 5MB.</p>
            </div>
          </div>
        </>
      ),
    },
  },
];

const Documentation = () => {
  const [lang, setLang] = useState<Lang>("fr");
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const isRTL = lang === "ar";

  useEffect(() => {
    document.title = "AJIRCAR – Documentation";
  }, []);

  const filteredSections = searchQuery
    ? sections.filter(s => t(s.title, lang).toLowerCase().includes(searchQuery.toLowerCase()))
    : sections;

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className={`min-h-screen bg-background text-foreground ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 h-14 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-muted">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              <span className="font-bold text-lg">AJIRCAR</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Docs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-0.5">
              {(["fr", "en", "ar"] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/10"}`}
                >
                  {l === "fr" ? "FR" : l === "en" ? "EN" : "AR"}
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">{t(ui.backToSite, lang)}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-72 border-e border-border bg-background
          overflow-y-auto transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"} lg:translate-x-0
        `}>
          <div className="p-4">
            <div className="relative mb-4">
              <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(ui.search, lang)}
                className={`w-full bg-muted border-0 rounded-lg text-sm py-2 ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"} focus:outline-none focus:ring-2 focus:ring-primary/30`}
              />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-medium">
              {t(ui.tableOfContents, lang)}
            </p>
            <nav className="space-y-0.5">
              {filteredSections.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSection(s.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-start ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {s.icon}
                  <span className="truncate">{t(s.title, lang)}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 lg:py-12">
          {currentSection && (
            <article className="max-w-3xl mx-auto">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                <span>{t(ui.title, lang)}</span>
                <ChevronRight size={12} />
                <span className="text-foreground font-medium">{t(currentSection.title, lang)}</span>
              </div>

              {/* Section title */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  {currentSection.icon}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">{t(currentSection.title, lang)}</h1>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none text-foreground
                [&_h3]:text-foreground [&_h4]:text-foreground
                [&_p]:text-muted-foreground [&_p]:leading-relaxed
                [&_li]:text-muted-foreground
                [&_strong]:text-foreground
                [&_code]:bg-muted [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
                [&_ul]:space-y-1 [&_ol]:space-y-1
              ">
                {currentSection.content[lang]}
              </div>

              {/* Navigation */}
              <div className="mt-12 pt-6 border-t border-border flex justify-between">
                {(() => {
                  const idx = sections.findIndex(s => s.id === activeSection);
                  const prev = idx > 0 ? sections[idx - 1] : null;
                  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
                  return (
                    <>
                      {prev ? (
                        <button onClick={() => setActiveSection(prev.id)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <ChevronRight size={14} className={isRTL ? "" : "rotate-180"} />
                          {t(prev.title, lang)}
                        </button>
                      ) : <div />}
                      {next ? (
                        <button onClick={() => setActiveSection(next.id)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {t(next.title, lang)}
                          <ChevronRight size={14} className={isRTL ? "rotate-180" : ""} />
                        </button>
                      ) : <div />}
                    </>
                  );
                })()}
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  );
};

export default Documentation;
