import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Photo {
  id: string;
  title: string | null;
  category: string | null;
  section: string | null;
  image_url: string;
  aspect_ratio: string | null;
  featured: boolean | null;
  sort_order: number | null;
  created_at: string;
  type?: 'photo';
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
      return (data || []).map(p => ({ ...p, type: 'photo' as const })) as Photo[];
    },
  });
};

export const usePhotosBySection = (section: string) => {
  return useQuery({
    queryKey: ["photos", section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("section", section)
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

export const useSectionedPhotos = () => {
  return useQuery({
    queryKey: ["sectioned-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const photos = data as Photo[];

      // Group by section
      const sections = {
        concerts: photos.filter(p => p.section === 'concerts'),
        street: photos.filter(p => p.section === 'street'),
        edits: photos.filter(p => p.section === 'edits'),
      };

      return sections;
    },
  });
};
