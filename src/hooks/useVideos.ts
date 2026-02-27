import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Video {
    id: string;
    title: string | null;
    video_url: string;
    thumbnail_url: string | null;
    section: string | null;
    category: string | null;
    sort_order: number | null;
    created_at: string;
    type: 'video';
}

export const useVideos = () => {
    return useQuery({
        queryKey: ["videos"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("videos")
                .select("*")
                .order("sort_order", { ascending: true })
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data || []).map(v => ({ ...v, type: 'video' })) as Video[];
        },
    });
};
