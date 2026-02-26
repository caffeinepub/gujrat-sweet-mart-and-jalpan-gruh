import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useAuth';
import { useGetAllProducts } from '../hooks/useProducts';
import { useDeleteProduct } from '../hooks/useProductMutations';
import ProductForm from '../components/ProductForm';
import OrdersManagement from '../components/OrdersManagement';
import StripePaymentSetup from '../components/StripePaymentSetup';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Product, Unit } from '../backend';
import { Loader2, Plus, Pencil, Trash2, Package, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Admin() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin, isFetched: adminCheckFetched } = useIsCallerAdmin();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmProduct) return;

    try {
      await deleteProduct.mutateAsync(deleteConfirmProduct.id);
      toast.success('Product deleted successfully');
      setDeleteConfirmProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground">You need to login to access the admin panel</p>
        </div>
      </div>
    );
  }

  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking admin privileges...</p>
        </div>
      </div>
    );
  }

  if (adminCheckFetched && !isAdmin) {
    return <AccessDeniedScreen />;
  }

  const getUnitDisplay = (product: Product) => {
    if (product.unit === Unit.per_kg) {
      return '250g, 500g, 1kg, 2kg';
    }
    return '1-10 pieces';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold text-primary mb-8">Admin Panel</h1>

      <StripePaymentSetup />

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="mb-6">
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add New Product
            </Button>
          </div>

          {showForm && (
            <div className="mb-8 bg-card border-2 border-primary/20 rounded-lg p-6">
              <h2 className="text-2xl font-display font-bold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <ProductForm product={editingProduct} onSuccess={handleFormClose} onCancel={handleFormClose} />
            </div>
          )}

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {products?.map((product) => (
                <div
                  key={product.id.toString()}
                  className="bg-card border-2 border-primary/20 rounded-lg p-6 flex items-start gap-4"
                >
                  <div className="w-24 h-24 bg-white/50 rounded-md flex items-center justify-center flex-shrink-0">
                    {product.photoUrl ? (
                      <img
                        src={product.photoUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-xl mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-semibold">₹{Number(product.price)}</span>
                      <span className="text-muted-foreground">Category: {product.category}</span>
                      <span className="text-muted-foreground">Unit: {product.unit === Unit.per_kg ? 'Per Kg' : 'Single'}</span>
                      <span className="text-muted-foreground">Options: {getUnitDisplay(product)}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirmProduct(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <OrdersManagement />
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteConfirmProduct} onOpenChange={() => setDeleteConfirmProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
