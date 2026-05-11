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
    console.log("Auth Header:", authHeader ? "Present" : "Missing");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");

    const authedSupabase = getAuthedClient(token);
    const { data: { user }, error: authError } = await authedSupabase.auth.getUser(token);
    console.log("Auth User Error:", authError?.message || "None");
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: transactions, error } = await authedSupabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return Response.json(transactions);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    console.log("POST Auth Header:", authHeader ? "Present" : "Missing");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");

    const authedSupabase = getAuthedClient(token);
    const { data: { user }, error: authError } = await authedSupabase.auth.getUser(token);
    console.log("POST Auth User Error:", authError?.message || "None");
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, description, category, type } = await request.json();

    if (!amount || !description || !category || !type) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data: newTransaction, error } = await authedSupabase
      .from("transactions")
      .insert([{ user_id: user.id, amount, description, category, type }])
      .select()
      .single();

    if (error) throw error;

    return Response.json(newTransaction);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
