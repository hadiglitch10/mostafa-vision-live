import { useState, useRef, useEffect } from 'react';
import { Upload, Image, X, Camera, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, calculateAspectRatio } from '@/lib/imageCompression';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { useCategories } from '@/hooks/useCategories';
import {
  Music, Edit, Calendar, Image as ImageIcon, Film, Star, Heart, Mountain, Users, Aperture, Sunset,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Music, Camera, Edit, Calendar, Image: ImageIcon, Film, Star, Heart, Mountain, Users, Aperture, Sunset,
};

const getIcon = (name: string): React.ElementType => ICON_MAP[name] ?? Camera;

const PhotoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Set defaults once categories load
  useEffect(() => {
    if (categories.length > 0 && !section) {
      setSection(categories[0].value);
      setCategory(categories[0].value);
    }
  }, [categories, section]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setIsUploading(true);
    setCompressionProgress('Compressing image...');

    try {
      const compressed = await compressImage(file, 2000, 0.8);
      setCompressionProgress('Uploading to storage...');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(compressed.filename, compressed.blob, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(uploadData.path);

      setCompressionProgress('Saving to database...');

      const aspectRatio = calculateAspectRatio(compressed.width, compressed.height);

      const { error: insertError } = await supabase
        .from('photos')
        .insert({
          image_url: publicUrl,
          title: title.trim() || null,
          section,
          category,
          aspect_ratio: aspectRatio,
          featured: false,
        });

      if (insertError) throw insertError;

      toast.success('Photo uploaded successfully!');

      clearSelection();
      setTitle('');
      if (categories.length > 0) {
        setSection(categories[0].value);
        setCategory(categories[0].value);
      }

      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      setCompressionProgress(null);
    }
  };

  return (
    <div className="bg-card glass-panel rounded-xl p-4 sm:p-8 border-border/50">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
            <Upload size={20} className="text-primary sm:w-6 sm:h-6" />
          </div>
          Upload New Photo
        </h3>
        {file && (
          <span className="text-[10px] sm:text-xs font-mono px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-full">
            READY
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-10">
        {/* File Upload Area */}
        <div className="space-y-6">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
            1. Select Image
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />

          {preview ? (
            <div className="relative aspect-[4/5] bg-background rounded-xl overflow-hidden group border-2 border-primary/20 shadow-2xl">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={clearSelection}
                  aria-label="Remove selected image"
                  className="p-3 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-md text-white rounded-lg text-xs font-mono border border-white/10">
                {(file!.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center aspect-[4/5] bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all rounded-xl cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Image size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground">Click to select image</span>
              <span className="text-xs text-muted-foreground mt-2">Max 5MB • Auto-compressed</span>
            </label>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-bold">
              2. Choose Section
            </Label>

            {categoriesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 size={14} className="animate-spin" /> Loading categories...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {categories.map((cat) => {
                  const Icon = getIcon(cat.icon);
                  const isSelected = section === cat.value;
                  return (
                    <div
                      key={cat.value}
                      onClick={() => {
                        setSection(cat.value);
                        setCategory(cat.value);
                      }}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 hover:bg-muted/50",
                        isSelected ? "border-primary bg-primary/5" : "border-border/50 bg-card"
                      )}
                    >
                      <div className={cn("p-3 rounded-lg transition-colors", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-foreground")}>{cat.label}</h4>
                        {cat.subtitle && <p className="text-xs text-muted-foreground">{cat.subtitle}</p>}
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check size={14} className="text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-bold">
              3. Details
            </Label>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs text-muted-foreground">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon City"
                className="bg-background/50 h-11"
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading || categoriesLoading}
            className="w-full h-12 text-sm uppercase tracking-widest font-bold shadow-lg hover:shadow-primary/20 transition-all font-heading"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                {compressionProgress}
              </span>
            ) : (
              <>
                <Upload size={18} className="mr-2" />
                Publish to Gallery
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
