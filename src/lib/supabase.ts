import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Board = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
};
