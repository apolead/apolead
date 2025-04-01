
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="mb-2">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="flex flex-col items-center justify-center">
            {imageUrl ? (
              <div className="relative overflow-hidden rounded-md">
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="object-contain max-w-full" 
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
        </ScrollArea>
        <div className="flex justify-end mt-4">
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
