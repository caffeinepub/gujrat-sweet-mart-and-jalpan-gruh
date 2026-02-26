import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Link } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useUserProfile';
import { useIsCallerAdmin } from './hooks/useAuth';
import { useGetCart } from './hooks/useCart';
import Home from './pages/Home';
import Products from './pages/Products';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import MyOrders from './pages/MyOrders';
import LoginButton from './components/LoginButton';
import ProfileSetup from './components/ProfileSetup';
import { Menu, X, Shield, ShoppingCart, ClipboardList } from 'lucide-react';
import { useState } from 'react';

function Layout() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: cartItems } = useGetCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showAdminLink = !!identity;
  const cartItemCount = cartItems?.length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-card border-b-2 border-primary/20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-display font-bold text-primary">
                Gujrat Sweet Mart
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors font-medium"
                activeProps={{ className: 'text-primary' }}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-foreground hover:text-primary transition-colors font-medium"
                activeProps={{ className: 'text-primary' }}
              >
                Products
              </Link>
              {identity && (
                <Link
                  to="/my-orders"
                  className="text-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1"
                  activeProps={{ className: 'text-primary' }}
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
              )}
              {showAdminLink && (
                <Link
                  to="/admin"
                  className="text-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1"
                  activeProps={{ className: 'text-primary' }}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              {identity && (
                <Link
                  to="/cart"
                  className="relative text-foreground hover:text-primary transition-colors"
                  activeProps={{ className: 'text-primary' }}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}
              <LoginButton />
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-3 border-t">
              <Link
                to="/"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                activeProps={{ className: 'text-primary' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block text-foreground hover:text-primary transition-colors font-medium"
                activeProps={{ className: 'text-primary' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              {identity && (
                <Link
                  to="/my-orders"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
                  activeProps={{ className: 'text-primary' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
              )}
              {showAdminLink && (
                <Link
                  to="/admin"
                  className="text-foreground hover:text-primary transition-colors font-medium inline-flex items-center gap-1"
                  activeProps={{ className: 'text-primary' }}
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
                  activeProps={{ className: 'text-primary' }}
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

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-card border-t-2 border-primary/20 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display font-bold text-lg text-primary mb-2">
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
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                    Products
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Categories</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Sweets</li>
                <li>Snacks</li>
                <li>Namkeen</li>
                <li>Beverages</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Gujrat Sweet Mart. Built with ❤️ using{' '}
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
  path: '/',
  component: Home,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: Products,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: Admin,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: Cart,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: Checkout,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: OrderConfirmation,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-orders',
  component: MyOrders,
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
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
