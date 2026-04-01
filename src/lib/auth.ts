import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !user) {
          console.error("Auth: User not found or Supabase error", { error, email: credentials.email });
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.warn("Auth: Invalid password attempt", { email: credentials.email });
          return null;
        }

        console.log("Auth: Successful login", { email: user.email });
        return {
          id: user.id || user.email,
          name: user.name,
          email: user.email,
          image: user.avatar_url,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (!existingUser) {
          console.log("Auth: New Google user, inserting record...");
          const { data: newUser, error } = await supabase.from("users").insert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
          }).select().single();
          
          if (!error && newUser) {
            console.log("Auth: Successfully created user record.");
            user.id = newUser.id;
          } else {
            console.error("Auth: Failed to create user record on Google login:", error);
            // We still let them sign in, but they'll use their Google ID instead of UUID
          }
        } else {
          console.log("Auth: Existing Google user found.");
          user.id = existingUser.id;
          if (!existingUser.avatar_url && user.image) {
            await supabase.from("users").update({ avatar_url: user.image }).eq("id", existingUser.id);
          }
        }
      }
      return true;
    },
    async session({ session, token }: any) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        // Ensure that token.sub gets the custom mapped `user.id` (UUID format) and not the Google Auth provider string.
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
