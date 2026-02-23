import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useAuth';
import { useGetAllProducts } from '../hooks/useProducts';
import { useDeleteProduct } from '../hooks/useProductMutations';
import { useActor } from '../hooks/useActor';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import ProductForm from '../components/ProductForm';
import { Product } from '../backend';
import { Loader2, Pencil, Trash2, Plus, X, Bug } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Admin() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading, isError: isAdminError, error: adminError, isFetched } = useIsCallerAdmin();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { actor } = useActor();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [debugResult, setDebugResult] = useState<string | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const deleteProductMutation = useDeleteProduct();

  // Debug function to manually test admin check
  const handleDebugAdminCheck = async () => {
    console.log('🐛 ========================================');
    console.log('🐛 === MANUAL DEBUG ADMIN CHECK ===');
    console.log('🐛 ========================================');
    console.log('🐛 Timestamp:', new Date().toISOString());
    
    setDebugLoading(true);
    setDebugResult(null);

    try {
      if (!actor) {
        const msg = 'ERROR: No actor available';
        console.error('🐛', msg);
        setDebugResult(msg);
        setDebugLoading(false);
        return;
      }

      if (!identity) {
        const msg = 'ERROR: No identity available';
        console.error('🐛', msg);
        setDebugResult(msg);
        setDebugLoading(false);
        return;
      }

      const principal = identity.getPrincipal();
      console.log('🐛 Current Principal:', principal.toString());
      console.log('🐛 Is Anonymous:', principal.isAnonymous());
      console.log('🐛 Calling actor.isCallerAdmin() directly...');

      const startTime = Date.now();
      const result = await actor.isCallerAdmin();
      const endTime = Date.now();

      console.log('🐛 ========================================');
      console.log('🐛 === DEBUG RESULT ===');
      console.log('🐛 ========================================');
      console.log('🐛 Raw Result:', result);
      console.log('🐛 Result Type:', typeof result);
      console.log('🐛 Result === true:', result === true);
      console.log('🐛 Result === false:', result === false);
      console.log('🐛 Call Duration:', endTime - startTime, 'ms');
      console.log('🐛 ========================================');

      const resultMsg = `Result: ${result} (type: ${typeof result})`;
      setDebugResult(resultMsg);
      toast.success('Debug check completed - see console for details');
    } catch (error: any) {
      console.error('🐛 ========================================');
      console.error('🐛 === DEBUG ERROR ===');
      console.error('🐛 ========================================');
      console.error('🐛 Error:', error);
      console.error('🐛 Error Message:', error?.message);
      console.error('🐛 Error Stack:', error?.stack);
      console.error('🐛 ========================================');

      const errorMsg = `ERROR: ${error?.message || error?.toString() || 'Unknown error'}`;
      setDebugResult(errorMsg);
      toast.error('Debug check failed - see console for details');
    } finally {
      setDebugLoading(false);
    }
  };

  // Early return: No identity
  if (!identity) {
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

  // Early return: Loading states
  if (isAdminLoading || !isFetched) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Early return: Admin check error
  if (isAdminError) {
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

  // Early return: Access denied (explicitly not admin)
  if (isAdmin === false) {
    return <AccessDeniedScreen />;
  }

  // Main admin dashboard - only renders if isAdmin === true
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Debug Section */}
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bug className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Debug Admin Access
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                Click the button below to manually test the admin check. Results will appear in the browser console and below.
              </p>
              <button
                onClick={handleDebugAdminCheck}
                disabled={debugLoading}
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {debugLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Bug className="h-4 w-4" />
                    Debug Admin Check
                  </>
                )}
              </button>
              {debugResult && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-yellow-300 dark:border-yellow-700">
                  <div className="text-sm font-mono">
                    <strong>Debug Result:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">{debugResult}</pre>
                  </div>
                </div>
              )}
              <div className="mt-3 text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Current Principal:</strong> {identity.getPrincipal().toString()}
              </div>
            </div>
          </div>
        </div>

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
