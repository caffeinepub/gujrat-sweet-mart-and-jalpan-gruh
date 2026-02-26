import { Link } from '@tanstack/react-router';
import { ArrowRight, Sparkles, GlassWater } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pattern-border opacity-30"></div>
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <img
                src="/assets/generated/shop-banner.dim_1200x400.png"
                alt="Gujrat Sweet Mart Banner"
                className="w-full h-auto rounded-lg shadow-paisley"
              />
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
            <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <h3 className="text-2xl font-display font-bold text-primary">Sweets</h3>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Delicious traditional Indian sweets
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                <h3 className="text-2xl font-display font-bold text-secondary">Snacks</h3>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Crispy and flavorful snacks for any time
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <h3 className="text-2xl font-display font-bold text-accent">Namkeen</h3>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Savory treats with authentic spices
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <GlassWater className="h-10 w-10 text-blue-600" />
                  <h3 className="text-2xl font-display font-bold text-blue-600">Beverages</h3>
                </div>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  Refreshing drinks and traditional beverages
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

