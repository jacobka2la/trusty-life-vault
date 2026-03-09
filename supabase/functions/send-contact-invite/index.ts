import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callingUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { contactId } = await req.json();

    const { data: contact, error: contactError } = await supabaseAdmin
      .from("trusted_contacts")
      .select("*")
      .eq("id", contactId)
      .eq("user_id", callingUser.id)
      .single();

    if (contactError || !contact) {
      console.error("Contact error:", contactError);
      return new Response(JSON.stringify({ error: "Contact not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!contact.email) {
      return new Response(JSON.stringify({ error: "Contact has no email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this person already has an account
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.find((u: any) => u.email === contact.email);

    if (existingUser) {
      // User already exists — link them directly
      await supabaseAdmin
        .from("trusted_contacts")
        .update({ 
          invitation_sent: true, 
          invited_user_id: existingUser.id, 
          invitation_sent_at: new Date().toISOString() 
        })
        .eq("id", contactId);

      return new Response(
        JSON.stringify({ success: true, message: `${contact.full_name} already has an account and has been linked to your vault.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // New user — generate invite link that points to the app directly
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/+$/, "") || "https://trusty-life-vault.lovable.app";
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: contact.email,
      options: {
        data: {
          first_name: contact.full_name.split(" ")[0] || "",
          last_name: contact.full_name.split(" ").slice(1).join(" ") || "",
          invited_as_contact: true,
          invited_by: callingUser.id,
        },
      },
    });

    if (linkError) {
      console.error("Generate link error:", linkError);
      return new Response(JSON.stringify({ error: linkError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Construct a direct app link with the token hash
    const hashedToken = linkData?.properties?.hashed_token;
    const inviteLink = `${origin}/invite?token_hash=${encodeURIComponent(hashedToken)}&type=invite&contact=${contactId}`;

    await supabaseAdmin
      .from("trusted_contacts")
      .update({
        invitation_sent: true,
        invitation_sent_at: new Date().toISOString(),
      })
      .eq("id", contactId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invite link generated for ${contact.full_name}. Share this link with them.`,
        inviteLink,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending invite:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
