import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function check() {
  console.log("Checking Database Connection...");
  console.log("URL:", supabaseUrl.substring(0, 20) + "...");
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase.from("summaries").select("count", { count: 'exact', head: true });
  
  if (error) {
    console.error("❌ DATABASE ERROR:", error.message);
    if (error.message.includes("relation \"public.summaries\" does not exist")) {
      console.error("👉 FIX: You need to run the SQL in your Supabase SQL Editor!");
    }
  } else {
    console.log("✅ DATABASE CONNECTED! Current Summaries Count:", data);
  }
}

check();
