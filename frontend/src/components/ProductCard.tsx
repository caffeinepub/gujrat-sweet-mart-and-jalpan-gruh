import { Product, Unit, Category } from '../backend';
import { useState } from 'react';
import { useAddToCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { ShoppingCart, Loader2, Ban } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { identity } = useInternetIdentity();
  const addToCart = useAddToCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(250);

  const categoryColors = {
    [Category.sweets]: 'from-primary/20 to-primary/5 border-primary/30',
    [Category.snacks]: 'from-secondary/20 to-secondary/5 border-secondary/30',
    [Category.namkeen]: 'from-accent/20 to-accent/5 border-accent/30',
    [Category.beverages]: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  };

  const categoryTextColors = {
    [Category.sweets]: 'text-primary',
    [Category.snacks]: 'text-secondary',
    [Category.namkeen]: 'text-accent',
    [Category.beverages]: 'text-blue-600',
  };

  const isPerKg = product.unit === Unit.per_kg;
  const isBeverage = product.category === Category.beverages;
  const isUnavailable = !product.available;

  const calculateTotal = () => {
    if (isPerKg) {
      return Math.round((Number(product.price) * selectedWeight) / 1000);
    }
    return Number(product.price) * selectedQuantity;
  };

  const handleAddToCart = async () => {
    if (isUnavailable) return;

    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const quantity = isPerKg ? BigInt(selectedWeight) : BigInt(selectedQuantity);
      await addToCart.mutateAsync({
        productId: product.id,
        quantity,
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className={`relative bg-gradient-to-br ${categoryColors[product.category]} border-2 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all ${isUnavailable ? 'opacity-60' : ''}`}>
      {/* Unavailable overlay badge */}
      {isUnavailable && (
        <div className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
          <Ban className="h-3 w-3" />
          Unavailable
        </div>
      )}

      <div className="aspect-video bg-white/50 flex items-center justify-center p-4 relative">
        {product.photoUrl ? (
          <img
            src={product.photoUrl}
            alt={product.name}
            className={`max-h-full max-w-full object-contain ${isUnavailable ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="text-muted-foreground text-sm">No image</div>
        )}
      </div>

      <div className="p-4">
        <h3 className={`font-display font-bold text-lg mb-1 ${categoryTextColors[product.category]}`}>
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">₹{Number(product.price)}</span>
            {!isBeverage && (
              <span className="text-sm text-muted-foreground">
                {isPerKg ? 'per kg' : 'per piece'}
              </span>
            )}
          </div>

          {isPerKg ? (
            <div>
              <label className="text-sm font-medium mb-2 block">Select Weight:</label>
              <div className="grid grid-cols-2 gap-2">
                {[250, 500, 1000, 2000].map((weight) => (
                  <button
                    key={weight}
                    onClick={() => !isUnavailable && setSelectedWeight(weight)}
                    disabled={isUnavailable}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                      selectedWeight === weight
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/50 hover:bg-white/80'
                    } ${isUnavailable ? 'opacity-50' : ''}`}
                  >
                    {weight >= 1000 ? `${weight / 1000} kg` : `${weight} gms`}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => !isUnavailable && setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  disabled={isUnavailable}
                  className="w-8 h-8 rounded-md bg-white/50 hover:bg-white/80 font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{selectedQuantity}</span>
                <button
                  onClick={() => !isUnavailable && setSelectedQuantity(Math.min(10, selectedQuantity + 1))}
                  disabled={isUnavailable}
                  className="w-8 h-8 rounded-md bg-white/50 hover:bg-white/80 font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Total:</span>
              <span className="text-xl font-bold text-foreground">₹{calculateTotal()}</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addToCart.isPending || !identity || isUnavailable}
              className="w-full py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {addToCart.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : isUnavailable ? (
                <>
                  <Ban className="h-4 w-4" />
                  Unavailable
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
