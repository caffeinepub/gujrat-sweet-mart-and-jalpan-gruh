import { useState, useEffect } from 'react';
import { Product, Category, Unit } from '../backend';
import { useAddProduct, useEditProduct } from '../hooks/useProductMutations';
import { Loader2, Upload, X } from 'lucide-react';
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
  const [unit, setUnit] = useState<Unit>(Unit.single);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const addProductMutation = useAddProduct();
  const editProductMutation = useEditProduct();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description);
      setPrice(product.price.toString());
      setAvailable(product.available);
      setUnit(product.unit);
      setImagePreview(product.photoUrl || '');
      setSelectedFile(null);
    } else {
      // Reset form when switching to add mode
      setName('');
      setCategory(Category.sweets);
      setDescription('');
      setPrice('');
      setAvailable(true);
      setUnit(Unit.single);
      setSelectedFile(null);
      setImagePreview('');
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceNum = BigInt(price);
    let photoUrl = imagePreview;

    try {
      // Convert selected file to base64 if a new file was selected
      if (selectedFile) {
        photoUrl = await convertFileToBase64(selectedFile);
      }

      if (product) {
        await editProductMutation.mutateAsync({
          productId: product.id,
          name,
          category,
          description,
          price: priceNum,
          available,
          unit,
          photoUrl,
        });
        toast.success('Product updated successfully!');
      } else {
        await addProductMutation.mutateAsync({
          name,
          category,
          description,
          price: priceNum,
          available,
          unit,
          photoUrl,
        });
        toast.success('Product added successfully!');
      }

      // Reset form
      setName('');
      setCategory(Category.sweets);
      setDescription('');
      setPrice('');
      setAvailable(true);
      setUnit(Unit.single);
      setSelectedFile(null);
      setImagePreview('');

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
          <option value={Category.beverages}>Beverages</option>
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

      <div className="grid grid-cols-2 gap-4">
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

        <div>
          <label htmlFor="unit" className="block text-sm font-medium mb-1">
            Unit Type *
          </label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value={Unit.per_kg}>Per Kg</option>
            <option value={Unit.single}>Single Unit</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium mb-1">
          Product Photo
        </label>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Product preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="photo"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WebP (max 5MB)
              </p>
            </div>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
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
