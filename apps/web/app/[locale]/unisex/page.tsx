import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';

export default function UnisexPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation */}
      <CategoryNav 
        category="unisex"
        title="Unisex Fashion"
        description="Discover gender-neutral fashion pieces that work for everyone"
      />
      
      {/* Product Grid with Unisex Filter */}
      <ProductGrid defaultCategory="unisex" />
    </div>
  );
} 