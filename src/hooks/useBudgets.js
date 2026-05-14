import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth.jsx";
import { toast } from "sonner";

export function useBudgets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["budgets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      if (!user) throw new Error("Unauthorized");
      const { data: newBudget, error } = await supabase
        .from("budgets")
        .insert([{ user_id: user.id, ...data, period: "daily" }])
        .select()
        .single();
      if (error) throw error;
      return newBudget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created!");
    },
    onError: () => toast.error("Failed to create budget"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!user) throw new Error("Unauthorized");
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted!");
    },
    onError: (e) => toast.error(e.message || "Failed to delete budget"),
  });

  return {
    budgets: query.data || [],
    isLoading: query.isLoading,
    addBudget: addMutation.mutate,
    isAdding: addMutation.isPending,
    deleteBudget: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
