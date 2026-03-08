import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import {
  ClipboardList,
  Menu,
  PackagePlus,
  Shield,
  ShoppingCart,
  Truck,
  UserCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import LoginButton from "./components/LoginButton";
import ProfileSetup from "./components/ProfileSetup";
import { useGetCart } from "./hooks/useCart";
import { useIsDeliveryPerson } from "./hooks/useDeliveryRole";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useUserProfile";
import Admin from "./pages/Admin";
import BulkOrder from "./pages/BulkOrder";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Delivery from "./pages/Delivery";
import Home from "./pages/Home";
import MyOrders from "./pages/MyOrders";
import OrderConfirmation from "./pages/OrderConfirmation";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentSuccess from "./pages/PaymentSuccess";
import Products from "./pages/Products";
import Profile from "./pages/Profile";

function Layout() {
  const { identity } = useInternetIdentity();
  const { data: isDeliveryPerson } = useIsDeliveryPerson();
  const { data: cartItems } = useGetCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cartItems?.length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b-2 border-primary/30 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <h1 className="text-xl md:text-2xl font-display font-bold text-gold-shimmer">
                Gujrat Sweet Mart
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="relative text-foreground hover:text-primary transition-colors font-medium after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                activeProps={{ className: "text-primary" }}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="relative text-foreground hover:text-primary transition-colors font-medium after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                activeProps={{ className: "text-primary" }}
              >
                Products
              </Link>
              <Link
                to="/bulk-order"
                className="relative text-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                activeProps={{ className: "text-primary" }}
                data-ocid="nav.bulk_order_link"
              >
                <PackagePlus className="h-4 w-4" />
                Bulk Order
              </Link>
              {identity && (
                <Link
                  to="/my-orders"
                  className="relative text-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                  activeProps={{ className: "text-primary" }}
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
              )}
              {identity && (
                <Link
                  to="/profile"
                  className="relative text-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                  activeProps={{ className: "text-primary" }}
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
              )}
              {identity && isDeliveryPerson && (
                <Link
                  to="/delivery"
                  className="relative text-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                  activeProps={{ className: "text-primary" }}
                >
                  <Truck className="h-4 w-4" />
                  Delivery
                </Link>
              )}
              {identity && (
                <Link
                  to="/admin"
                  className="relative text-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                  activeProps={{ className: "text-primary" }}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              {identity && (
                <Link
                  to="/cart"
                  className={`relative text-foreground hover:text-primary transition-colors rounded-full p-1 ${cartItemCount > 0 ? "animate-glow-pulse" : ""}`}
                  activeProps={{ className: "text-primary" }}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}
              <LoginButton />
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 border-t animate-fade-in-up">
              <Link
                to="/"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                activeProps={{ className: "text-primary" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                activeProps={{ className: "text-primary" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/bulk-order"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
                activeProps={{ className: "text-primary" }}
                onClick={() => setMobileMenuOpen(false)}
                data-ocid="nav.bulk_order_link"
              >
                <PackagePlus className="h-4 w-4" />
                Bulk Order
              </Link>
              {identity && (
                <Link
                  to="/my-orders"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
                  activeProps={{ className: "text-primary" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
              )}
              {identity && (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
                  activeProps={{ className: "text-primary" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
              )}
              {identity && isDeliveryPerson && (
                <Link
                  to="/delivery"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
                  activeProps={{ className: "text-primary" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Truck className="h-4 w-4" />
                  Delivery
                </Link>
              )}
              {identity && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
                  activeProps={{ className: "text-primary" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              {identity && (
                <Link
                  to="/cart"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
                  activeProps={{ className: "text-primary" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>
              )}
              <div className="pt-2">
                <LoginButton />
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Marquee ticker strip */}
      <div className="overflow-hidden bg-primary text-primary-foreground py-1.5 text-sm font-semibold">
        <div
          className="animate-marquee flex whitespace-nowrap gap-8"
          style={{ width: "max-content" }}
        >
          {[1, 2].map((i) => (
            <span key={i} className="flex items-center gap-8">
              <span>🍬 Fresh Daily</span>
              <span>✨ Authentic Recipes</span>
              <span>🏡 Made in Jalgaon</span>
              <span>🧁 Sweets &amp; Namkeen</span>
              <span>🎉 Festival Specials</span>
              <span>🛵 Home Delivery Available</span>
              <span>🍮 Traditional Mithai</span>
              <span>🌸 Premium Quality</span>
            </span>
          ))}
        </div>
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-card border-t-2 border-primary/30 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display font-bold text-lg text-gold-shimmer mb-2">
                Gujrat Sweet Mart and Jalpan Gruh
              </h3>
              <p className="text-sm text-muted-foreground">
                Authentic Indian sweets, snacks, and namkeen
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/bulk-order"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Bulk Order
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Categories</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    to="/products"
                    search={{ category: "sweets" }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sweets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    search={{ category: "snacks" }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Snacks
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    search={{ category: "namkeen" }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Namkeen
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    search={{ category: "beverages" }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Beverages
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    search={{ category: "cookies" }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    search={{ category: "accompaniments" }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Accompaniments
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Gujrat Sweet Mart. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <ProfileSetup />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  component: Products,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: Cart,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: Checkout,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-confirmation/$orderId",
  component: OrderConfirmation,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-orders",
  component: MyOrders,
});

const deliveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/delivery",
  component: Delivery,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const bulkOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bulk-order",
  component: BulkOrder,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  adminRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  myOrdersRoute,
  deliveryRoute,
  profileRoute,
  bulkOrderRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
