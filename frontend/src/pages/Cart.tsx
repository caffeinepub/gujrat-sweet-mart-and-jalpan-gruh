import { useGetCart } from '../hooks/useCart';
import { useGetAllProducts } from '../hooks/useProducts';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Link, useNavigate } from '@tanstack/react-router';
import CartItem from '../components/CartItem';
import { Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Cart() {
  const { identity } = useInternetIdentity();
  const { data: cartItems, isLoading } = useGetCart();
  const { data: products } = useGetAllProducts();
  const navigate = useNavigate();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground mb-6">You need to login to view your cart</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious items to your cart!</p>
          <Link to="/products">
            <Button>
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const grandTotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold text-primary mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, idx) => (
            <CartItem key={idx} item={item} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 sticky top-20">
            <h3 className="font-display font-bold text-xl mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Items ({cartItems.length})</span>
                <span>₹{grandTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span className="text-green-600">FREE</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
            <Button
              onClick={() => navigate({ to: '/checkout' })}
              className="w-full"
              size="lg"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
