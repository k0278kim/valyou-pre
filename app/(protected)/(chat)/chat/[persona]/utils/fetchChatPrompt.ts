import {SupabaseClient} from "@supabase/supabase-js";

export const fetchChatAnalyzePrompt = async (supabase: SupabaseClient<any, "public", "public", any, any>) => {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("type", "CHAT_ANALYZE")
    .maybeSingle()

  if (error) return { status: "error", message: error.message };
  if (data) return { status: "success", message: data.prompt };
}

export const fetchPhotoPrompt = async (supabase: SupabaseClient<any, "public", "public", any, any>) => {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("type", "PHOTO")
    .maybeSingle();

  if (error) return { status: "error", message: error.message };
  if (data) return { status: "success", message: data.prompt };
};

export const fetchChatInitPrompt = async (supabase: SupabaseClient<any, "public", "public", any, any>) => {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("type", "CHAT_INIT")
    .maybeSingle();

  if (error) return { status: "error", message: error.message };
  if (data) return { status: "success", message: data.prompt };
}