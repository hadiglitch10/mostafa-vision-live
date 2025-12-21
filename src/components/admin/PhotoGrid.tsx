import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Photo {
  id: string;
  image_url: string;
  title: string | null;
  section: string | null;
  category: string | null;
  featured: boolean | null;
  created_at: string;
}

const SECTION_LABELS: Record<string, string> = {
  concerts: '01 CONCERTS',
  street: '02 STREET',
  edits: '03 EDITS',
};

const PhotoGrid = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['admin-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Photo[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photo: Photo) => {
      // Extract filename from URL to delete from storage
      const urlParts = photo.image_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Delete from storage (ignore errors as file might not exist)
      await supabase.storage
        .from('portfolio-images')
        .remove([filename]);

      // Delete from database
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Photo deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete photo');
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      // If setting as featured, unset all others first
      if (featured) {
        await supabase
          .from('photos')
          .update({ featured: false })
          .eq('featured', true);
      }

      const { error } = await supabase
        .from('photos')
        .update({ featured })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Photo updated');
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['featured-photo'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update photo');
    },
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-lg p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No photos uploaded yet</p>
        <p className="text-sm text-muted-foreground mt-1">Use the upload form above to add your first photo</p>
      </div>
    );
  }

  // Group photos by section
  const groupedPhotos = photos.reduce((acc, photo) => {
    const section = photo.section || 'concerts';
    if (!acc[section]) acc[section] = [];
    acc[section].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Gallery</h3>
        <span className="text-sm text-muted-foreground">{photos.length} photos</span>
      </div>

      {Object.entries(groupedPhotos).map(([section, sectionPhotos]) => (
        <div key={section} className="space-y-4">
          <h4 className="text-sm uppercase tracking-widest text-primary font-medium">
            {SECTION_LABELS[section] || section}
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sectionPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-background rounded-lg overflow-hidden border border-border/50"
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || 'Photo'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant={photo.featured ? 'default' : 'outline'}
                      className="h-8 w-8"
                      onClick={() => toggleFeaturedMutation.mutate({ id: photo.id, featured: !photo.featured })}
                      title={photo.featured ? 'Remove from hero' : 'Set as hero image'}
                    >
                      <Star size={14} className={photo.featured ? 'fill-current' : ''} />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete photo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this photo from your gallery. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              setDeletingId(photo.id);
                              deleteMutation.mutate(photo);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === photo.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              'Delete'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <div>
                    {photo.title && (
                      <p className="text-sm font-medium truncate">{photo.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{photo.category}</p>
                  </div>
                </div>

                {/* Featured badge */}
                {photo.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                    Hero
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
