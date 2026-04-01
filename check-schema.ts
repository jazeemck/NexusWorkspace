import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Load env vars
const envContent = fs.readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envContent.split("\n")
    .filter(line => line && !line.startsWith("#"))
    .map(line => {
      const [key, ...val] = line.split("=");
      return [key.trim(), val.join("=").trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL || "",
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function main() {
  try {
    const { data, error } = await supabase
      .from("summaries")
      .select("*")
      .limit(1);

    if (error) throw error;
    console.log("Full Schema of one row:");
    console.log(JSON.stringify(data[0], null, 2));
  } catch (e: any) {
    console.error("Failed to fetch summary:", JSON.stringify(e, null, 2));
  }
}

main();
