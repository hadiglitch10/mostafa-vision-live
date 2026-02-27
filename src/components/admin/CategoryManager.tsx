import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
    FolderOpen,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    Loader2,
    GripVertical,
    Music,
    Camera,
    Edit,
    Calendar,
    Image,
    Film,
    Star,
    Heart,
    Mountain,
    Sunset,
    Users,
    Aperture,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/hooks/useCategories';

// Available icons the admin can pick from
const ICON_OPTIONS = [
    { name: 'Music', Icon: Music },
    { name: 'Camera', Icon: Camera },
    { name: 'Edit', Icon: Edit },
    { name: 'Calendar', Icon: Calendar },
    { name: 'Image', Icon: Image },
    { name: 'Film', Icon: Film },
    { name: 'Star', Icon: Star },
    { name: 'Heart', Icon: Heart },
    { name: 'Mountain', Icon: Mountain },
    { name: 'Sunset', Icon: Sunset },
    { name: 'Users', Icon: Users },
    { name: 'Aperture', Icon: Aperture },
];

const getIcon = (name: string) => {
    const found = ICON_OPTIONS.find(i => i.name === name);
    return found ? found.Icon : Camera;
};

const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Add Category Form ────────────────────────────────────────────────────────
const AddCategoryForm = ({ onDone }: { onDone: () => void }) => {
    const [label, setLabel] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [icon, setIcon] = useState('Camera');
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: async () => {
            const value = slugify(label);
            if (!value) throw new Error('Label is required');

            // Check for duplicate slug
            const { data: existing } = await supabase
                .from('categories')
                .select('id')
                .eq('value', value)
                .maybeSingle();
            if (existing) throw new Error(`Slug "${value}" already exists`);

            // Get max sort_order
            const { data: cats } = await supabase
                .from('categories')
                .select('sort_order')
                .order('sort_order', { ascending: false })
                .limit(1);
            const nextOrder = cats && cats.length > 0 ? (cats[0].sort_order || 0) + 1 : 1;

            const { error } = await supabase.from('categories').insert({
                value,
                label: label.trim(),
                subtitle: subtitle.trim(),
                icon,
                sort_order: nextOrder,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Category added');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            onDone();
        },
        onError: (e: any) => toast.error(e.message || 'Failed to add category'),
    });

    return (
        <div className="bg-muted/30 rounded-xl border border-border/50 p-6 space-y-5">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">New Category</h4>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Label *</Label>
                    <Input
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                        placeholder="e.g. Portraits"
                        className="bg-background/50"
                    />
                    {label && (
                        <p className="text-xs text-muted-foreground font-mono">slug: {slugify(label)}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Subtitle</Label>
                    <Input
                        value={subtitle}
                        onChange={e => setSubtitle(e.target.value)}
                        placeholder="e.g. CAPTURING FACES & SOULS."
                        className="bg-background/50"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Icon</Label>
                <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map(({ name, Icon }) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => setIcon(name)}
                            title={name}
                            className={cn(
                                'p-2 rounded-lg border-2 transition-all',
                                icon === name
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border/50 bg-card text-muted-foreground hover:border-primary/40'
                            )}
                        >
                            <Icon size={18} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button
                    onClick={() => addMutation.mutate()}
                    disabled={!label.trim() || addMutation.isPending}
                    size="sm"
                    className="gap-2"
                >
                    {addMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save Category
                </Button>
                <Button variant="outline" size="sm" onClick={onDone} className="gap-2">
                    <X size={14} /> Cancel
                </Button>
            </div>
        </div>
    );
};

// ─── Edit Row ─────────────────────────────────────────────────────────────────
const EditRow = ({ cat, onDone }: { cat: Category; onDone: () => void }) => {
    const [label, setLabel] = useState(cat.label);
    const [subtitle, setSubtitle] = useState(cat.subtitle);
    const [icon, setIcon] = useState(cat.icon);
    const queryClient = useQueryClient();

    const editMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('categories')
                .update({ label: label.trim(), subtitle: subtitle.trim(), icon })
                .eq('id', cat.id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Category updated');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            onDone();
        },
        onError: (e: any) => toast.error(e.message || 'Failed to update'),
    });

    return (
        <div className="bg-muted/20 rounded-xl border border-primary/30 p-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Label</Label>
                    <Input value={label} onChange={e => setLabel(e.target.value)} className="bg-background/50 h-9" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Subtitle</Label>
                    <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="bg-background/50 h-9" />
                </div>
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Icon</Label>
                <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map(({ name, Icon }) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => setIcon(name)}
                            title={name}
                            className={cn(
                                'p-2 rounded-lg border-2 transition-all',
                                icon === name ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-card text-muted-foreground hover:border-primary/40'
                            )}
                        >
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" onClick={() => editMutation.mutate()} disabled={!label.trim() || editMutation.isPending} className="gap-1.5">
                    {editMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
                </Button>
                <Button size="sm" variant="outline" onClick={onDone} className="gap-1.5">
                    <X size={13} /> Cancel
                </Button>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CategoryManager = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            return data as Category[];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (cat: Category) => {
            const { error } = await supabase.from('categories').delete().eq('id', cat.id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Category deleted');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['photos'] });
        },
        onError: (e: any) => toast.error(e.message || 'Failed to delete'),
    });

    // Helper: count photos in section
    const getPhotoCount = async (value: string) => {
        const { count } = await supabase
            .from('photos')
            .select('id', { count: 'exact', head: true })
            .eq('section', value);
        return count ?? 0;
    };

    if (isLoading) {
        return (
            <div className="bg-card rounded-xl border border-border/50 p-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="bg-card glass-panel rounded-xl p-8 border-border/50 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold font-heading flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen size={24} className="text-primary" />
                    </div>
                    Manage Categories
                </h3>
                {!showAdd && (
                    <Button size="sm" onClick={() => setShowAdd(true)} className="gap-2">
                        <Plus size={16} /> Add Category
                    </Button>
                )}
            </div>

            {/* Add Form */}
            {showAdd && <AddCategoryForm onDone={() => setShowAdd(false)} />}

            {/* Category List */}
            <div className="space-y-3">
                {categories.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground text-sm">No categories yet. Add your first one.</p>
                    </div>
                )}

                {categories.map((cat) => {
                    const Icon = getIcon(cat.icon);
                    const isEditing = editingId === cat.id;

                    if (isEditing) {
                        return (
                            <EditRow key={cat.id} cat={cat} onDone={() => setEditingId(null)} />
                        );
                    }

                    return (
                        <div
                            key={cat.id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/20 transition-colors group"
                        >
                            <GripVertical size={16} className="text-muted-foreground/40 shrink-0" />

                            <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                                <Icon size={18} className="text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-semibold text-sm">{cat.label}</span>
                                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cat.value}</span>
                                </div>
                                {cat.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.subtitle}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => setEditingId(cat.id)}
                                    title="Edit"
                                >
                                    <Pencil size={13} />
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete "{cat.label}"?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                The category will be removed. Photos assigned to this section will still exist
                                                but will no longer appear under this category in the gallery.
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => deleteMutation.mutate(cat)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryManager;
