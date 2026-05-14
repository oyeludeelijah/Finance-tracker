import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth.jsx";
import { toast } from "sonner";

export function useTransactions(limit = 100) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      if (!user) throw new Error("Unauthorized");
      const { data: newTransaction, error } = await supabase
        .from("transactions")
        .insert([{ user_id: user.id, ...data }])
        .select()
        .single();
      if (error) throw error;
      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction added!");
    },
    onError: (e) => toast.error(e.message || "Failed to add transaction"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!user) throw new Error("Unauthorized");
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted!");
    },
    onError: (e) => toast.error(e.message || "Failed to delete transaction"),
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    addTransaction: addMutation.mutate,
    isAdding: addMutation.isPending,
    deleteTransaction: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
