import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jstiicmuedcivvkletvr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0GTAkMaCuS_Zcj5PPr7_pw_bwSLcCju";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
