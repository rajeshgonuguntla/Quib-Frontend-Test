import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DarkLayout } from './DarkLayout';
import { Award, Download, Share2, Eye, Calendar, TrendingUp, ExternalLink, CheckCircle } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

export function MyCertificates() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [searchQuery, setSearchQuery] = useState('');

  const certificates = [
    {
      id: '1', title: 'Introduction to Machine Learning', issueDate: 'February 17, 2026', score: 92,
      certificateId: 'QUIB-2026-ML-8472', skills: ['Machine Learning', 'Python', 'Data Science'],
    },
    {
      id: '2', title: 'Python for Data Science', issueDate: 'January 22, 2026', score: 88,
      certificateId: 'QUIB-2026-PY-6253', skills: ['Python', 'Data Analysis', 'NumPy', 'Pandas'],
    },
    {
      id: '3', title: 'CSS Grid and Flexbox Mastery', issueDate: 'January 15, 2026', score: 95,
      certificateId: 'QUIB-2026-CS-9381', skills: ['CSS', 'Web Design', 'Responsive Design'],
    },
    {
      id: '4', title: 'JavaScript ES6+ Features', issueDate: 'December 28, 2025', score: 90,
      certificateId: 'QUIB-2025-JS-7462', skills: ['JavaScript', 'ES6', 'Modern JavaScript'],
    },
  ];

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: certificates.length,
    avgScore: Math.round(certificates.reduce((acc, c) => acc + c.score, 0) / certificates.length),
    thisMonth: certificates.filter((c) => c.issueDate.includes('February 2026')).length,
  };

  const statCards = [
    { label: 'Total Certificates', value: stats.total, icon: Award, color: C.red },
    { label: 'Average Score', value: `${stats.avgScore}%`, icon: TrendingUp, color: '#22c55e' },
    { label: 'This Month', value: stats.thisMonth, icon: Calendar, color: '#3b82f6' },
  ];

  return (
    <DarkLayout
      activeNav="certificates"
      title="My Certificates"
      subtitle="View, download, and share your earned certificates"
      searchPlaceholder="Search certificates by title or ID..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-5"
            style={{ background: C.bg1, border: `1px solid ${C.border}` }}
          >
            <div className="mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}15` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-[700] mb-0.5" style={{ color: C.text }}>{s.value}</div>
            <div className="text-xs font-[300]" style={{ color: C.text2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        {filteredCertificates.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ background: C.bg1, border: `1px solid ${C.border}` }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: C.bg2 }}
            >
              <Award className="w-7 h-7" style={{ color: C.text3 }} />
            </div>
            <h3 className="text-base font-[600] mb-2" style={{ color: C.text }}>No certificates found</h3>
            <p className="text-sm mb-6" style={{ color: C.text2 }}>
              {searchQuery ? 'Try a different search term.' : 'Complete quizzes to earn certificates.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 rounded-lg text-sm font-[600] text-white"
              style={{ background: C.red }}
            >
              Take a Quiz
            </button>
          </div>
        ) : (
          filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-xl p-6 md:p-8 transition-colors"
              style={{ background: C.bg1, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.border2)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Certificate Preview */}
                <div
                  className="w-full md:w-56 h-40 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${C.bg2}, ${C.bg3})`,
                    border: `2px solid ${C.border2}`,
                  }}
                >
                  <Award className="w-12 h-12 mb-2" style={{ color: C.red }} />
                  <div className="text-[0.65rem] font-[500] mb-1" style={{ color: C.text3, fontFamily: "var(--mono)", letterSpacing: '0.08em' }}>
                    CERTIFICATE OF ACHIEVEMENT
                  </div>
                  <div className="text-sm font-[700]" style={{ color: C.text }}>Score: {cert.score}%</div>
                </div>

                {/* Certificate Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-[700] mb-2" style={{ color: C.text }}>{cert.title}</h3>
                  <div className="flex items-center gap-4 text-xs mb-4" style={{ color: C.text3 }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Issued: {cert.issueDate}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: '#22c55e' }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>

                  {/* Certificate ID */}
                  <div
                    className="rounded-lg p-3 mb-4"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[0.65rem] mb-0.5" style={{ color: C.text3, fontFamily: "var(--mono)" }}>
                          CERTIFICATE ID
                        </div>
                        <div className="text-sm font-[600]" style={{ color: C.text, fontFamily: "var(--mono)" }}>
                          {cert.certificateId}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/verify/${cert.certificateId}`)}
                        className="flex items-center gap-1 text-xs font-[500] transition-opacity hover:opacity-80"
                        style={{ color: C.red }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verify
                      </button>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="mb-5">
                    <div className="text-[0.65rem] mb-2" style={{ color: C.text3, fontFamily: "var(--mono)", letterSpacing: '0.08em' }}>
                      SKILLS VALIDATED
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-full text-[0.7rem] font-[500]"
                          style={{
                            background: C.redDim,
                            color: C.red,
                            border: `1px solid rgba(225,6,0,0.15)`,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => navigate(`/certificate/${cert.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-[600] text-white transition-all hover:opacity-90"
                      style={{ background: C.red }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => alert(`Downloading certificate ${cert.certificateId} as PDF...`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-[500] transition-all hover:opacity-80"
                      style={{ color: C.text2, border: `1px solid ${C.border}` }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => alert(`Sharing certificate ${cert.certificateId} to LinkedIn...`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-[500] transition-all hover:opacity-80"
                      style={{ color: C.text2, border: `1px solid ${C.border}` }}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share to LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DarkLayout>
  );
}
