import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContentMap = Record<string, string>;

export const usePageContent = () => {
  return useQuery({
    queryKey: ["page_content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("key, value");
      if (error) throw error;
      return Object.fromEntries((data || []).map((r) => [r.key, r.value])) as ContentMap;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdatePageContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("page_content")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_content"] }),
  });
};
