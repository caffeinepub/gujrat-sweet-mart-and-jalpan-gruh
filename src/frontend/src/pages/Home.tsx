import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  GlassWater,
  MapPin,
  PackagePlus,
  Phone,
  Sparkles,
} from "lucide-react";
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
      <section className="relative overflow-hidden bg-mandala">
        <div className="absolute inset-0 pattern-border opacity-30" />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 animate-scale-in">
              {configLoading ? (
                <Skeleton className="w-full h-48 rounded-lg" />
              ) : logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Gujrat Sweet Mart Banner"
                  className="w-full h-auto rounded-lg shadow-paisley object-cover max-h-[400px]"
                />
              ) : (
                <img
                  src="/assets/generated/shop-banner.dim_1200x400.png"
                  alt="Gujrat Sweet Mart Banner"
                  className="w-full h-auto rounded-lg shadow-paisley"
                />
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-shimmer mb-4">
              Gujrat Sweet Mart and Jalpan Gruh
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Experience the authentic taste of Gujarat with our handcrafted
              sweets, savory snacks, and traditional namkeen. Made with love and
              the finest ingredients.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-glow-primary hover:scale-105 animate-fade-in-up delay-300"
            >
              Explore Our Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Business Info Section */}
      <section className="py-12 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-primary mb-8">
              Visit Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Address */}
              <div className="group bg-card rounded-xl p-6 shadow-sm border border-primary/10 flex flex-col items-center text-center gap-3 animate-fade-in-up delay-100 hover:shadow-glow-primary transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">
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
              <div className="group bg-card rounded-xl p-6 shadow-sm border border-primary/10 flex flex-col items-center text-center gap-3 animate-fade-in-up delay-200 hover:shadow-glow-secondary transition-all duration-300">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div className="w-full">
                  <h3 className="font-display font-bold text-lg mb-2">Hours</h3>
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
              <div className="group bg-card rounded-xl p-6 shadow-sm border border-primary/10 flex flex-col items-center text-center gap-3 animate-fade-in-up delay-300 hover:shadow-glow-accent transition-all duration-300">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Phone</h3>
                  {configLoading ? (
                    <Skeleton className="h-5 w-32 mx-auto" />
                  ) : (
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="text-primary font-semibold text-lg hover:underline"
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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-lg shadow-sm animate-fade-in-up delay-100 group hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-primary group-hover:animate-float" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">
                Authentic Recipes
              </h3>
              <p className="text-muted-foreground">
                Traditional recipes passed down through generations
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-sm animate-fade-in-up delay-200 group hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-secondary group-hover:animate-float" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">
                Fresh Daily
              </h3>
              <p className="text-muted-foreground">
                Made fresh every day with premium ingredients
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-sm animate-fade-in-up delay-300 group hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-accent group-hover:animate-float" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-500 to-orange-500 text-white shadow-xl hover:scale-[1.01] transition-transform duration-300">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 80%, white 1px, transparent 1px), radial-gradient(circle at 90% 20%, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm animate-pulse-glow">
                  <PackagePlus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-1">
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
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-green-700 font-bold px-7 py-3 rounded-full hover:bg-green-50 transition-all shadow-md hover:shadow-lg text-base"
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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 animate-fade-in-up">
            Our Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {/* Sweets */}
            <Link
              to="/products"
              search={{ category: "sweets" }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block animate-scale-in delay-100 hover:scale-[1.03] hover-glow-primary"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500">
                <h3 className="text-2xl font-display font-bold text-primary transition-transform group-hover:scale-105 duration-300">
                  Sweets
                </h3>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Delicious traditional Indian sweets
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Sweets <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* Snacks */}
            <Link
              to="/products"
              search={{ category: "snacks" }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block animate-scale-in delay-200 hover:scale-[1.03] hover-glow-secondary"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:from-secondary/30 group-hover:to-secondary/10 transition-all duration-500">
                <h3 className="text-2xl font-display font-bold text-secondary transition-transform group-hover:scale-105 duration-300">
                  Snacks
                </h3>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Crispy and flavorful snacks for any time
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Snacks <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* Namkeen */}
            <Link
              to="/products"
              search={{ category: "namkeen" }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block animate-scale-in delay-300 hover:scale-[1.03] hover-glow-accent"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/10 transition-all duration-500">
                <h3 className="text-2xl font-display font-bold text-accent transition-transform group-hover:scale-105 duration-300">
                  Namkeen
                </h3>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Savory treats with authentic spices
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Namkeen <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* Beverages */}
            <Link
              to="/products"
              search={{ category: "beverages" }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block animate-scale-in delay-400 hover:scale-[1.03]"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-500/10 transition-all duration-500">
                <div className="flex flex-col items-center gap-2 transition-transform group-hover:scale-105 duration-300">
                  <GlassWater className="h-10 w-10 text-blue-600" />
                  <h3 className="text-2xl font-display font-bold text-blue-600">
                    Beverages
                  </h3>
                </div>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Refreshing drinks and traditional beverages
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Beverages <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* Cookies */}
            <Link
              to="/products"
              search={{ category: "cookies" }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block animate-scale-in delay-500 hover:scale-[1.03]"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-amber-500/10 transition-all duration-500">
                <h3 className="text-2xl font-display font-bold text-amber-600 transition-transform group-hover:scale-105 duration-300">
                  Cookies
                </h3>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Freshly baked cookies and biscuits
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Cookies <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* Accompaniments */}
            <Link
              to="/products"
              search={{ category: "accompaniments" }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer block animate-scale-in delay-600 hover:scale-[1.03]"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center group-hover:from-green-500/30 group-hover:to-green-500/10 transition-all duration-500">
                <h3 className="text-2xl font-display font-bold text-green-600 transition-transform group-hover:scale-105 duration-300">
                  Accompaniments
                </h3>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Perfect sides and accompaniments
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Accompaniments <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
