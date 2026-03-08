import { Input } from "@/components/ui/input";
import { useSearch } from "@tanstack/react-router";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Category } from "../backend";
import BackButton from "../components/BackButton";
import ProductCard from "../components/ProductCard";
import { useGetAllProducts } from "../hooks/useProducts";
import { closestMatch } from "../utils/levenshtein";

const STAGGER_DELAYS = [
  "delay-100",
  "delay-200",
  "delay-300",
  "delay-400",
  "delay-500",
  "delay-600",
];

export default function Products() {
  const { data: products, isLoading, error } = useGetAllProducts();
  const [searchQuery, setSearchQuery] = useState("");

  // Read category from URL search params
  const { category: categoryParam } = useSearch({ from: "/products" });

  // Refs for each category section to enable scroll-to
  const sweetsRef = useRef<HTMLElement>(null);
  const snacksRef = useRef<HTMLElement>(null);
  const namkeenRef = useRef<HTMLElement>(null);
  const beveragesRef = useRef<HTMLElement>(null);
  const cookiesRef = useRef<HTMLElement>(null);
  const accompanimentsRef = useRef<HTMLElement>(null);

  // Scroll to the category section when categoryParam changes and products are loaded
  useEffect(() => {
    if (!categoryParam || isLoading) return;

    const refMap: Record<string, React.RefObject<HTMLElement | null>> = {
      sweets: sweetsRef,
      snacks: snacksRef,
      namkeen: namkeenRef,
      beverages: beveragesRef,
      cookies: cookiesRef,
      accompaniments: accompanimentsRef,
    };

    const targetRef = refMap[categoryParam];
    if (!targetRef?.current) return;

    // Small delay to ensure the DOM has rendered
    const timer = setTimeout(() => {
      targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

    return () => clearTimeout(timer);
  }, [categoryParam, isLoading]);

  // Filtered products based on search query
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  // Fuzzy suggestion when no results found
  const suggestion = useMemo(() => {
    if (!products || filteredProducts.length > 0 || !searchQuery.trim())
      return null;
    const allNames = products.map((p) => p.name);
    return closestMatch(searchQuery.trim(), allNames);
  }, [products, filteredProducts, searchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;

  const sweets = filteredProducts.filter((p) => p.category === Category.sweets);
  const snacks = filteredProducts.filter((p) => p.category === Category.snacks);
  const namkeen = filteredProducts.filter(
    (p) => p.category === Category.namkeen,
  );
  const beverages = filteredProducts.filter(
    (p) => p.category === Category.beverages,
  );
  const cookies = filteredProducts.filter(
    (p) => p.category === Category.cookies,
  );
  const accompaniments = filteredProducts.filter(
    (p) => p.category === Category.accompaniments,
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive">
            Failed to load products. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-festival bg-mandala py-12 relative overflow-hidden">
        <div className="absolute inset-0 pattern-border opacity-20" />
        <div className="container mx-auto px-4 relative">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gold-shimmer mb-4">
              Our Products
            </h1>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
              Discover our wide selection of authentic Indian sweets, snacks,
              namkeen, beverages, cookies, and accompaniments
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search products by name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base rounded-full border-primary/30 bg-background/80 backdrop-blur-sm shadow-md focus-visible:ring-primary"
              />
              {isSearchActive && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Fuzzy suggestion */}
            {suggestion && isSearchActive && filteredProducts.length === 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Did you mean:{" "}
                <button
                  type="button"
                  onClick={() => setSearchQuery(suggestion)}
                  className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                  {suggestion}
                </button>
                ?
              </div>
            )}

            {/* Search result count */}
            {isSearchActive && filteredProducts.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Found{" "}
                <span className="font-semibold text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                product{filteredProducts.length !== 1 ? "s" : ""} for &ldquo;
                {searchQuery}&rdquo;
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Category Quick-Nav */}
      {!isSearchActive && (
        <div className="sticky top-16 z-40 bg-background/90 backdrop-blur-sm border-b border-border py-3 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                {
                  key: "sweets",
                  label: "🍬 Sweets",
                  ref: sweetsRef,
                  count: sweets.length,
                  activeColor:
                    "bg-primary text-primary-foreground shadow-glow-primary",
                },
                {
                  key: "snacks",
                  label: "🥜 Snacks",
                  ref: snacksRef,
                  count: snacks.length,
                  activeColor:
                    "bg-secondary text-secondary-foreground shadow-glow-secondary",
                },
                {
                  key: "namkeen",
                  label: "🧂 Namkeen",
                  ref: namkeenRef,
                  count: namkeen.length,
                  activeColor:
                    "bg-accent text-accent-foreground shadow-glow-accent",
                },
                {
                  key: "beverages",
                  label: "🥤 Beverages",
                  ref: beveragesRef,
                  count: beverages.length,
                  activeColor:
                    "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]",
                },
                {
                  key: "cookies",
                  label: "🍪 Cookies",
                  ref: cookiesRef,
                  count: cookies.length,
                  activeColor:
                    "bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]",
                },
                {
                  key: "accompaniments",
                  label: "🫙 Accompaniments",
                  ref: accompanimentsRef,
                  count: accompaniments.length,
                  activeColor:
                    "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]",
                },
              ]
                .filter((cat) => cat.count > 0)
                .map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      cat.ref.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 animate-sparkle-pop ${cat.activeColor}`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* No results state */}
      {isSearchActive && filteredProducts.length === 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No products found for &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-primary underline underline-offset-2 text-sm hover:text-primary/80 transition-colors"
            >
              Clear search
            </button>
          </div>
        </section>
      )}

      {/* Sweets Section */}
      {sweets.length > 0 && (
        <section ref={sweetsRef} className="py-12 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              {!isSearchActive && (
                <img
                  src="/assets/generated/sweets-hero.dim_600x400.png"
                  alt="Sweets"
                  className="w-32 h-auto rounded-xl shadow-md hidden md:block"
                />
              )}
              <div>
                <h2 className="text-3xl font-display font-bold text-gold-shimmer mb-2 animate-fade-in-up">
                  🍬 Sweets
                </h2>
                <p className="text-muted-foreground">
                  Traditional Indian mithai made with love
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sweets.map((product, idx) => (
                <div
                  key={product.id.toString()}
                  className={`animate-bounce-in ${idx < 8 ? STAGGER_DELAYS[idx % 6] : ""}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decorative Border */}
      {sweets.length > 0 &&
        (snacks.length > 0 || namkeen.length > 0 || beverages.length > 0) && (
          <div className="container mx-auto px-4 py-6">
            <img
              src="/assets/generated/border-pattern.dim_800x100.png"
              alt="Decorative border"
              className="w-full max-w-2xl mx-auto h-auto opacity-60"
            />
          </div>
        )}

      {/* Snacks Section */}
      {snacks.length > 0 && (
        <section ref={snacksRef} className="py-12 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-gold-shimmer mb-2 animate-fade-in-up">
              🥜 Snacks
            </h2>
            <p className="text-muted-foreground mb-8">
              Crispy and delicious treats
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snacks.map((product, idx) => (
                <div
                  key={product.id.toString()}
                  className={`animate-bounce-in ${idx < 8 ? STAGGER_DELAYS[idx % 6] : ""}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decorative Border */}
      {snacks.length > 0 && (namkeen.length > 0 || beverages.length > 0) && (
        <div className="container mx-auto px-4 py-6">
          <img
            src="/assets/generated/border-pattern.dim_800x100.png"
            alt="Decorative border"
            className="w-full max-w-2xl mx-auto h-auto opacity-60"
          />
        </div>
      )}

      {/* Namkeen Section */}
      {namkeen.length > 0 && (
        <section ref={namkeenRef} className="py-12 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-gold-shimmer mb-2 animate-fade-in-up">
              🧂 Namkeen
            </h2>
            <p className="text-muted-foreground mb-8">
              Savory snacks with authentic spices
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {namkeen.map((product, idx) => (
                <div
                  key={product.id.toString()}
                  className={`animate-bounce-in ${idx < 8 ? STAGGER_DELAYS[idx % 6] : ""}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decorative Border */}
      {namkeen.length > 0 && beverages.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <img
            src="/assets/generated/border-pattern.dim_800x100.png"
            alt="Decorative border"
            className="w-full max-w-2xl mx-auto h-auto opacity-60"
          />
        </div>
      )}

      {/* Beverages Section */}
      {beverages.length > 0 && (
        <section ref={beveragesRef} className="py-12 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-gold-shimmer mb-2 animate-fade-in-up">
              🥤 Beverages
            </h2>
            <p className="text-muted-foreground mb-8">
              Refreshing drinks and traditional beverages
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beverages.map((product, idx) => (
                <div
                  key={product.id.toString()}
                  className={`animate-bounce-in ${idx < 8 ? STAGGER_DELAYS[idx % 6] : ""}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decorative Border */}
      {beverages.length > 0 &&
        (cookies.length > 0 || accompaniments.length > 0) && (
          <div className="container mx-auto px-4 py-6">
            <img
              src="/assets/generated/border-pattern.dim_800x100.png"
              alt="Decorative border"
              className="w-full max-w-2xl mx-auto h-auto opacity-60"
            />
          </div>
        )}

      {/* Cookies Section */}
      {cookies.length > 0 && (
        <section ref={cookiesRef} className="py-12 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-gold-shimmer mb-2 animate-fade-in-up">
              🍪 Cookies
            </h2>
            <p className="text-muted-foreground mb-8">
              Freshly baked cookies and biscuits
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cookies.map((product, idx) => (
                <div
                  key={product.id.toString()}
                  className={`animate-bounce-in ${idx < 8 ? STAGGER_DELAYS[idx % 6] : ""}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decorative Border */}
      {cookies.length > 0 && accompaniments.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <img
            src="/assets/generated/border-pattern.dim_800x100.png"
            alt="Decorative border"
            className="w-full max-w-2xl mx-auto h-auto opacity-60"
          />
        </div>
      )}

      {/* Accompaniments Section */}
      {accompaniments.length > 0 && (
        <section ref={accompanimentsRef} className="py-12 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-gold-shimmer mb-2 animate-fade-in-up">
              🫙 Accompaniments
            </h2>
            <p className="text-muted-foreground mb-8">
              Perfect sides and accompaniments
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accompaniments.map((product, idx) => (
                <div
                  key={product.id.toString()}
                  className={`animate-bounce-in ${idx < 8 ? STAGGER_DELAYS[idx % 6] : ""}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!isSearchActive &&
        sweets.length === 0 &&
        snacks.length === 0 &&
        namkeen.length === 0 &&
        beverages.length === 0 &&
        cookies.length === 0 &&
        accompaniments.length === 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <p className="text-muted-foreground text-lg">
                No products available yet. Check back soon!
              </p>
            </div>
          </section>
        )}
    </div>
  );
}
