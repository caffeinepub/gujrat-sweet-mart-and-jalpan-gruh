import { useGetAllProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { Category } from '../backend';
import { Loader2 } from 'lucide-react';

export default function Products() {
  const { data: products, isLoading, error } = useGetAllProducts();

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
          <p className="text-destructive">Failed to load products. Please try again later.</p>
        </div>
      </div>
    );
  }

  const sweets = products?.filter((p) => p.category === Category.sweets) || [];
  const snacks = products?.filter((p) => p.category === Category.snacks) || [];
  const namkeen = products?.filter((p) => p.category === Category.namkeen) || [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
            Our Products
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our wide selection of authentic Indian sweets, snacks, and namkeen
          </p>
        </div>
      </section>

      {/* Sweets Section */}
      {sweets.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <img
                src="/assets/generated/sweets-hero.dim_600x400.png"
                alt="Sweets"
                className="w-32 h-auto rounded-lg shadow-md hidden md:block"
              />
              <div>
                <h2 className="text-3xl font-display font-bold text-primary mb-2">Sweets</h2>
                <p className="text-muted-foreground">Traditional Indian mithai made with love</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sweets.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decorative Border */}
      {(sweets.length > 0 && (snacks.length > 0 || namkeen.length > 0)) && (
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
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-secondary mb-2">Snacks</h2>
            <p className="text-muted-foreground mb-8">Crispy and delicious treats</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snacks.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decorative Border */}
      {(snacks.length > 0 && namkeen.length > 0) && (
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
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-accent mb-2">Namkeen</h2>
            <p className="text-muted-foreground mb-8">Savory delights with authentic spices</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {namkeen.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!products || products.length === 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground text-lg">
              No products available at the moment. Please check back later!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

