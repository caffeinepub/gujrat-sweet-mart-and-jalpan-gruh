import { CartItem as CartItemType, Product, Unit, Category } from '../backend';
import { useGetAllProducts } from '../hooks/useProducts';
import { useClearCart } from '../hooks/useCart';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { data: products } = useGetAllProducts();
  const clearCart = useClearCart();

  const product = products?.find((p) => p.id === item.productId);

  if (!product) {
    return null;
  }

  const categoryColors = {
    [Category.sweets]: 'border-primary/30',
    [Category.snacks]: 'border-secondary/30',
    [Category.namkeen]: 'border-accent/30',
    [Category.beverages]: 'border-blue-500/30',
  };

  const isPerKg = product.unit === Unit.per_kg;
  const displayQuantity = isPerKg
    ? Number(item.quantity) >= 1000
      ? `${Number(item.quantity) / 1000} kg`
      : `${Number(item.quantity)} gms`
    : `${Number(item.quantity)} piece${Number(item.quantity) > 1 ? 's' : ''}`;

  const handleRemove = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className={`flex gap-4 p-4 bg-card border-2 ${categoryColors[product.category]} rounded-lg`}>
      <div className="w-24 h-24 bg-white/50 rounded-md flex items-center justify-center flex-shrink-0">
        {product.photoUrl ? (
          <img src={product.photoUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-muted-foreground text-xs">No image</div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-display font-bold text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{displayQuantity}</p>
        <div className="flex items-center gap-4">
          <span className="text-sm">₹{Number(product.price)} each</span>
          <span className="text-lg font-bold">₹{Number(item.totalPrice)}</span>
        </div>
      </div>

      <button
        onClick={handleRemove}
        disabled={clearCart.isPending}
        className="text-destructive hover:text-destructive/80 p-2 h-fit disabled:opacity-50"
      >
        {clearCart.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Trash2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
