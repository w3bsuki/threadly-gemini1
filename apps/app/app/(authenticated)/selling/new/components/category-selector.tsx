'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { getCategoriesFlat, type CategoryOption } from '../actions/get-categories';

interface CategorySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CategorySelector({ value, onValueChange, placeholder = "Select a category" }: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCategories = await getCategoriesFlat();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories');
        // Fallback to hardcoded categories if API fails
        setCategories([
          { id: 'cmbl7f4ub0002w74xtex8coxd', name: "Women's Clothing", parentId: null },
          { id: 'cmbl7gbj1000dw7wd0zemrn5b', name: "Men's Clothing", parentId: null },
          { id: 'cmbl7gc6w000kw7wdq2jg6k07', name: "Kids' Clothing", parentId: null },
          { id: 'cmbl7gd50012w7wdbg3q6w2w', name: "Unisex Accessories", parentId: null },
          { id: 'cmbl7gcsr000rw7wdeiv4lsmn', name: "Designer Clothing", parentId: null },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error && categories.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Error loading categories" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}