import {SupabaseClient} from "@supabase/supabase-js";

export const fetchPersonaAvatar = async (supabase: SupabaseClient<any, "public", "public", any, any>, personaName: string) => {
  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .eq("name", personaName)
    .maybeSingle();

  if (error) return { status: "error", message: error.message };
  if (data) return { status: "success", message: data };
};