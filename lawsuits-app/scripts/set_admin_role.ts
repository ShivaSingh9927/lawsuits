import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setAdminRole(email: string) {
  console.log("Checking user: " + email);
  
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("email", email)
    .single();

  if (userError || !user) {
    console.error("User " + email + " not found in 'users' table.");
    return;
  }

  console.log("Found user: " + user.id + ". Current role: " + user.role);

  const { data, error } = await supabase
    .from("users")
    .update({ role: "admin" })
    .eq("id", user.id)
    .select();

  if (error) {
    console.error("Error updating role:", error);
  } else {
    console.log("\nSUCCESS: Updated " + email + " to 'admin' role.");
  }
}

const targetEmail = "rahulkumar10a6@gmail.com";
setAdminRole(targetEmail);
