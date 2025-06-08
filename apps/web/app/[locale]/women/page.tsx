import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';

export default function WomenPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation */}
      <CategoryNav 
        category="women"
        title="Women's Fashion"
        description="Discover unique women's fashion from our community of sellers"
      />
      
      {/* Product Grid with Women's Filter */}
      <ProductGrid category="women" />
    </div>
  );
} 