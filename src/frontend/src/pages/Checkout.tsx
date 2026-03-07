import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2, Store, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type ShoppingItem, Variant_cashOnDelivery_online } from "../backend";
import BackButton from "../components/BackButton";
import CustomerInfoForm from "../components/CustomerInfoForm";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useGetCart } from "../hooks/useCart";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateOrder } from "../hooks/useOrders";
import { useGetAllProducts } from "../hooks/useProducts";
import { useCreateCheckoutSession } from "../hooks/useStripeCheckout";

export default function Checkout() {
  const { identity } = useInternetIdentity();
  const { data: cartItems } = useGetCart();
  const { data: products } = useGetAllProducts();
  const createOrder = useCreateOrder();
  const createCheckoutSession = useCreateCheckoutSession();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [customerInfo, setCustomerInfo] = useState<{
    name: string;
    phone: string;
    address: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "upi" | "card" | null
  >(null);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground mb-6">
            You need to login to checkout
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-muted-foreground mb-6">
            Add items to your cart before checkout
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const DELIVERY_CHARGE = 30;

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0,
  );
  const totalWithDelivery =
    deliveryMethod === "delivery" ? itemsTotal + DELIVERY_CHARGE : itemsTotal;
  const cashRoundedTotal = Math.ceil(totalWithDelivery);
  const cashRoundOff = Number.parseFloat(
    (cashRoundedTotal - totalWithDelivery).toFixed(2),
  );
  const grandTotal = totalWithDelivery;

  const handlePlaceOrder = async () => {
    if (!customerInfo) {
      toast.error("Please complete your information");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const effectiveAddress =
      deliveryMethod === "pickup" ? "STORE PICKUP" : customerInfo.address;

    try {
      if (paymentMethod === "card") {
        // Stripe card payment
        if (!products) {
          toast.error("Products not loaded. Please try again.");
          return;
        }

        await createOrder.mutateAsync({
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: effectiveAddress,
          paymentMethod: Variant_cashOnDelivery_online.online,
        });

        const shoppingItems: ShoppingItem[] = cartItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productName: product?.name || "Product",
            productDescription: product?.description || "",
            quantity: item.quantity,
            priceInCents: BigInt(
              Math.round(
                (Number(item.totalPrice) / Number(item.quantity)) * 100,
              ),
            ),
            currency: "inr",
          };
        });

        const session = await createCheckoutSession.mutateAsync(shoppingItems);
        if (!session?.url) throw new Error("Stripe session missing url");
        window.location.href = session.url;
        return;
      }

      if (paymentMethod === "upi") {
        const orderId = await createOrder.mutateAsync({
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: effectiveAddress,
          paymentMethod: Variant_cashOnDelivery_online.online,
        });
        navigate({
          to: "/order-confirmation/$orderId",
          params: { orderId: orderId.toString() },
        });
        return;
      }

      // Cash on delivery
      const orderId = await createOrder.mutateAsync({
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: effectiveAddress,
        paymentMethod: Variant_cashOnDelivery_online.cashOnDelivery,
      });

      navigate({
        to: "/order-confirmation/$orderId",
        params: { orderId: orderId.toString() },
      });
    } catch (error: any) {
      console.error("Order placement failed:", error);
      toast.error(error?.message || "Failed to place order. Please try again.");
    }
  };

  const isPlacingOrder =
    createOrder.isPending || createCheckoutSession.isPending;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-4xl font-display font-bold text-primary mb-8">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery / Pickup Toggle */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">
              Delivery / Pickup Information
            </h2>
            <div className="flex gap-3 mb-6" data-ocid="checkout.toggle">
              <Button
                variant={deliveryMethod === "delivery" ? "default" : "outline"}
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => setDeliveryMethod("delivery")}
                data-ocid="checkout.primary_button"
              >
                <Truck className="h-4 w-4" />
                Home Delivery
              </Button>
              <Button
                variant={deliveryMethod === "pickup" ? "default" : "outline"}
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => setDeliveryMethod("pickup")}
                data-ocid="checkout.secondary_button"
              >
                <Store className="h-4 w-4" />
                Store Pickup
              </Button>
            </div>
            <CustomerInfoForm
              onProfileComplete={setCustomerInfo}
              hideAddress={deliveryMethod === "pickup"}
            />
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">
              Payment Method
            </h2>
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 sticky top-20">
            <h3 className="font-display font-bold text-xl mb-4">
              Order Summary
            </h3>

            {/* Delivery/Pickup badge */}
            <div className="mb-4">
              {deliveryMethod === "pickup" ? (
                <Badge className="bg-green-100 text-green-800 border-green-300 border gap-1 flex items-center w-fit">
                  <Store className="h-3 w-3" />
                  Store Pickup
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 border gap-1 flex items-center w-fit">
                  <Truck className="h-3 w-3" />
                  Home Delivery
                </Badge>
              )}
            </div>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => {
                const product = products?.find((p) => p.id === item.productId);
                return (
                  <div
                    key={item.productId.toString()}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {product?.name || "Product"} × {item.quantity.toString()}
                    </span>
                    <span>₹{Number(item.totalPrice).toFixed(2)}</span>
                  </div>
                );
              })}
              {deliveryMethod === "delivery" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span className="text-orange-600">₹{DELIVERY_CHARGE}</span>
                </div>
              )}
              {deliveryMethod === "pickup" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span className="text-green-600">FREE (Pickup)</span>
                </div>
              )}
              {paymentMethod === "cod" && cashRoundOff > 0 && (
                <div className="flex justify-between text-sm text-blue-700 bg-blue-50 rounded px-2 py-1">
                  <span>Cash Round Off</span>
                  <span>+₹{cashRoundOff.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>
                  ₹
                  {paymentMethod === "cod"
                    ? cashRoundedTotal
                    : grandTotal.toFixed(2)}
                </span>
              </div>
              {paymentMethod === "cod" && cashRoundOff > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Rounded up for cash payment convenience
                </p>
              )}
            </div>

            <Button
              onClick={handlePlaceOrder}
              className="w-full"
              size="lg"
              disabled={isPlacingOrder || !customerInfo || !paymentMethod}
              data-ocid="checkout.submit_button"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === "card" ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Pay with Card
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Place Order
                </>
              )}
            </Button>

            {!customerInfo && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Please fill in your information
              </p>
            )}
            {customerInfo && !paymentMethod && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Please select a payment method
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
