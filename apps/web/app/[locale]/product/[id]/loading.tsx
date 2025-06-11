import { ProductDetailSkeleton } from '@/components/skeletons';

export default function Loading() {
  return (
    <div className="container mx-auto">
      <ProductDetailSkeleton />
    </div>
  );
}