import { Link } from '@tanstack/react-router';
import { ArrowRight, Sparkles, GlassWater, MapPin, Clock, Phone } from 'lucide-react';
import { useGetHomepageConfig } from '../hooks/useHomepageConfig';
import { Skeleton } from '../components/ui/skeleton';

const DEFAULT_ADDRESS = 'Visanji Nagar, Jaikisan Wadi, Jalgaon, Maharashtra 425001';
const DEFAULT_PHONE = '078751 99999';
const DEFAULT_HOURS = [
  { day: 'Monday', hours: '7 am–10 pm' },
  { day: 'Tuesday', hours: '7 am–10 pm' },
  { day: 'Wednesday', hours: '7 am–10 pm' },
  { day: 'Thursday', hours: '7 am–10 pm' },
  { day: 'Friday', hours: '7 am–10 pm' },
  { day: 'Saturday', hours: '7 am–10 pm' },
  { day: 'Sunday', hours: '7 am–10 pm' },
];

export default function Home() {
  const { data: homepageConfig, isLoading: configLoading } = useGetHomepageConfig();

  const logoUrl = homepageConfig?.logo ? homepageConfig.logo.getDirectURL() : null;
  const address = homepageConfig?.address || DEFAULT_ADDRESS;
  const phone = homepageConfig?.phone || DEFAULT_PHONE;
  const hoursText = homepageConfig?.hours || null;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pattern-border opacity-30"></div>
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
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
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary mb-4">
              Gujrat Sweet Mart and Jalpan Gruh
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the authentic taste of Gujarat with our handcrafted sweets, savory snacks, and traditional namkeen. 
              Made with love and the finest ingredients.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
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
              <div className="bg-card rounded-xl p-6 shadow-sm border border-primary/10 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Address</h3>
                  {configLoading ? (
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40 mx-auto" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm leading-relaxed">{address}</p>
                  )}
                </div>
              </div>

              {/* Hours */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-primary/10 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div className="w-full">
                  <h3 className="font-display font-bold text-lg mb-2">Hours</h3>
                  {configLoading ? (
                    <div className="space-y-1">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-36 mx-auto" />
                      ))}
                    </div>
                  ) : hoursText ? (
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{hoursText}</p>
                  ) : (
                    <div className="space-y-1">
                      {DEFAULT_HOURS.map(({ day, hours }) => (
                        <div key={day} className="flex justify-between text-sm gap-4">
                          <span className="text-muted-foreground font-medium">{day}</span>
                          <span className="text-foreground">{hours}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-primary/10 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Phone</h3>
                  {configLoading ? (
                    <Skeleton className="h-5 w-32 mx-auto" />
                  ) : (
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
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
            <div className="text-center p-6 bg-card rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Authentic Recipes</h3>
              <p className="text-muted-foreground">
                Traditional recipes passed down through generations
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Fresh Daily</h3>
              <p className="text-muted-foreground">
                Made fresh every day with premium ingredients
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Wide Variety</h3>
              <p className="text-muted-foreground">
                From sweets to savory, something for everyone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Our Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Sweets */}
            <Link
              to="/products"
              search={{ category: 'sweets' }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer block"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                <h3 className="text-2xl font-display font-bold text-primary">Sweets</h3>
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
              search={{ category: 'snacks' }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer block"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:from-secondary/30 group-hover:to-secondary/10 transition-all">
                <h3 className="text-2xl font-display font-bold text-secondary">Snacks</h3>
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
              search={{ category: 'namkeen' }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer block"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/10 transition-all">
                <h3 className="text-2xl font-display font-bold text-accent">Namkeen</h3>
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
              search={{ category: 'beverages' }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer block"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-500/10 transition-all">
                <div className="flex flex-col items-center gap-2">
                  <GlassWater className="h-10 w-10 text-blue-600" />
                  <h3 className="text-2xl font-display font-bold text-blue-600">Beverages</h3>
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
          </div>
        </div>
      </section>
    </div>
  );
}
