import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';

export default function KidsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation */}
      <CategoryNav 
        category="kids"
        title="Kids' Fashion"
        description="Discover unique kids' fashion from our community of sellers"
      />
      
      {/* Product Grid with Kids' Filter */}
      <ProductGrid defaultCategory="kids" />
    </div>
  );
} 