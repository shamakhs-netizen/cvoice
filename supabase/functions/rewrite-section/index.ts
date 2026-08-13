import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RewriteRequest {
  section: "summary" | "bullets";
  content: string;
  context?: string;
}

function rewriteSummary(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return "Experienced professional with a proven track record of delivering results and driving continuous improvement.";
  }

  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  const cleaned = sentences
    .map((s) => {
      let c = s.trim();
      c = c.charAt(0).toUpperCase() + c.slice(1);
      if (!/[.!?]$/.test(c)) c += ".";
      return c;
    })
    .join(" ");

  const lower = trimmed.toLowerCase();
  const hasYears = /\d+\+?\s*(years|yrs)/.test(lower);
  const hasRole = /\b(engineer|developer|manager|designer|analyst|consultant|specialist|lead|director)\b/.test(lower);

  const prefixes: string[] = [];
  if (hasRole) prefixes.push("Results-driven professional");
  else prefixes.push("Dedicated professional");

  if (hasYears) {
    const match = lower.match(/(\d+)\+?\s*(years|yrs)/);
    if (match) prefixes.push(`with ${match[1]}+ years of experience`);
  }

  const prefix = prefixes.join(" ");
  const body = cleaned.replace(/^(I am|I'm|i am|i'm)\s+/i, "");

  return `${prefix}, ${body.charAt(0).toLowerCase()}${body.slice(1)}`.replace(/\.\.$/, ".");
}

function rewriteBullets(content: string, context?: string): string[] {
  const lines = content
    .split(/\n+/)
    .map((l) => l.trim().replace(/^[•\-*]\s*/, ""))
    .filter(Boolean);

  if (lines.length === 0) {
    return ["Delivered key projects on time and within scope, contributing to team success."];
  }

  const actionVerbs = [
    "Led", "Developed", "Implemented", "Designed", "Built", "Optimized",
    "Managed", "Created", "Improved", "Launched", "Streamlined", "Architected",
    "Spearheaded", "Drove", "Established", "Coordinated",
  ];

  return lines.map((line, i) => {
    let bullet = line.trim();

    // Remove weak openers
    bullet = bullet.replace(/^(I|i)\s+(was|am|did|worked|helped|responsible for)\s+/i, "");
    bullet = bullet.replace(/^(responsible for|duties included|tasked with)\s+/i, "");

    // Capitalize first letter
    bullet = bullet.charAt(0).toUpperCase() + bullet.slice(1);

    // Add a strong action verb if the bullet doesn't start with one
    const startsWithVerb = actionVerbs.some((v) =>
      bullet.toLowerCase().startsWith(v.toLowerCase())
    );
    if (!startsWithVerb) {
      const verb = actionVerbs[i % actionVerbs.length];
      bullet = `${verb} ${bullet.charAt(0).toLowerCase()}${bullet.slice(1)}`;
    }

    // Ensure it ends with a period
    if (!/[.!?]$/.test(bullet)) bullet += ".";

    return bullet;
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RewriteRequest = await req.json();
    const { section, content, context } = body;

    if (section === "summary") {
      const rewritten = rewriteSummary(content);
      return new Response(
        JSON.stringify({ content: rewritten }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (section === "bullets") {
      const bullets = rewriteBullets(content, context);
      return new Response(
        JSON.stringify({ bullets }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid section. Use 'summary' or 'bullets'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
