import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Play, BookOpen, Video } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';
import { ALL_CREATORS, type Creator } from '../data/creators';
import { YTThumbnail } from './YTThumbnail';
import { fetchCreator } from '../api/catalogApi';
import { mapCatalogCreator } from '../utils/catalogMap';

export function EducatorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await fetchCreator(id);
        setCreator(mapCatalogCreator(data));
      } catch {
        setCreator(ALL_CREATORS.find((c) => c.id === id) ?? null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.text3 }}>
        Loading…
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.text }}>
        <div className="text-center">
          <p className="text-lg font-[600] mb-4">Educator not found.</p>
          <button onClick={() => navigate('/dashboard')} className="text-sm" style={{ color: C.red }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0b0b0e' : '#f4f4f5', color: C.text, fontFamily: 'var(--display)' }}>

      <div
        className="relative overflow-hidden"
        style={{
          background: isDark
            ? `linear-gradient(135deg, #0e0e12 0%, ${creator.color}22 60%, #0e0e12 100%)`
            : `linear-gradient(135deg, #ffffff 0%, ${creator.color}18 60%, #ffffff 100%)`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-6 left-6 flex items-center gap-2 text-[0.82rem] font-[500] px-3 py-1.5 rounded-lg transition-all z-10"
          style={{ color: C.text2, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = C.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = C.text2; }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="max-w-5xl mx-auto px-8 py-16 flex items-center gap-12">
          <div className="flex-1 min-w-0">
            <span
              className="inline-block px-3 py-0.5 rounded-full text-[0.68rem] font-[700] tracking-widest uppercase mb-4"
              style={{ background: creator.color + '22', color: creator.color, border: `1px solid ${creator.color}44` }}
            >
              {creator.category}
            </span>

            <h1
              className="text-[2.4rem] font-[800] leading-tight tracking-tight mb-3"
              style={{ color: C.text, fontFamily: 'var(--serif)' }}
            >
              {creator.name}
            </h1>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1.5 text-[0.8rem]" style={{ color: C.text3 }}>
                <Video className="w-3.5 h-3.5" />
                <span><strong style={{ color: C.text }}>{creator.videoCount.toLocaleString()}</strong> videos</span>
              </div>
              <div className="flex items-center gap-1.5 text-[0.8rem]" style={{ color: C.text3 }}>
                <BookOpen className="w-3.5 h-3.5" />
                <span><strong style={{ color: C.text }}>{creator.courses.length}</strong> courses</span>
              </div>
            </div>

            <p className="text-[0.92rem] font-[300] leading-relaxed mb-8" style={{ color: C.text2, maxWidth: 480 }}>
              {creator.bio}
            </p>

          </div>

          <div
            className="flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl hidden lg:block"
            style={{ width: 320, aspectRatio: '16/9', border: `1px solid ${creator.color}33` }}
          >
            <YTThumbnail videoId={creator.videoId} alt={creator.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <h2 className="text-[1.1rem] font-[700] mb-6" style={{ color: C.text }}>
          Published Courses
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {creator.courses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl overflow-hidden group transition-all duration-200"
              style={{
                background: isDark ? '#14141a' : '#ffffff',
                border: `1px solid ${C.border}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = creator.color + '55'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${creator.color}18`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: C.bg2 }}>
                <YTThumbnail videoId={course.videoId} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: creator.color }}>
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[0.65rem] font-[700]" style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', fontFamily: 'var(--mono)' }}>
                  {course.duration}
                </div>
              </div>

              <div className="px-4 py-3.5">
                <p className="text-[0.88rem] font-[600] leading-snug mb-2" style={{ color: C.text }}>
                  {course.title}
                </p>
                <span className="text-[0.72rem]" style={{ color: C.text3 }}>{course.views} views</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
