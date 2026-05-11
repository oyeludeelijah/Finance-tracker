import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://uxppkdmsfmbzerrddgab.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_SrBjqkycKZ9SKWWGgzKk2A_1ymiXpJy";

function getAuthedClient(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");

    const authedSupabase = getAuthedClient(token);
    const { data: { user }, error: authError } = await authedSupabase.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: budgets, error } = await authedSupabase
      .from("budgets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json(budgets);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");

    const authedSupabase = getAuthedClient(token);
    const { data: { user }, error: authError } = await authedSupabase.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { category, limit_amount, period } = await request.json();

    if (!category || !limit_amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data: newBudget, error } = await authedSupabase
      .from("budgets")
      .insert([{ user_id: user.id, category, limit_amount, period: period || "monthly" }])
      .select()
      .single();

    if (error) throw error;

    return Response.json(newBudget);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create budget" }, { status: 500 });
  }
}
