import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: settings, error } = await supabase
      .from("user_settings")
      .select("is_pro")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned

    return Response.json(settings || { is_pro: false });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { is_pro } = await request.json();
    
    // Upsert user settings
    const { data: updated, error } = await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, is_pro, updated_at: new Date().toISOString() })
      .select("is_pro")
      .single();

    if (error) throw error;
    
    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
