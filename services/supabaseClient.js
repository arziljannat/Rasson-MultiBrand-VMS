const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn(
        "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel/local environment."
    );
}

const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseServiceRoleKey || "placeholder-key",
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

module.exports = supabase;
