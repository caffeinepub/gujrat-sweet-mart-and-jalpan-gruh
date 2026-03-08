import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, PackagePlus, Phone } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { useGetHomepageConfig } from "../hooks/useHomepageConfig";

const DEFAULT_ADDRESS =
  "Visanji Nagar, Jaikisan Wadi, Jalgaon, Maharashtra 425001";
const DEFAULT_PHONE = "078751 99999";
const DEFAULT_HOURS = [
  { day: "Monday", hours: "7 am–10 pm" },
  { day: "Tuesday", hours: "7 am–10 pm" },
  { day: "Wednesday", hours: "7 am–10 pm" },
  { day: "Thursday", hours: "7 am–10 pm" },
  { day: "Friday", hours: "7 am–10 pm" },
  { day: "Saturday", hours: "7 am–10 pm" },
  { day: "Sunday", hours: "7 am–10 pm" },
];

const CATEGORIES = [
  {
    key: "sweets",
    label: "Sweets",
    desc: "Traditional Indian mithai made with love",
    accentClass: "border-primary/60 hover:border-primary",
    labelClass: "text-primary drop-shadow-sm",
    bgClass: "bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5",
    hoverShadow: "hover-glow-primary",
    iconEmoji: "🍮",
  },
  {
    key: "snacks",
    label: "Snacks",
    desc: "Crispy, flavorful bites for any time",
    accentClass: "border-pink-400/60 hover:border-pink-400",
    labelClass: "text-pink-400 drop-shadow-sm",
    bgClass:
      "bg-gradient-to-br from-pink-500/30 via-secondary/20 to-pink-500/5",
    hoverShadow: "hover:shadow-[0_8px_32px_rgba(236,72,153,0.35)]",
    iconEmoji: "🍿",
  },
  {
    key: "namkeen",
    label: "Namkeen",
    desc: "Savory treats with authentic spices",
    accentClass: "border-emerald-400/60 hover:border-emerald-400",
    labelClass: "text-emerald-400 drop-shadow-sm",
    bgClass:
      "bg-gradient-to-br from-emerald-500/30 via-accent/20 to-emerald-500/5",
    hoverShadow: "hover:shadow-[0_8px_32px_rgba(52,211,153,0.35)]",
    iconEmoji: "🌶️",
  },
  {
    key: "beverages",
    label: "Beverages",
    desc: "Refreshing drinks and traditional sherbets",
    accentClass: "border-blue-400/60 hover:border-blue-400",
    labelClass: "text-blue-400 drop-shadow-sm",
    bgClass: "bg-gradient-to-br from-blue-500/30 via-blue-400/15 to-blue-500/5",
    hoverShadow: "hover:shadow-[0_8px_32px_rgba(96,165,250,0.35)]",
    iconEmoji: "🥤",
  },
  {
    key: "cookies",
    label: "Cookies",
    desc: "Freshly baked cookies and biscuits",
    accentClass: "border-amber-400/60 hover:border-amber-400",
    labelClass: "text-amber-400 drop-shadow-sm",
    bgClass:
      "bg-gradient-to-br from-amber-500/30 via-amber-400/15 to-amber-500/5",
    hoverShadow: "hover:shadow-[0_8px_32px_rgba(251,191,36,0.35)]",
    iconEmoji: "🍪",
  },
  {
    key: "accompaniments",
    label: "Accompaniments",
    desc: "Perfect sides and condiments",
    accentClass: "border-violet-400/60 hover:border-violet-400",
    labelClass: "text-violet-400 drop-shadow-sm",
    bgClass:
      "bg-gradient-to-br from-violet-500/30 via-violet-400/15 to-violet-500/5",
    hoverShadow: "hover:shadow-[0_8px_32px_rgba(167,139,250,0.35)]",
    iconEmoji: "🫙",
  },
];

const STAGGER_DELAYS = [
  "delay-100",
  "delay-200",
  "delay-300",
  "delay-400",
  "delay-500",
  "delay-600",
];

export default function Home() {
  const { data: homepageConfig, isLoading: configLoading } =
    useGetHomepageConfig();

  const logoUrl = homepageConfig?.logo
    ? homepageConfig.logo.getDirectURL()
    : null;
  const address = homepageConfig?.address || DEFAULT_ADDRESS;
  const phone = homepageConfig?.phone || DEFAULT_PHONE;
  const hoursText = homepageConfig?.hours || null;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-mandala bg-festival">
        {/* Subtle geometric corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-primary/20 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-secondary/20 rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-accent/15 rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-primary/15 rounded-br-2xl pointer-events-none" />

        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 animate-fade-in-up">
              {configLoading ? (
                <Skeleton className="w-full h-48 rounded-2xl" />
              ) : logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Gujrat Sweet Mart Banner"
                  className="w-full h-auto rounded-2xl object-cover max-h-[400px] border border-primary/20 shadow-[0_8px_48px_oklch(var(--primary)/0.18)]"
                />
              ) : (
                <img
                  src="/assets/generated/shop-banner.dim_1200x400.png"
                  alt="Gujrat Sweet Mart Banner"
                  className="w-full h-auto rounded-2xl border border-primary/20 shadow-[0_8px_48px_oklch(var(--primary)/0.18)]"
                />
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gold-shimmer mb-4 leading-tight animate-fade-in-up delay-100">
              Gujrat Sweet Mart and Jalpan Gruh
            </h1>
            <p className="text-lg md:text-xl text-foreground/75 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Experience the authentic taste of Gujarat with our handcrafted
              sweets, savory snacks, and traditional namkeen. Made with love and
              the finest ingredients.
            </p>
            <div className="animate-fade-in-up delay-300">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-primary/90 transition-all duration-200 shadow-[0_4px_20px_oklch(var(--primary)/0.35)] hover:shadow-[0_6px_28px_oklch(var(--primary)/0.45)] hover:-translate-y-0.5"
              >
                Explore Our Products
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Business Info Section */}
      <section
        className="py-12 border-y border-primary/20"
        style={{ background: "oklch(0.22 0.04 35)" }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-gold-shimmer mb-8">
              Visit Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Address */}
              <div className="group bg-card rounded-2xl p-6 card-festive flex flex-col items-center text-center gap-3 animate-fade-in-up delay-100 hover-glow-primary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1 text-foreground">
                    Address
                  </h3>
                  {configLoading ? (
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40 mx-auto" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {address}
                    </p>
                  )}
                </div>
              </div>

              {/* Hours */}
              <div className="group bg-card rounded-2xl p-6 card-festive flex flex-col items-center text-center gap-3 animate-fade-in-up delay-200 hover-glow-secondary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div className="w-full">
                  <h3 className="font-display font-bold text-lg mb-2 text-foreground">
                    Hours
                  </h3>
                  {configLoading ? (
                    <div className="space-y-1">
                      {["mon", "tue", "wed", "thu"].map((day) => (
                        <Skeleton key={day} className="h-4 w-36 mx-auto" />
                      ))}
                    </div>
                  ) : hoursText ? (
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {hoursText}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {DEFAULT_HOURS.map(({ day, hours }) => (
                        <div
                          key={day}
                          className="flex justify-between text-sm gap-4"
                        >
                          <span className="text-muted-foreground font-medium">
                            {day}
                          </span>
                          <span className="text-foreground">{hours}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="group bg-card rounded-2xl p-6 card-festive flex flex-col items-center text-center gap-3 animate-fade-in-up delay-300 hover-glow-accent transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1 text-foreground">
                    Phone
                  </h3>
                  {configLoading ? (
                    <Skeleton className="h-5 w-32 mx-auto" />
                  ) : (
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="text-primary font-bold text-lg hover:underline hover:text-primary/80 transition-colors"
                    >
                      {phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-card rounded-2xl card-festive animate-fade-in-up delay-100 group hover-glow-primary transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/15 flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-3xl select-none">🏺</span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                Authentic Recipes
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Traditional recipes passed down through generations
              </p>
            </div>
            <div className="text-center p-8 bg-card rounded-2xl card-festive animate-fade-in-up delay-200 group hover-glow-secondary transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-secondary/15 flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-3xl select-none">🌿</span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                Fresh Daily
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Made fresh every day with premium ingredients
              </p>
            </div>
            <div className="text-center p-8 bg-card rounded-2xl card-festive animate-fade-in-up delay-300 group hover-glow-accent transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent/15 flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-3xl select-none">🎁</span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                Wide Variety
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                From sweets to savory, something for everyone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk Order CTA Banner */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div
            className="relative overflow-hidden rounded-3xl text-white hover:scale-[1.01] transition-transform duration-300"
            style={{
              background:
                "linear-gradient(135deg, #f59e0b 0%, #ef4444 22%, #ec4899 44%, #8b5cf6 66%, #06b6d4 88%, #10b981 100%)",
              boxShadow:
                "0 0 40px 8px rgba(245,158,11,0.35), 0 0 80px 16px rgba(236,72,153,0.2)",
            }}
          >
            {/* Animated diagonal stripe overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, white 0px, white 2px, transparent 2px, transparent 24px)",
              }}
            />
            {/* Confetti dots */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 8% 75%, white 2px, transparent 2px), radial-gradient(circle at 92% 18%, white 2px, transparent 2px), radial-gradient(circle at 45% 55%, white 1.5px, transparent 1.5px), radial-gradient(circle at 75% 85%, white 1.5px, transparent 1.5px), radial-gradient(circle at 25% 20%, white 2px, transparent 2px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Glowing edge highlight */}
            <div className="absolute inset-0 rounded-3xl ring-2 ring-white/30 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-12">
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm p-4">
                  <PackagePlus className="h-9 w-9 text-white drop-shadow-lg" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-yellow-300 text-yellow-900 text-xs font-black px-3 py-1 rounded-full mb-2 shadow-md tracking-wide uppercase">
                    ✨ Special Pricing Available
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-1 drop-shadow-md">
                    Need Bulk Quantities?
                  </h2>
                  <p className="text-white/90 text-sm md:text-base max-w-md">
                    For weddings, festivals, corporate events &amp; more — get
                    special pricing on large orders. Just send us a WhatsApp!
                  </p>
                </div>
              </div>
              <Link
                to="/bulk-order"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-orange-600 font-black px-8 py-3.5 rounded-full hover:bg-yellow-50 transition-all shadow-lg hover:shadow-2xl text-base hover:scale-105 active:scale-95 border-2 border-white"
                data-ocid="home.bulk_order_button"
              >
                Place Bulk Order
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-2 text-gold-shimmer animate-fade-in-up">
            Our Categories
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10 animate-fade-in-up delay-100">
            Explore our full range of handcrafted sweets and snacks
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.key}
                to="/products"
                search={{ category: cat.key }}
                className={`group relative overflow-hidden rounded-xl border-2 ${cat.accentClass} ${cat.bgClass} ${cat.hoverShadow} cursor-pointer block animate-fade-in-up ${STAGGER_DELAYS[idx]} hover:-translate-y-1.5 transition-all duration-300`}
                data-ocid={`home.${cat.key}.link`}
              >
                <div className="p-6 md:p-8 flex flex-col justify-between min-h-[160px] md:min-h-[200px]">
                  <div>
                    <div className="text-3xl mb-3 select-none">
                      {cat.iconEmoji}
                    </div>
                    <h3
                      className={`text-xl md:text-2xl font-display font-bold mb-2 ${cat.labelClass}`}
                    >
                      {cat.label}
                    </h3>
                    <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-foreground/50 group-hover:text-foreground/80 transition-colors duration-200">
                    <span>Browse all</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
