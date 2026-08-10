// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  errorResponse,
  json,
  readBody,
  getUserId,
  serviceClient,
} from "../_shared/http.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const body = await readBody(req);
    const event: string = (body.event || "").toString().trim();
    if (!event || event.length > 120) {
      return errorResponse("A valid event name is required", 400);
    }
    const properties =
      body.properties && typeof body.properties === "object" ? body.properties : {};

    const supabase = serviceClient();
    const { error } = await supabase.from("analytics_events").insert({
      user_id: userId,
      event,
      properties,
    });
    if (error) throw error;

    return json({ success: true });
  } catch (e) {
    console.error("track-analytics-event error", e);
    return errorResponse((e as Error).message || "Failed to track event", 500);
  }
});
