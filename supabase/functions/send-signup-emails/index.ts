import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupEmailRequest {
  user_id: string;
  email: string;
  full_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, full_name }: SignupEmailRequest = await req.json();
    
    console.log(`Processing signup emails for user: ${email} (${user_id})`);

    // Send welcome email to new user
    const welcomeEmailResponse = await resend.emails.send({
      from: "GenerativeSearch.pro <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to GenerativeSearch.pro - Your AI-Powered SEO Journey Begins!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin: 0;">Welcome to GenerativeSearch.pro!</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #1e40af; margin-top: 0;">Hi ${full_name || 'there'}! 👋</h2>
            <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
              Thank you for joining GenerativeSearch.pro! You've just taken the first step towards revolutionizing your SEO strategy with AI-powered insights.
            </p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-bottom: 15px;">🚀 What's Next?</h3>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
              <li><strong>Analyze Your First Domain:</strong> Start with our comprehensive SEO analysis tool</li>
              <li><strong>Generate AI Content:</strong> Create optimized content that ranks higher</li>
              <li><strong>Monitor Citations:</strong> Track how AI search engines reference your content</li>
              <li><strong>Schema Optimization:</strong> Boost your AI visibility with structured data</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://generativesearch.pro/dashboard" 
               style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600;
                      display: inline-block;">
              Get Started Now
            </a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 Pro Tip:</h4>
            <p style="color: #374151; margin-bottom: 0; line-height: 1.6;">
              Start by analyzing your most important landing pages first. Our AI insights will help you understand exactly what changes to make for better search visibility.
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Questions? Reply to this email or visit our <a href="https://generativesearch.pro/support" style="color: #2563eb;">help center</a>.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
              <strong>GenerativeSearch.pro</strong> - Your AI-Powered SEO Partner
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", welcomeEmailResponse);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "GenerativeSearch.pro <alerts@resend.dev>",
      to: ["david@digitalfrontier.app"],
      subject: "🎉 New User Signup - GenerativeSearch.pro",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h1 style="margin: 0; font-size: 24px;">🎉 New User Signup!</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">User Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Name:</td>
                <td style="padding: 8px 0; color: #374151;">${full_name || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #374151;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">User ID:</td>
                <td style="padding: 8px 0; color: #374151; font-family: monospace;">${user_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #374151; font-weight: 600;">Signup Time:</td>
                <td style="padding: 8px 0; color: #374151;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://supabase.com/dashboard/project/yyrjtiuvxhdwsjjrlxtm/auth/users" 
               style="background: #2563eb; 
                      color: white; 
                      padding: 10px 20px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: 500;
                      display: inline-block;
                      margin-right: 10px;">
              View in Supabase
            </a>
            <a href="https://generativesearch.pro/admin" 
               style="background: #059669; 
                      color: white; 
                      padding: 10px 20px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: 500;
                      display: inline-block;">
              Admin Dashboard
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is an automated notification from GenerativeSearch.pro
            </p>
          </div>
        </div>
      `,
    });

    console.log("Admin notification email sent successfully:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        welcomeEmail: welcomeEmailResponse,
        adminEmail: adminEmailResponse
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-signup-emails function:", error);
    
    // Don't let email failures block user signup
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        note: "User signup completed but email notification failed"
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 to not block the signup process
      }
    );
  }
};

serve(handler);