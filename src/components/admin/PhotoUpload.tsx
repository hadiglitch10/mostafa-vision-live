import { useState, useRef } from 'react';
import { Upload, Image, X, Music, Camera, Edit, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, calculateAspectRatio } from '@/lib/imageCompression';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";

const SECTIONS = [
  { value: 'concerts', label: 'Concerts', icon: Music, description: 'Live performances and stage energy' },
  { value: 'street', label: 'Street', icon: Camera, description: 'Urban life and candid moments' },
  { value: 'edits', label: 'Edits', icon: Edit, description: 'Creative post-processing art' },
  { value: 'events', label: 'Events', icon: Calendar, description: 'Weddings, parties, and special occasions' },
];

const CATEGORIES = [
  { value: 'concert', label: 'Concert' },
  { value: 'street', label: 'Street' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'event', label: 'Event' },
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
    <div className="bg-card glass-panel rounded-xl p-8 border-border/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold font-heading flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Upload size={24} className="text-primary" />
          </div>
          Upload New Photo
        </h3>
        {file && (
          <span className="text-xs font-mono px-3 py-1 bg-primary/10 text-primary rounded-full">
            READY TO UPLOAD
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
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
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={clearSelection}
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
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              2. Choose Section (Where will it show?)
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const isSelected = section === s.value;
                return (
                  <div
                    key={s.value}
                    onClick={() => {
                      setSection(s.value);
                      const mapping: Record<string, string> = {
                        concerts: 'concert',
                        street: 'street',
                        edits: 'editorial',
                        events: 'event'
                      };
                      setCategory(mapping[s.value] || 'concert');
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
                      <h4 className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-foreground")}>{s.label}</h4>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check size={14} className="text-primary-foreground" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              3. Details
            </Label>
            <div className="space-y-4">
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
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
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
