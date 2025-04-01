
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string;
}

const ImageViewer = ({ isOpen, onClose, imageUrl, title }: ImageViewerProps) => {
  if (!imageUrl) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center mt-4">
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-md max-h-[70vh]">
              <img 
                src={imageUrl} 
                alt={title} 
                className="object-contain max-w-full max-h-[70vh]" 
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl);
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Image+Not+Found';
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center bg-muted h-40 w-full rounded-md">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ImageViewer };
