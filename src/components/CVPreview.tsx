import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Briefcase,
  GraduationCap,
  Wrench,
  Heart,
  FolderOpen,
} from 'lucide-react';

export interface CVPreviewData {
  personal: {
    name?: string | null;
    role?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
  };
  summary?: string | null;
  experience: {
    company: string;
    role: string;
    start: string;
    end: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    start: string;
    end: string;
  }[];
  skills: {
    technical: string[];
    soft: string[];
  };
  extras: {
    type: string;
    title: string;
    description: string;
  }[];
}

function hasContact(info: CVPreviewData['personal']): boolean {
  return Boolean(info.email || info.phone || info.location || info.linkedin);
}

function hasExperience(exp: CVPreviewData['experience']): boolean {
  return exp.some((e) => e.company || e.role || e.bullets.length > 0);
}

function hasEducation(edu: CVPreviewData['education']): boolean {
  return edu.some((e) => e.school || e.degree);
}

function hasSkills(skills: CVPreviewData['skills']): boolean {
  return skills.technical.length > 0 || skills.soft.length > 0;
}

function hasExtras(extras: CVPreviewData['extras']): boolean {
  return extras.some((e) => e.title || e.description);
}

function SectionLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="cv-section-label">
      <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-800">
        {icon}
        {children}
      </h2>
      <div className="mt-1.5 h-px bg-gray-200" />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2.5 py-0.5 text-[12px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md leading-relaxed">
      {children}
    </span>
  );
}

export default function CVPreview({ cvData }: { cvData: CVPreviewData }) {
  const { personal, summary, experience, education, skills, extras } = cvData;

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
  ].filter(Boolean) as string[];

  return (
    <div className="flex justify-center">
      <div className="cv-preview w-full max-w-[794px] bg-white shadow-xl rounded-sm overflow-hidden">
        <div className="cv-page px-12 py-10 sm:px-14 sm:py-12">
          {/* Header */}
          <header className="text-center">
            <h1 className="text-[24px] font-bold text-gray-900 leading-tight tracking-tight">
              {personal.name || 'Your Name'}
            </h1>
            {personal.role && (
              <p className="mt-1 text-[14px] font-medium text-gray-600">
                {personal.role}
              </p>
            )}
            {contactItems.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[12px] text-gray-500">
                {contactItems.map((item, i) => (
                  <span key={i} className="flex items-center">
                    {i > 0 && <span className="text-gray-300 mr-2">·</span>}
                    {item}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="mt-5 h-px bg-gray-200" />

          {/* Professional Summary */}
          {summary && summary.trim() && (
            <section className="mt-7">
              <SectionLabel>Professional Summary</SectionLabel>
              <p className="mt-2.5 text-[13px] text-gray-700 leading-relaxed text-justify">
                {summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {hasExperience(experience) && (
            <section className="mt-7">
              <SectionLabel icon={<Briefcase className="h-3.5 w-3.5" />}>Experience</SectionLabel>
              <div className="mt-3 space-y-4">
                {experience
                  .filter((e) => e.company || e.role || e.bullets.length > 0)
                  .map((exp, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="min-w-0">
                          {exp.company && (
                            <span className="text-[13px] font-bold text-gray-900">
                              {exp.company}
                            </span>
                          )}
                          {exp.role && (
                            <span className="text-[13px] italic text-gray-600">
                              {exp.company && ' — '}
                              {exp.role}
                            </span>
                          )}
                        </div>
                        {(exp.start || exp.end) && (
                          <span className="text-[12px] text-gray-400 whitespace-nowrap shrink-0">
                            {[exp.start, exp.end].filter(Boolean).join(' — ')}
                          </span>
                        )}
                      </div>
                      {exp.bullets.length > 0 && (
                        <ul className="mt-1.5 space-y-1">
                          {exp.bullets.map((b, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-[13px] text-gray-700 leading-relaxed"
                            >
                              <span className="text-gray-400 mt-[2px] leading-none">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Education */}
          {hasEducation(education) && (
            <section className="mt-7">
              <SectionLabel icon={<GraduationCap className="h-3.5 w-3.5" />}>Education</SectionLabel>
              <div className="mt-3 space-y-3">
                {education
                  .filter((e) => e.school || e.degree)
                  .map((edu, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        {edu.school && (
                          <span className="text-[13px] font-bold text-gray-900">
                            {edu.school}
                          </span>
                        )}
                        {edu.degree && (
                          <span className="text-[13px] text-gray-600">
                            {edu.school && ' — '}
                            {edu.degree}
                          </span>
                        )}
                      </div>
                      {(edu.start || edu.end) && (
                        <span className="text-[12px] text-gray-400 whitespace-nowrap shrink-0">
                          {[edu.start, edu.end].filter(Boolean).join(' — ')}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {hasSkills(skills) && (
            <section className="mt-7">
              <SectionLabel icon={<Wrench className="h-3.5 w-3.5" />}>Skills</SectionLabel>
              <div className="mt-3 space-y-2.5">
                {skills.technical.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-[12px] font-semibold text-gray-500 w-16 shrink-0 pt-0.5">
                      Technical
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.technical.map((s, i) => (
                        <Pill key={i}>{s}</Pill>
                      ))}
                    </div>
                  </div>
                )}
                {skills.soft.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-[12px] font-semibold text-gray-500 w-16 shrink-0 pt-0.5 flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Soft
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.soft.map((s, i) => (
                        <Pill key={i}>{s}</Pill>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Additional */}
          {hasExtras(extras) && (
            <section className="mt-7">
              <SectionLabel icon={<FolderOpen className="h-3.5 w-3.5" />}>Additional</SectionLabel>
              <div className="mt-3 space-y-3">
                {extras
                  .filter((e) => e.title || e.description)
                  .map((extra, i) => (
                    <div key={i}>
                      <div className="flex items-baseline gap-2">
                        {extra.type && (
                          <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">
                            {extra.type}
                          </span>
                        )}
                        {extra.title && (
                          <span className="text-[13px] font-bold text-gray-900">
                            {extra.title}
                          </span>
                        )}
                      </div>
                      {extra.description && (
                        <p className="mt-0.5 text-[13px] text-gray-700 leading-relaxed">
                          {extra.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
