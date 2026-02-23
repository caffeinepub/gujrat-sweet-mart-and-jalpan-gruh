import { Product, Unit } from '../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const categoryColors = {
    sweets: 'from-primary/20 to-primary/5 border-primary/30',
    snacks: 'from-secondary/20 to-secondary/5 border-secondary/30',
    namkeen: 'from-accent/20 to-accent/5 border-accent/30',
    beverages: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  };

  const categoryColor = categoryColors[product.category] || categoryColors.sweets;

  const getUnitLabel = (unit: Unit) => {
    return unit === Unit.per_kg ? '/kg' : '/piece';
  };

  return (
    <div className={`bg-gradient-to-br ${categoryColor} border-2 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all`}>
      {product.photoUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={product.photoUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-display font-bold text-foreground">{product.name}</h3>
          {!product.available && (
            <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ₹{product.price.toString()}{getUnitLabel(product.unit)}
          </span>
          <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
}
