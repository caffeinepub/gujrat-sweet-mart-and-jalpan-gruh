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
    emoji: "🍬",
    desc: "Traditional Indian mithai made with love",
    gradient: "from-primary via-primary/70 to-secondary/50",
    hoverShadow: "hover:shadow-glow-primary",
  },
  {
    key: "snacks",
    label: "Snacks",
    emoji: "🥜",
    desc: "Crispy and flavorful snacks for any time",
    gradient: "from-secondary via-secondary/70 to-accent/50",
    hoverShadow: "hover:shadow-glow-secondary",
  },
  {
    key: "namkeen",
    label: "Namkeen",
    emoji: "🧂",
    desc: "Savory treats with authentic spices",
    gradient: "from-accent via-accent/70 to-primary/50",
    hoverShadow: "hover:shadow-glow-accent",
  },
  {
    key: "beverages",
    label: "Beverages",
    emoji: "🥤",
    desc: "Refreshing drinks and traditional beverages",
    gradient: "from-blue-600 via-blue-500/80 to-cyan-500/50",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]",
  },
  {
    key: "cookies",
    label: "Cookies",
    emoji: "🍪",
    desc: "Freshly baked cookies and biscuits",
    gradient: "from-amber-600 via-amber-500/80 to-primary/50",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(217,119,6,0.6)]",
  },
  {
    key: "accompaniments",
    label: "Accompaniments",
    emoji: "🫙",
    desc: "Perfect sides and accompaniments",
    gradient: "from-emerald-600 via-emerald-500/80 to-teal-500/50",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(5,150,105,0.6)]",
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
        <div className="absolute inset-0 pattern-border opacity-20" />

        {/* Floating festive decorations */}
        <div className="absolute top-4 left-8 text-4xl animate-diya-flicker opacity-60 select-none pointer-events-none">
          🪔
        </div>
        <div
          className="absolute top-8 right-12 text-3xl animate-float opacity-50 select-none pointer-events-none"
          style={{ animationDelay: "0.5s" }}
        >
          ✨
        </div>
        <div className="absolute bottom-12 left-16 text-3xl animate-spin-slow opacity-30 select-none pointer-events-none">
          🌸
        </div>
        <div
          className="absolute bottom-8 right-8 text-4xl animate-float opacity-50 select-none pointer-events-none"
          style={{ animationDelay: "1s" }}
        >
          ⭐
        </div>
        <div
          className="absolute top-1/2 left-4 text-2xl animate-diya-flicker opacity-40 select-none pointer-events-none"
          style={{ animationDelay: "0.8s" }}
        >
          🎆
        </div>
        <div
          className="absolute top-1/3 right-4 text-2xl animate-float opacity-35 select-none pointer-events-none"
          style={{ animationDelay: "1.3s" }}
        >
          🎊
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 animate-scale-in">
              {configLoading ? (
                <Skeleton className="w-full h-48 rounded-2xl" />
              ) : logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Gujrat Sweet Mart Banner"
                  className="w-full h-auto rounded-2xl shadow-paisley object-cover max-h-[400px] border border-primary/20"
                />
              ) : (
                <img
                  src="/assets/generated/shop-banner.dim_1200x400.png"
                  alt="Gujrat Sweet Mart Banner"
                  className="w-full h-auto rounded-2xl shadow-paisley border border-primary/20"
                />
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gold-shimmer mb-4 leading-tight">
              Gujrat Sweet Mart and Jalpan Gruh
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Experience the authentic taste of Gujarat with our handcrafted
              sweets, savory snacks, and traditional namkeen. Made with love and
              the finest ingredients.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-full font-bold text-lg hover:bg-accent/90 transition-all duration-300 shadow-glow-accent hover:scale-105 animate-fade-in-up delay-300 animate-glow-pulse"
            >
              Explore Our Products
              <ArrowRight className="h-5 w-5 animate-bounce" />
            </Link>
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
              <div className="group bg-card rounded-2xl p-6 card-festive flex flex-col items-center text-center gap-3 animate-bounce-in delay-100 hover:shadow-glow-primary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:animate-sparkle-pop">
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
              <div className="group bg-card rounded-2xl p-6 card-festive flex flex-col items-center text-center gap-3 animate-bounce-in delay-200 hover:shadow-glow-secondary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:animate-sparkle-pop">
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
              <div className="group bg-card rounded-2xl p-6 card-festive flex flex-col items-center text-center gap-3 animate-bounce-in delay-300 hover:shadow-glow-accent transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:animate-sparkle-pop">
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
            <div className="text-center p-8 bg-card rounded-2xl card-festive animate-bounce-in delay-100 group hover:shadow-glow-primary transition-all duration-300 hover:-translate-y-1">
              <div className="text-6xl mb-4 group-hover:animate-wiggle inline-block select-none drop-shadow-lg">
                🏺
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                Authentic Recipes
              </h3>
              <p className="text-muted-foreground">
                Traditional recipes passed down through generations
              </p>
            </div>
            <div className="text-center p-8 bg-card rounded-2xl card-festive animate-bounce-in delay-200 group hover:shadow-glow-secondary transition-all duration-300 hover:-translate-y-1">
              <div className="text-6xl mb-4 group-hover:animate-wiggle inline-block select-none drop-shadow-lg">
                🌿
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                Fresh Daily
              </h3>
              <p className="text-muted-foreground">
                Made fresh every day with premium ingredients
              </p>
            </div>
            <div className="text-center p-8 bg-card rounded-2xl card-festive animate-bounce-in delay-300 group hover:shadow-glow-accent transition-all duration-300 hover:-translate-y-1">
              <div className="text-6xl mb-4 group-hover:animate-wiggle inline-block select-none drop-shadow-lg">
                🎊
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                Wide Variety
              </h3>
              <p className="text-muted-foreground">
                From sweets to savory, something for everyone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk Order CTA Banner */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary/80 to-accent text-white shadow-glow-accent hover:scale-[1.01] transition-transform duration-300">
            {/* Dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 80%, white 1px, transparent 1px), radial-gradient(circle at 90% 20%, white 1px, transparent 1px), radial-gradient(circle at 50% 50%, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
            {/* Glowing edge highlight */}
            <div className="absolute inset-0 rounded-3xl ring-2 ring-white/20 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-12">
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm animate-glow-pulse p-4">
                  <PackagePlus className="h-9 w-9 text-white drop-shadow-lg" />
                </div>
                <div>
                  {/* Pulsing special pricing badge */}
                  <span className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-2 animate-glow-pulse border border-white/30">
                    🎉 Special Pricing Available!
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
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-md hover:shadow-xl text-base hover:scale-105 active:scale-95"
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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-gold-shimmer animate-fade-in-up">
            Our Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.key}
                to="/products"
                search={{ category: cat.key }}
                className={`group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer block animate-tilt-in ${STAGGER_DELAYS[idx]} ${cat.hoverShadow} hover:-translate-y-2 hover:scale-[1.04] transition-all duration-300`}
                data-ocid={`home.${cat.key}.link`}
              >
                <div
                  className={`aspect-[3/4] bg-gradient-to-br ${cat.gradient} flex flex-col items-center justify-center gap-3 p-6 relative`}
                >
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-all duration-300" />
                  <span className="text-5xl md:text-6xl group-hover:animate-wiggle select-none drop-shadow-lg relative z-10">
                    {cat.emoji}
                  </span>
                  <h3
                    className="text-xl md:text-2xl font-display font-bold text-white text-center drop-shadow-lg relative z-10"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                  >
                    {cat.label}
                  </h3>
                  <p
                    className="text-xs md:text-sm text-white text-center relative z-10 drop-shadow-md font-medium"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
                  >
                    {cat.desc}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white bg-white/25 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10 backdrop-blur-sm">
                    Browse →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
