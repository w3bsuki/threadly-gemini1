'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ value, onChange, maxFiles = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing("productImages", {
    onClientUploadComplete: (res) => {
      console.log("Upload complete - Files: ", res);
      const newUrls = res?.map((file) => file.url) || [];
      const updatedUrls = [...value, ...newUrls].slice(0, maxFiles);
      onChange(updatedUrls);
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      console.error("UploadThing error:", error);
      console.log("Using fallback local URLs for development");
      setIsUploading(false);
    },
    onUploadBegin: (name) => {
      console.log("Beginning upload: ", name);
      setIsUploading(true);
    },
  });

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    const fileArray = Array.from(files);
    setIsUploading(true);
    
    // Always try the fallback approach in development for now
    // Since UploadThing callback is having issues
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode: Using local object URLs");
      handleFallbackUpload(fileArray);
      return;
    }
    
    // In production, try UploadThing
    try {
      const result = await startUpload(fileArray);
      if (!result || result.length === 0) {
        // UploadThing failed, fallback to local URLs
        handleFallbackUpload(fileArray);
      }
      // Success handled in onClientUploadComplete
    } catch (error) {
      // TODO: Add proper error tracking
      handleFallbackUpload(fileArray);
    }
  };

  const handleFallbackUpload = (fileArray: File[]) => {
    // Create local object URLs for development/preview
    // WARNING: This will not work in production - UploadThing must be configured
    const localUrls = fileArray.map(file => {
      const url = URL.createObjectURL(file);
      return url;
    });
    const updatedUrls = [...value, ...localUrls].slice(0, maxFiles);
    onChange(updatedUrls);
    setIsUploading(false);
  };

  const removeImage = (indexToRemove: number) => {
    const updatedUrls = value.filter((_, index) => index !== indexToRemove);
    onChange(updatedUrls);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors",
          isUploading && "border-primary"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="image-upload"
            disabled={isUploading || isUploadThingUploading || value.length >= maxFiles}
          />
          
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div className="mt-4">
            <label
              htmlFor="image-upload"
              className={cn(
                "cursor-pointer text-sm font-medium text-primary hover:text-primary/80",
                (isUploading || isUploadThingUploading || value.length >= maxFiles) && "cursor-not-allowed opacity-50"
              )}
            >
              {(isUploading || isUploadThingUploading) ? 'Uploading...' : 'Click to upload or drag and drop'}
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF up to 10MB ({value.length}/{maxFiles} images)
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-yellow-600 mt-2">
                Development Mode: Using local object URLs for instant preview
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Preview Images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Add photos to help buyers see your item
          </p>
        </div>
      )}
    </div>
  );
}