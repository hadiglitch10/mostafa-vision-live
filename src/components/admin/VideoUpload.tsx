import { useState, useRef } from 'react';
import { Video, X, Upload, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

const VideoUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [section, setSection] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState<string | null>(null);
    const [uploadPercent, setUploadPercent] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    // Set default section once categories load
    if (!section && categories.length > 0) {
        setSection(categories[0].value);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        if (!selected.type.startsWith('video/')) {
            toast.error('Please select a video file');
            return;
        }
        // Warn if > 100MB
        if (selected.size > 100 * 1024 * 1024) {
            toast.warning('Large file detected (>100MB). Upload may take a while.');
        }
        setFile(selected);
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!file) { toast.error('Please select a video'); return; }
        if (!section) { toast.error('Please select a section'); return; }

        setIsUploading(true);
        setUploadPercent(0);
        setProgress('Uploading video...');

        try {
            const ext = file.name.split('.').pop() ?? 'mp4';
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            // Upload to storage — Supabase JS v2 doesn't expose XHR progress,
            // so we simulate a progress pulse while the upload runs
            const progressInterval = setInterval(() => {
                setUploadPercent(prev => Math.min(prev + 3, 90));
            }, 400);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('portfolio-videos')
                .upload(filename, file, { contentType: file.type, upsert: false });

            clearInterval(progressInterval);

            if (uploadError) throw uploadError;
            setUploadPercent(93);
            setProgress('Saving record...');

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-videos')
                .getPublicUrl(uploadData.path);

            const { error: insertError } = await supabase.from('videos').insert({
                video_url: publicUrl,
                title: title.trim() || null,
                section,
                category: section,
            });
            if (insertError) throw insertError;

            setUploadPercent(100);
            toast.success('Video uploaded successfully!');

            // Reset
            clearFile();
            setTitle('');
            queryClient.invalidateQueries({ queryKey: ['videos'] });

        } catch (err: any) {
            console.error('Video upload error:', err);
            toast.error(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            setProgress(null);
            setUploadPercent(0);
        }
    };

    return (
        <div className="bg-card glass-panel rounded-xl p-8 border-border/50">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold font-heading flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Video size={24} className="text-primary" />
                    </div>
                    Upload New Video
                </h3>
                {file && (
                    <span className="text-xs font-mono px-3 py-1 bg-primary/10 text-primary rounded-full">
                        READY TO UPLOAD
                    </span>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* File Picker */}
                <div className="space-y-4">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                        1. Select Video File
                    </Label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="video-upload-input"
                    />

                    {file ? (
                        <div className="relative rounded-xl border-2 border-primary/20 bg-muted/20 p-6 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <Video size={28} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {(file.size / 1024 / 1024).toFixed(1)} MB
                                    {' · '}
                                    {file.type}
                                </p>
                            </div>
                            <button
                                onClick={clearFile}
                                className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="video-upload-input"
                            className="flex flex-col items-center justify-center h-48 bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all rounded-xl cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Video size={28} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-sm font-medium">Click to select video</span>
                            <span className="text-xs text-muted-foreground mt-2">MP4, WebM, MOV etc.</span>
                        </label>
                    )}

                    {/* Upload progress bar */}
                    {isUploading && (
                        <div className="space-y-2">
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${uploadPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">{progress}</p>
                        </div>
                    )}
                </div>

                {/* Form Fields */}
                <div className="space-y-8">
                    {/* Section Selector */}
                    <div className="space-y-4">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                            2. Choose Section
                        </Label>
                        {categoriesLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Loader2 size={14} className="animate-spin" /> Loading categories...
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {categories.map(cat => {
                                    const isSelected = section === cat.value;
                                    return (
                                        <div
                                            key={cat.value}
                                            onClick={() => setSection(cat.value)}
                                            className={cn(
                                                'relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 hover:bg-muted/50',
                                                isSelected ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'
                                            )}
                                        >
                                            <div className={cn('p-2 rounded-lg transition-colors', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                                                <Video size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={cn('font-bold text-sm', isSelected ? 'text-primary' : 'text-foreground')}>{cat.label}</h4>
                                                {cat.subtitle && <p className="text-xs text-muted-foreground">{cat.subtitle}</p>}
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                    <Check size={12} className="text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                            3. Title (optional)
                        </Label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Live at Olympia"
                            className="bg-background/50 h-11"
                        />
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading || !section}
                        className="w-full h-12 text-sm uppercase tracking-widest font-bold shadow-lg hover:shadow-primary/20 transition-all font-heading"
                    >
                        {isUploading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                {progress || 'Uploading...'}
                            </span>
                        ) : (
                            <>
                                <Upload size={18} className="mr-2" />
                                Publish Video
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VideoUpload;
