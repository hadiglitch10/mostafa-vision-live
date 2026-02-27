import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
    id: string;
    value: string;
    label: string;
    subtitle: string;
    icon: string;
    sort_order: number;
    created_at: string;
}

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("sort_order", { ascending: true });

            if (error) throw error;
            return data as Category[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
