import { useState, useRef } from 'react';
import { Video, X, Upload, Loader2, Check, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const VideoUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [autoThumbnailUrl, setAutoThumbnailUrl] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [section, setSection] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState<string | null>(null);
    const [uploadPercent, setUploadPercent] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    // Fetch existing videos for management
    const { data: videos = [], isLoading: videosLoading } = useQuery({
        queryKey: ['admin-videos'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    // Set default section once categories load
    if (!section && categories.length > 0) {
        setSection(categories[0].value);
    }

    const extractThumbnail = async (videoFile: File): Promise<File | null> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.playsInline = true;
            video.src = URL.createObjectURL(videoFile);

            video.onloadedmetadata = () => {
                video.currentTime = Math.min(0.5, video.duration / 2);
            };

            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const thumb = new File([blob], 'thumb.jpg', { type: 'image/jpeg' });
                            resolve(thumb);
                        } else {
                            resolve(null);
                        }
                    }, 'image/jpeg', 0.8);
                } else {
                    resolve(null);
                }
                URL.revokeObjectURL(video.src);
            };

            video.onerror = () => {
                URL.revokeObjectURL(video.src);
                resolve(null);
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        // Auto-extract thumbnail
        const thumb = await extractThumbnail(selected);
        if (thumb) {
            setThumbnailFile(thumb);
            setAutoThumbnailUrl(URL.createObjectURL(thumb));
        }
    };

    const clearFile = () => {
        setFile(null);
        setThumbnailFile(null);
        if (autoThumbnailUrl) URL.revokeObjectURL(autoThumbnailUrl);
        setAutoThumbnailUrl(null);
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

            // Upload thumbnail if available
            let thumbUrl = null;
            if (thumbnailFile) {
                setProgress('Uploading thumbnail...');
                const thumbExt = thumbnailFile.name.split('.').pop() ?? 'jpg';
                const thumbFilename = `thumb-${filename.split('.')[0]}.${thumbExt}`;

                const { data: thumbData, error: thumbError } = await supabase.storage
                    .from('portfolio-videos')
                    .upload(thumbFilename, thumbnailFile, { contentType: thumbnailFile.type, upsert: false });

                if (!thumbError) {
                    const { data: { publicUrl: tUrl } } = supabase.storage
                        .from('portfolio-videos')
                        .getPublicUrl(thumbData.path);
                    thumbUrl = tUrl;
                }
            }

            setProgress('Saving record...');

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-videos')
                .getPublicUrl(uploadData.path);

            const { error: insertError } = await supabase.from('videos').insert({
                video_url: publicUrl,
                thumbnail_url: thumbUrl,
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

    const handleDeleteVideo = async (video: any) => {
        try {
            // Extract paths from URLs
            const getPathFromUrl = (url: string) => {
                if (!url) return null;
                const parts = url.split('portfolio-videos/');
                if (parts.length < 2) return null;
                return parts[1];
            };

            const videoPath = getPathFromUrl(video.video_url);
            const thumbPath = video.thumbnail_url ? getPathFromUrl(video.thumbnail_url) : null;

            // Delete storage files
            const storage = supabase.storage.from('portfolio-videos');
            if (videoPath) await storage.remove([videoPath]);
            if (thumbPath) await storage.remove([thumbPath]);

            // Delete DB record
            const { error } = await supabase.from('videos').delete().eq('id', video.id);
            if (error) throw error;

            toast.success('Video deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
            queryClient.invalidateQueries({ queryKey: ['videos'] });

        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error('Failed to delete video');
        }
    };

    return (
        <div className="bg-card glass-panel rounded-xl p-4 sm:p-8 border-border/50">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <Video size={20} className="text-primary sm:w-6 sm:h-6" />
                    </div>
                    Upload New Video
                </h3>
                {file && (
                    <span className="text-[10px] sm:text-xs font-mono px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-full">
                        READY
                    </span>
                )}
            </div>

            <div className="grid lg:grid-cols-5 gap-6 sm:gap-10">
                {/* Left: File Pickers (3 columns) */}
                <div className="lg:col-span-3 space-y-6">
                    <Label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-bold">
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
                                aria-label="Remove selected video"
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

                    {/* Thumbnail Section */}
                    <div className="space-y-4">
                        <Label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-bold flex justify-between items-center">
                            <span>2. Video Thumbnail</span>
                            <span className="text-[9px] lowercase font-normal">Auto-extracted or custom</span>
                        </Label>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Auto/Custom Preview */}
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/50 border border-border/50 group">
                                {autoThumbnailUrl || thumbnailFile ? (
                                    <img
                                        src={autoThumbnailUrl || (thumbnailFile ? URL.createObjectURL(thumbnailFile) : '')}
                                        className="w-full h-full object-cover"
                                        alt="Thumbnail Preview"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-[10px]">
                                        <ImageIcon size={20} className="mb-1 opacity-20" />
                                        No preview
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-[9px] text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    Current Thumbnail
                                </div>
                            </div>

                            {/* Custom Thumbnail Picker */}
                            <div className="space-y-2">
                                <input
                                    ref={thumbInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setThumbnailFile(f);
                                            // Revoke old auto-blob if needed
                                            if (autoThumbnailUrl) URL.revokeObjectURL(autoThumbnailUrl);
                                            setAutoThumbnailUrl(URL.createObjectURL(f));
                                        }
                                    }}
                                    className="hidden"
                                    id="thumb-upload-input"
                                />
                                <label
                                    htmlFor="thumb-upload-input"
                                    className="flex flex-col items-center justify-center aspect-video rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-[10px] text-muted-foreground"
                                >
                                    <Upload size={14} className="mb-1" />
                                    Custom Cover
                                </label>
                                <p className="text-[9px] text-muted-foreground leading-tight">Recommended: 16:9 ratio</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form Fields (2 columns) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section Selector */}
                    <div className="space-y-4">
                        <Label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-bold">
                            3. Choose Section
                        </Label>
                        {categoriesLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Loader2 size={14} className="animate-spin" /> Loading categories...
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2.5">
                                {categories.map(cat => {
                                    const isSelected = section === cat.value;
                                    return (
                                        <div
                                            key={cat.value}
                                            onClick={() => setSection(cat.value)}
                                            className={cn(
                                                'relative p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 hover:bg-muted/50',
                                                isSelected ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'
                                            )}
                                        >
                                            <div className={cn('p-1.5 rounded-md transition-colors', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                                                <Video size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={cn('font-bold text-xs', isSelected ? 'text-primary' : 'text-foreground')}>{cat.label}</h4>
                                            </div>
                                            {isSelected && (
                                                <Check size={14} className="text-primary" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-bold">
                            4. Title (optional)
                        </Label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Live at Olympia"
                            className="bg-background/50 h-10 text-sm"
                        />
                    </div>

                    <div className="space-y-4">
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

                        {isUploading && (
                            <div className="space-y-2">
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-300"
                                        style={{ width: `${uploadPercent}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center animate-pulse">{progress}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Management List */}
            <div className="mt-16 sm:mt-24 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Video size={18} /> Manage Videos
                    </h3>
                    <span className="text-xs text-muted-foreground">{videos.length} items</span>
                </div>

                {videosLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground text-sm font-typewriter">No videos uploaded yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {videos.map((video: any) => (
                            <div key={video.id} className="bg-card/50 border border-border/50 rounded-lg p-3 sm:p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors">
                                <div className="relative w-20 sm:w-24 aspect-video rounded border border-border overflow-hidden shrink-0 bg-muted">
                                    {video.thumbnail_url ? (
                                        <img src={video.thumbnail_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Video size={16} className="opacity-20" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate">{video.title || 'Untitled Video'}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium uppercase tracking-wider">
                                            {video.section}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(video.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 size={18} />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-background border-border">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete video?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently remove "{video.title || 'Untitled Video'}" from your portfolio and storage.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-muted">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteVideo(video)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete Permanent
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoUpload;
