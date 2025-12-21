import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Photo {
  id: string;
  title: string | null;
  category: string | null;
  image_url: string;
  aspect_ratio: string | null;
  featured: boolean | null;
  sort_order: number | null;
  created_at: string;
}

export const usePhotos = () => {
  return useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Photo[];
    },
  });
};

export const useFeaturedPhoto = () => {
  return useQuery({
    queryKey: ["featured-photo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("featured", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Photo | null;
    },
  });
};
