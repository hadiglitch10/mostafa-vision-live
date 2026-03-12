import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PageSection = {
  id: string;
  section_key: string;
  label: string;
  sort_order: number;
  visible: boolean;
};

export const usePageSections = () => {
  return useQuery({
    queryKey: ["page_sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as PageSection[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdatePageSections = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sections: { id: string; sort_order: number; visible: boolean }[]) => {
      for (const s of sections) {
        const { error } = await supabase
          .from("page_sections")
          .update({ sort_order: s.sort_order, visible: s.visible })
          .eq("id", s.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_sections"] }),
  });
};
