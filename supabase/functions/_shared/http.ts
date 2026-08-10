// Shared HTTP helpers for edge functions
// @ts-ignore -- Deno URL import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

declare const Deno: any;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function text(body: string, contentType: string, status = 200) {
  return new Response(body, {
    status,
    headers: { ...corsHeaders, "Content-Type": contentType },
  });
}

export function errorResponse(message: string, status = 400) {
  return json({ error: message }, status);
}

export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/** Validates the caller's JWT and returns the authenticated user id (or null). */
export async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } }, auth: { persistSession: false } },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

export async function readBody<T = any>(req: Request): Promise<T> {
  const raw = await req.text();
  if (!raw) return {} as T;
  try {
    const parsed = JSON.parse(raw);
    // Some callers double-encode with JSON.stringify
    return (typeof parsed === "string" ? JSON.parse(parsed) : parsed) as T;
  } catch {
    return {} as T;
  }
}

export function rangeStart(dateRange: string | undefined): Date {
  const d = new Date();
  switch (dateRange) {
    case "7d":
      d.setDate(d.getDate() - 7);
      break;
    case "90d":
      d.setDate(d.getDate() - 90);
      break;
    case "1y":
      d.setFullYear(d.getFullYear() - 1);
      break;
    default:
      d.setDate(d.getDate() - 30);
  }
  return d;
}

export function cleanDomain(input: string): string {
  return String(input || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export function avg(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function growth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
