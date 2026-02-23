import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useAuth';
import { useGetAllProducts } from '../hooks/useProducts';
import { useDeleteProduct } from '../hooks/useProductMutations';
import { useActor } from '../hooks/useActor';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import ProductForm from '../components/ProductForm';
import { Product } from '../backend';
import { Loader2, Pencil, Trash2, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Admin() {
  const { identity, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: isAdminLoading, isError: isAdminError, error: adminError, isFetched, fetchStatus } = useIsCallerAdmin();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const deleteProductMutation = useDeleteProduct();

  // Comprehensive debug logging
  useEffect(() => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           ADMIN PAGE STATE DEBUG                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('Timestamp:', new Date().toISOString());
    console.log('');
    console.log('🔐 AUTHENTICATION STATE:');
    console.log('  Identity:', identity ? '✅ Present' : '❌ None');
    if (identity) {
      console.log('  Principal:', identity.getPrincipal().toString());
    }
    console.log('  Login Status:', loginStatus);
    console.log('');
    console.log('🎭 ACTOR STATE:');
    console.log('  Actor:', actor ? '✅ Present' : '❌ None');
    console.log('  Actor Fetching:', actorFetching);
    if (actor) {
      console.log('  Actor has isCallerAdmin:', typeof actor.isCallerAdmin === 'function' ? '✅ Yes' : '❌ No');
    }
    console.log('');
    console.log('👑 ADMIN CHECK STATE:');
    console.log('  isAdmin value:', isAdmin);
    console.log('  isAdmin type:', typeof isAdmin);
    console.log('  isAdmin === true:', isAdmin === true);
    console.log('  isAdmin === false:', isAdmin === false);
    console.log('  Is Loading:', isAdminLoading);
    console.log('  Is Fetched:', isFetched);
    console.log('  Fetch Status:', fetchStatus);
    console.log('  Is Error:', isAdminError);
    if (adminError) {
      console.log('  Error Details:', adminError);
      console.log('  Error Message:', (adminError as any)?.message);
      console.log('  Error Name:', (adminError as any)?.name);
    }
    console.log('');
    console.log('🎯 DECISION TREE:');
    console.log('  1. Has identity?', !!identity ? '✅' : '❌');
    console.log('  2. Is loading?', (isAdminLoading || actorFetching) ? '⏳ Yes' : '✅ No');
    console.log('  3. Has error?', isAdminError ? '❌ Yes' : '✅ No');
    console.log('  4. Is fetched?', isFetched ? '✅ Yes' : '⏳ No');
    console.log('  5. Is admin?', isAdmin === true ? '✅ Yes' : isAdmin === false ? '❌ No' : '❓ Unknown');
    console.log('');
    console.log('📊 RENDER DECISION:');
    const willShowAccessDenied = isFetched && !isAdminLoading && !actorFetching && isAdmin === false;
    const willShowLoading = isAdminLoading || actorFetching || !isFetched;
    const willShowError = isAdminError;
    const willShowDashboard = isFetched && !isAdminLoading && !actorFetching && isAdmin === true;
    console.log('  Show Access Denied?', willShowAccessDenied ? '✅ YES' : '❌ No');
    console.log('  Show Loading?', willShowLoading ? '✅ YES' : '❌ No');
    console.log('  Show Error?', willShowError ? '✅ YES' : '❌ No');
    console.log('  Show Dashboard?', willShowDashboard ? '✅ YES' : '❌ No');
    console.log('════════════════════════════════════════════════════════════');
  }, [identity, loginStatus, actor, actorFetching, isAdmin, isAdminLoading, isAdminError, adminError, isFetched, fetchStatus]);

  // Log when isAdmin value changes
  useEffect(() => {
    console.log('🔄 isAdmin value changed to:', isAdmin, '(type:', typeof isAdmin, ')');
  }, [isAdmin]);

  // Log when isFetched changes
  useEffect(() => {
    console.log('🔄 isFetched changed to:', isFetched);
  }, [isFetched]);

  if (!identity) {
    console.log('🖼️ RENDERING: Login prompt (no identity)');
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-8 shadow-lg">
            <h1 className="text-3xl font-display font-bold text-primary mb-4">
              Admin Panel
            </h1>
            <p className="text-muted-foreground mb-6">
              Please log in with Internet Identity to access the admin panel.
            </p>
            <div className="text-sm text-muted-foreground">
              Click the "Login" button in the header to continue.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdminLoading || actorFetching) {
    console.log('🖼️ RENDERING: Loading state (isAdminLoading:', isAdminLoading, ', actorFetching:', actorFetching, ')');
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (isAdminError) {
    console.log('🖼️ RENDERING: Admin check error');
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Checking Admin Status</h2>
            <p className="text-muted-foreground mb-4">
              There was an error verifying your admin privileges. This might be a backend authorization error.
            </p>
            <div className="bg-muted p-4 rounded text-sm space-y-2">
              <div><strong>Error:</strong></div>
              <pre className="overflow-auto whitespace-pre-wrap">
                {adminError?.toString()}
              </pre>
              {(adminError as any)?.message && (
                <>
                  <div className="mt-2"><strong>Message:</strong></div>
                  <pre className="overflow-auto whitespace-pre-wrap">
                    {(adminError as any).message}
                  </pre>
                </>
              )}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Possible causes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your principal is not registered as an admin</li>
                <li>Backend authorization initialization failed</li>
                <li>Network or canister communication error</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show access denied if we've actually fetched the admin status and it's false
  if (isFetched && isAdmin === false) {
    console.log('🖼️ RENDERING: Access denied (isAdmin is explicitly false, query completed)');
    return <AccessDeniedScreen />;
  }

  // If we haven't fetched yet, show loading
  if (!isFetched) {
    console.log('🖼️ RENDERING: Loading (not fetched yet, isFetched:', isFetched, ')');
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin privileges...</p>
        </div>
      </div>
    );
  }

  console.log('🖼️ RENDERING: Admin dashboard (isAdmin:', isAdmin, ')');

  const handleDelete = async (productId: bigint, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      try {
        await deleteProductMutation.mutateAsync(productId);
        toast.success('Product deleted successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete product');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(false);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingProduct(null);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your products and pricing</p>
          </div>
          {!showAddForm && !editingProduct && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingProduct) && (
          <div className="mb-8 bg-card border-2 border-primary/20 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        )}

        {/* Products List */}
        <div className="bg-card rounded-lg shadow-md overflow-hidden border">
          <div className="p-6 border-b bg-muted/30">
            <h2 className="text-xl font-display font-bold">All Products</h2>
            {products && products.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
          {productsLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first product to get started with your sweet shop!
                </p>
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Product
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id.toString()} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize">{product.category}</td>
                      <td className="px-6 py-4 font-semibold">₹{product.price.toString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.available
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {product.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deleteProductMutation.isPending}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete product"
                          >
                            {deleteProductMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
