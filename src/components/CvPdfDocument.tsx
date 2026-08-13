import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CVPreviewData } from '@/components/CVPreview';

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: '#374151',
    lineHeight: 1.5,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textAlign: 'center',
  },
  role: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  contactItem: {
    fontSize: 10,
    color: '#6b7280',
  },
  divider: {
    marginTop: 14,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#1f2937',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  summary: {
    fontSize: 10.5,
    color: '#374151',
    textAlign: 'justify',
    lineHeight: 1.55,
  },
  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  expCompany: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  expRole: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#4b5563',
  },
  expDate: {
    fontSize: 10,
    color: '#9ca3af',
  },
  bullet: {
    flexDirection: 'row',
    marginTop: 2,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#9ca3af',
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    color: '#374151',
    lineHeight: 1.5,
  },
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  eduSchool: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  eduDegree: {
    fontSize: 11,
    color: '#4b5563',
  },
  eduDate: {
    fontSize: 10,
    color: '#9ca3af',
  },
  skillsGroup: {
    flexDirection: 'row',
    marginTop: 4,
  },
  skillsLabel: {
    width: 60,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
  },
  skillsPills: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pill: {
    fontSize: 10,
    color: '#374151',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  extraType: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#4f46e5',
  },
  extraTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  extraDesc: {
    fontSize: 10.5,
    color: '#374151',
    marginTop: 2,
    lineHeight: 1.5,
  },
  section: {
    marginTop: 14,
  },
});

export function CvPdfDocument({ cvData }: { cvData: CVPreviewData }) {
  const { personal, summary, experience, education, skills, extras } = cvData;

  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
  ].filter(Boolean) as string[];

  const hasExperience = experience.some((e) => e.company || e.role || e.bullets.length > 0);
  const hasEducation = education.some((e) => e.school || e.degree);
  const hasSkills = skills.technical.length > 0 || skills.soft.length > 0;
  const hasExtras = extras.some((e) => e.title || e.description);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{personal.name || 'Your Name'}</Text>
        {personal.role && <Text style={styles.role}>{personal.role}</Text>}
        {contactItems.length > 0 && (
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i} style={styles.contactItem}>
                {i > 0 ? `· ${item}` : item}
              </Text>
            ))}
          </View>
        )}
        <View style={styles.divider} />

        {summary && summary.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Professional Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {hasExperience && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Experience</Text>
            {experience
              .filter((e) => e.company || e.role || e.bullets.length > 0)
              .map((exp, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={styles.expRow}>
                    <View>
                      {exp.company && <Text style={styles.expCompany}>{exp.company}</Text>}
                      {exp.role && (
                        <Text style={styles.expRole}>
                          {exp.company && ' — '}
                          {exp.role}
                        </Text>
                      )}
                    </View>
                    {(exp.start || exp.end) && (
                      <Text style={styles.expDate}>
                        {[exp.start, exp.end].filter(Boolean).join(' — ')}
                      </Text>
                    )}
                  </View>
                  {exp.bullets.map((b, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              ))}
          </View>
        )}

        {hasEducation && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Education</Text>
            {education
              .filter((e) => e.school || e.degree)
              .map((edu, i) => (
                <View key={i} style={styles.eduRow}>
                  <View>
                    {edu.school && <Text style={styles.eduSchool}>{edu.school}</Text>}
                    {edu.degree && (
                      <Text style={styles.eduDegree}>
                        {edu.school && ' — '}
                        {edu.degree}
                      </Text>
                    )}
                  </View>
                  {(edu.start || edu.end) && (
                    <Text style={styles.eduDate}>
                      {[edu.start, edu.end].filter(Boolean).join(' — ')}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {hasSkills && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Skills</Text>
            {skills.technical.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Technical</Text>
                <View style={styles.skillsPills}>
                  {skills.technical.map((s, i) => (
                    <Text key={i} style={styles.pill}>{s}</Text>
                  ))}
                </View>
              </View>
            )}
            {skills.soft.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Soft</Text>
                <View style={styles.skillsPills}>
                  {skills.soft.map((s, i) => (
                    <Text key={i} style={styles.pill}>{s}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {hasExtras && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Additional</Text>
            {extras
              .filter((e) => e.title || e.description)
              .map((extra, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {extra.type && <Text style={styles.extraType}>{extra.type}</Text>}
                    {extra.title && <Text style={styles.extraTitle}>{extra.title}</Text>}
                  </View>
                  {extra.description && <Text style={styles.extraDesc}>{extra.description}</Text>}
                </View>
              ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
