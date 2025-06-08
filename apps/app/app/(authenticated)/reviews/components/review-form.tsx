'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Label } from '@repo/design-system/components/ui/label';
import { Star } from 'lucide-react';
import { createReview } from '../actions/create-review';

interface ReviewFormProps {
  orderId: string;
  productTitle: string;
  sellerName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ orderId, productTitle, sellerName, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createReview({
        orderId,
        rating,
        comment: comment.trim(),
      });

      if (result.success) {
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Purchase</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p><strong>Product:</strong> {productTitle}</p>
          <p><strong>Seller:</strong> {sellerName}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this purchase..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || !comment.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}