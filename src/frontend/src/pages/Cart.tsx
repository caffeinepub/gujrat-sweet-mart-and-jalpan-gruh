import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import BackButton from "../components/BackButton";
import CartItem from "../components/CartItem";
import { Button } from "../components/ui/button";
import { useGetCart } from "../hooks/useCart";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
export default function Cart() {
  const { identity } = useInternetIdentity();
  const { data: cartItems, isLoading } = useGetCart();
  const navigate = useNavigate();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground mb-6">
            You need to login to view your cart
          </p>
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
          <h2 className="text-2xl font-display font-bold mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-muted-foreground mb-6">
            Add some delicious items to your cart!
          </p>
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

  const DELIVERY_CHARGE = 30;
  const MINIMUM_ORDER = 50;

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0,
  );
  const grandTotal = itemsTotal + DELIVERY_CHARGE;
  const isBelowMinimum = itemsTotal < MINIMUM_ORDER;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-4xl font-display font-bold text-primary mb-8">
        Your Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.productId.toString()} item={item} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 sticky top-20">
            <h3 className="font-display font-bold text-xl mb-4">
              Order Summary
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Items ({cartItems.length})</span>
                <span>₹{itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Charge</span>
                <span className="text-orange-600">₹{DELIVERY_CHARGE}</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            {isBelowMinimum && (
              <div
                data-ocid="cart.minimum_order.error_state"
                className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center font-medium"
              >
                We don't accept orders below ₹{MINIMUM_ORDER}. Add more items to
                continue.
              </div>
            )}
            <Button
              data-ocid="cart.checkout.primary_button"
              onClick={() => navigate({ to: "/checkout" })}
              className="w-full"
              size="lg"
              disabled={isBelowMinimum}
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
