import { useState, useEffect } from 'react';
import { Product, Category } from '../backend';
import { useAddProduct, useEditProduct } from '../hooks/useProductMutations';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(Category.sweets);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [available, setAvailable] = useState(true);

  const addProductMutation = useAddProduct();
  const editProductMutation = useEditProduct();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description);
      setPrice(product.price.toString());
      setAvailable(product.available);
    } else {
      // Reset form when switching to add mode
      setName('');
      setCategory(Category.sweets);
      setDescription('');
      setPrice('');
      setAvailable(true);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceNum = BigInt(price);

    try {
      if (product) {
        await editProductMutation.mutateAsync({
          productId: product.id,
          name,
          category,
          description,
          price: priceNum,
          available,
        });
        toast.success('Product updated successfully!');
      } else {
        await addProductMutation.mutateAsync({
          name,
          category,
          description,
          price: priceNum,
          available,
        });
        toast.success('Product added successfully!');
      }

      // Reset form
      setName('');
      setCategory(Category.sweets);
      setDescription('');
      setPrice('');
      setAvailable(true);

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const isPending = addProductMutation.isPending || editProductMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Product Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          placeholder="e.g., Kaju Katli"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        >
          <option value={Category.sweets}>Sweets</option>
          <option value={Category.snacks}>Snacks</option>
          <option value={Category.namkeen}>Namkeen</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
          placeholder="Describe your product..."
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Price (₹) *
        </label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          step="1"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          placeholder="0"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="available"
          type="checkbox"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="available" className="text-sm font-medium">
          Available for purchase
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {product ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 bg-muted text-foreground px-6 py-2 rounded-lg font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
