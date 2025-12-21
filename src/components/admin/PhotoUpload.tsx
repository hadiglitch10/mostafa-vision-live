import { useState, useRef } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, calculateAspectRatio } from '@/lib/imageCompression';
import { useQueryClient } from '@tanstack/react-query';

const SECTIONS = [
  { value: 'concerts', label: '01 CONCERTS' },
  { value: 'street', label: '02 STREET' },
  { value: 'edits', label: '03 EDITS' },
];

const CATEGORIES = [
  { value: 'concert', label: 'Concert' },
  { value: 'street', label: 'Street' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'editorial', label: 'Editorial' },
];

const PhotoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('concerts');
  const [category, setCategory] = useState('concert');
  const [isUploading, setIsUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

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
      // Compress the image
      const compressed = await compressImage(file, 2000, 0.8);
      setCompressionProgress('Uploading to storage...');

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(compressed.filename, compressed.blob, {
          contentType: 'image/webp',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(uploadData.path);

      setCompressionProgress('Saving to database...');

      // Calculate aspect ratio
      const aspectRatio = calculateAspectRatio(compressed.width, compressed.height);

      // Insert photo record
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

      if (insertError) {
        throw insertError;
      }

      toast.success('Photo uploaded successfully!');
      
      // Reset form
      clearSelection();
      setTitle('');
      setSection('concerts');
      setCategory('concert');
      
      // Refresh photos list
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
    <div className="bg-card border border-border/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Upload size={20} className="text-primary" />
        Upload New Photo
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* File Upload Area */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          
          {preview ? (
            <div className="relative aspect-[4/3] bg-background rounded-lg overflow-hidden group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs">
                {(file!.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center aspect-[4/3] bg-background border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Image size={40} className="text-muted-foreground mb-3" />
              <span className="text-sm text-muted-foreground">Click to select image</span>
              <span className="text-xs text-muted-foreground mt-1">Max 5MB • Auto-compressed to WebP</span>
            </label>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">
              Title (Optional)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter photo title..."
              className="bg-background border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Section / Chapter
            </Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="bg-background border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full mt-4"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                {compressionProgress}
              </span>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Upload Photo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
