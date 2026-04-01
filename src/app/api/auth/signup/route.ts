import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase.from("users").insert({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
    }).select().single();

    if (error) {
      console.error("Signup DB error:", error);
      return NextResponse.json({ error: `Database failure: ${error.message}` }, { status: 500 });
    }

    console.log("Signup success:", newUser.email);
    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error("Signup system crash:", err);
    return NextResponse.json({ error: `Internal failure: ${err.message}` }, { status: 500 });
  }
}
