import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Answers {
  name_role?: string;
  current_role?: string;
  current_duties?: string;
  current_achievement?: string;
  previous_role?: string;
  skills?: string;
  education?: string;
  extras?: string;
  target_next?: string;
}

function parseNameRole(raw: string): { name: string; target_role: string } {
  const parts = raw.trim().split(/[,—–-]/).map((p) => p.trim()).filter(Boolean);
  const name = parts[0] || "Your Name";
  const target_role = parts.slice(1).join(", ") || "Professional";
  return { name, target_role };
}

function parseRoleCompany(raw: string): { role: string; company: string } {
  const parts = raw.trim().split(/[,—–-]/).map((p) => p.trim()).filter(Boolean);
  const role = parts[0] || "Professional";
  const company = parts.slice(1).join(", ") || "";
  return { role, company };
}

function parseSkills(raw: string): string[] {
  return raw
    .split(/[,\n;•]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 20);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const answers: Answers = body.answers ?? {};
    const userId: string | null = body.user_id ?? null;

    const { name, target_role } = parseNameRole(answers.name_role ?? "");
    const { role: recentRole, company: recentCompany } = parseRoleCompany(
      answers.current_role ?? "",
    );
    const skills = parseSkills(answers.skills ?? "");

    const cvId = crypto.randomUUID();
    const shareToken = crypto.randomUUID();

    // Build structured cv_data for the editor
    const experience: Record<string, unknown>[] = [];
    if (recentRole || recentCompany) {
      const bullets: string[] = [];
      if (answers.current_duties) bullets.push(answers.current_duties);
      if (answers.current_achievement) bullets.push(answers.current_achievement);
      experience.push({
        company: recentCompany,
        role: recentRole,
        start: "",
        end: "",
        bullets,
      });
    }
    if (answers.previous_role && answers.previous_role.toLowerCase() !== "none") {
      experience.push({
        company: "",
        role: answers.previous_role,
        start: "",
        end: "",
        bullets: [],
      });
    }

    const educationArr: Record<string, unknown>[] = [];
    if (answers.education) {
      educationArr.push({ school: answers.education, degree: "", start: "", end: "" });
    }

    const extrasArr: Record<string, unknown>[] = [];
    if (answers.extras && answers.extras.toLowerCase() !== "none") {
      extrasArr.push({ type: "Additional", title: "", description: answers.extras });
    }
    if (answers.target_next) {
      extrasArr.push({ type: "Objective", title: "", description: answers.target_next });
    }

    const cvData = {
      personal: {
        name,
        role: target_role,
        email: "",
        phone: "",
        location: "",
        linkedin: "",
      },
      summary: "",
      experience,
      education: educationArr,
      skills: { technical: skills, soft: [] },
      extras: extrasArr,
    };

    const cvTitle = `${name} — ${target_role}`;

    const { error } = await supabase.from("cvs").insert({
      id: cvId,
      user_id: userId,
      answers,
      name,
      target_role,
      recent_role: recentRole,
      recent_company: recentCompany,
      recent_duties: answers.current_duties ?? "",
      recent_achievement: answers.current_achievement ?? "",
      previous_role: answers.previous_role ?? "",
      skills,
      education: answers.education ?? "",
      extras: answers.extras ?? "",
      target_next: answers.target_next ?? "",
      share_token: shareToken,
      cv_data: cvData,
      title: cvTitle,
    });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ id: cvId, share_token: shareToken }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
