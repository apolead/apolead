
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ImageViewer } from '@/components/ui/image-viewer';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseImageLinkProps {
  imagePath: string | null;
  title: string;
}

export const SupabaseImageLink = ({ imagePath, title }: SupabaseImageLinkProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleViewImage = async () => {
    if (!imagePath) {
      return;
    }

    try {
      // For public URLs (already full URLs)
      if (imagePath.startsWith('http')) {
        setImageUrl(imagePath);
        setIsViewerOpen(true);
        return;
      }

      // For paths in Supabase storage
      // First try to get a public URL
      const { data, error } = await supabase.storage
        .from('public')
        .getPublicUrl(imagePath);
      
      if (error) {
        console.error("Error getting public URL:", error);
        
        // If that fails, try to get a signed URL (works for private buckets)
        const { data: signedData, error: signedError } = await supabase.storage
          .from('public')
          .createSignedUrl(imagePath, 60); // 60 seconds expiry
          
        if (signedError) {
          console.error("Error getting signed URL:", signedError);
          return;
        }
        
        setImageUrl(signedData.signedUrl);
      } else {
        setImageUrl(data.publicUrl);
      }
      
      setIsViewerOpen(true);
    } catch (error) {
      console.error("Error loading image:", error);
    }
  };

  return (
    <>
      <Button 
        variant="link" 
        size="sm" 
        onClick={handleViewImage}
        disabled={!imagePath || imagePath === "N/A"}
        className={!imagePath || imagePath === "N/A" ? "text-muted cursor-not-allowed" : "text-blue-500"}
      >
        {!imagePath || imagePath === "N/A" ? (
          "N/A"
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1" />
            View
          </>
        )}
      </Button>
      
      <ImageViewer 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)} 
        imageUrl={imageUrl} 
        title={title}
      />
    </>
  );
};
