import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Check,
  LayoutGrid,
  Link2,
  Loader2,
  LogOut,
  Play,
  Upload,
  Youtube,
} from 'lucide-react';
import {
  connectYoutubeChannel,
  disconnectYoutubeChannel,
  fetchYoutubeStatus,
  fetchYoutubeVideos,
  type EducatorYoutubeVideo,
  type YoutubeConnectionStatus,
} from '../api/educatorApi';
import { useUserProfile } from '../context/UserProfileContext';
import { courseGenStateFromYoutubeUrl, getYoutubeUrlValidationError } from '../utils/youtubeUrl';

const YOUTUBE_READONLY_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

const T = {
  bg: '#0f0f0f',
  panel: '#212121',
  panelHover: '#2a2a2a',
  border: 'rgba(255,255,255,0.08)',
  text: '#f1f1f1',
  muted: '#aaaaaa',
  accent: '#ff0000',
  accentSoft: 'rgba(255,0,0,0.12)',
};

type StudioTab = 'channel' | 'url';

export function EducatorStudio() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, refreshProfile } = useUserProfile();
  const activeTab: StudioTab = searchParams.get('tab') === 'url' ? 'url' : 'channel';

  const [status, setStatus] = useState<YoutubeConnectionStatus | null>(null);
  const [videos, setVideos] = useState<EducatorYoutubeVideo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pasteUrl, setPasteUrl] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);

  const setTab = (tab: StudioTab) => {
    setSearchParams(tab === 'url' ? { tab: 'url' } : {});
  };

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const data = await fetchYoutubeStatus();
      setStatus(data);
      return data;
    } catch {
      setStatus({ connected: false });
      return { connected: false };
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    setLoadingVideos(true);
    setError(null);
    try {
      const list = await fetchYoutubeVideos();
      setVideos(list);
    } catch (err) {
      setVideos([]);
      setError(err instanceof Error ? err.message : 'Could not load your YouTube videos');
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const s = await loadStatus();
      if (s.connected && activeTab === 'channel') {
        await loadVideos();
      }
    })();
  }, [loadStatus, loadVideos, activeTab]);

  const connectWithGoogle = useGoogleLogin({
    flow: 'auth-code',
    scope: YOUTUBE_READONLY_SCOPE,
    onSuccess: async (response) => {
      setConnecting(true);
      setError(null);
      try {
        const connected = await connectYoutubeChannel({
          code: response.code,
          redirectUri: window.location.origin,
        });
        setStatus(connected);
        await refreshProfile();
        setTab('channel');
        await loadVideos();
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (typeof err.response?.data?.message === 'string' ? err.response.data.message : err.message)
          : err instanceof Error ? err.message : 'YouTube connection failed';
        setError(message);
      } finally {
        setConnecting(false);
      }
    },
    onError: () => setError('Google authorization was cancelled or failed'),
  });

  const toggleVideo = (videoId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const selectedVideos = useMemo(
    () => videos.filter((v) => selected.has(v.videoId)),
    [videos, selected],
  );

  const handleBuildFromSelection = () => {
    if (selectedVideos.length === 0) return;
    navigate('/course-details', {
      state: { videoUrls: selectedVideos.map((v) => v.watchUrl), from: '/educator-studio' },
    });
  };

  const handleBuildFromUrl = () => {
    setPasteError(null);
    const validationError = getYoutubeUrlValidationError(pasteUrl);
    if (validationError) {
      setPasteError(validationError);
      return;
    }
    const state = courseGenStateFromYoutubeUrl(pasteUrl, '/educator-studio');
    if (!state) {
      setPasteError('Invalid YouTube URL');
      return;
    }
    navigate('/course-details', { state });
  };

  const handleDisconnect = async () => {
    await disconnectYoutubeChannel();
    setStatus({ connected: false });
    setVideos([]);
    setSelected(new Set());
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Roboto', 'Inter', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm no-underline" style={{ color: T.muted }}>← Dashboard</Link>
          <div className="flex items-center gap-2">
            <Youtube size={20} style={{ color: T.accent }} />
            <span className="font-semibold text-lg">Quib Studio</span>
          </div>
        </div>
        <div className="text-sm" style={{ color: T.muted }}>{profile?.displayName || profile?.email || 'Educator'}</div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        <aside className="w-56 border-r p-4 hidden md:block" style={{ borderColor: T.border }}>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setTab('channel')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border-0 cursor-pointer text-left"
              style={{ background: activeTab === 'channel' ? T.panel : 'transparent', color: activeTab === 'channel' ? T.text : T.muted }}
            >
              <LayoutGrid size={16} /> My channel
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm border-0 cursor-pointer text-left"
              style={{ background: activeTab === 'url' ? T.panel : 'transparent', color: activeTab === 'url' ? T.text : T.muted }}
            >
              <Link2 size={16} /> Paste URL
            </button>
          </nav>
          <p className="text-xs mt-6 px-2 leading-relaxed" style={{ color: T.muted }}>
            Build from one video, several videos, or a playlist — no playlist required for single videos.
          </p>
        </aside>

        <main className="flex-1 p-6 max-w-6xl">
          {/* Mobile tab switcher */}
          <div className="flex gap-2 mb-6 md:hidden">
            {(['channel', 'url'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTab(tab)}
                className="px-4 py-2 rounded-lg text-sm border-0 cursor-pointer"
                style={{ background: activeTab === tab ? T.panel : T.panelHover, color: T.text }}
              >
                {tab === 'channel' ? 'My channel' : 'Paste URL'}
              </button>
            ))}
          </div>

          {activeTab === 'url' ? (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-semibold mb-2">Build from a YouTube URL</h1>
              <p className="text-sm mb-6" style={{ color: T.muted }}>
                Paste a single video link to generate a course from that one video, or paste a playlist URL for a multi-video course. Same flow either way.
              </p>
              <div className="rounded-2xl p-4" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                <textarea
                  value={pasteUrl}
                  onChange={(e) => setPasteUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=… or playlist?list=…"
                  rows={4}
                  className="w-full resize-none bg-transparent outline-none text-sm"
                  style={{ color: T.text }}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={handleBuildFromUrl}
                    disabled={!pasteUrl.trim()}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white border-0 cursor-pointer disabled:opacity-50"
                    style={{ background: T.accent }}
                  >
                    Build course
                  </button>
                </div>
              </div>
              {pasteError && <p className="mt-3 text-sm" style={{ color: T.accent }}>{pasteError}</p>}
              <p className="mt-4 text-xs" style={{ color: T.muted }}>
                Sign in before building if you want to publish the course to the catalog.
              </p>
            </div>
          ) : loadingStatus ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: T.muted }}>
              <Loader2 className="animate-spin" size={16} /> Loading studio…
            </div>
          ) : !status?.connected ? (
            <div className="max-w-xl">
              <h1 className="text-2xl font-semibold mb-2">Connect your YouTube channel</h1>
              <p className="text-sm mb-6" style={{ color: T.muted }}>
                Optional: connect to pick videos from your uploads grid. You can also use <button type="button" className="underline border-0 bg-transparent cursor-pointer p-0" style={{ color: T.text }} onClick={() => setTab('url')}>Paste URL</button> for any public video without connecting.
              </p>
              <button
                type="button"
                onClick={() => connectWithGoogle()}
                disabled={connecting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white border-0 cursor-pointer disabled:opacity-60"
                style={{ background: T.accent }}
              >
                {connecting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                Connect YouTube
              </button>
              {error && <p className="mt-4 text-sm" style={{ color: T.accent }}>{error}</p>}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4 p-5 rounded-2xl mb-6" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                {status.channelThumbnailUrl ? (
                  <img src={status.channelThumbnailUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: T.panelHover }}>
                    <Youtube size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold truncate">{status.channelTitle || 'Your channel'}</h1>
                  <p className="text-sm" style={{ color: T.muted }}>{status.channelId}</p>
                </div>
                <button type="button" onClick={() => void handleDisconnect()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border-0 cursor-pointer" style={{ background: T.panelHover, color: T.muted }}>
                  <LogOut size={14} /> Disconnect
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Your uploads</h2>
                <p className="text-sm" style={{ color: T.muted }}>
                  {selected.size > 0 ? `${selected.size} selected` : 'Select one or more videos'}
                </p>
              </div>

              {loadingVideos ? (
                <div className="flex items-center gap-2 text-sm py-12" style={{ color: T.muted }}>
                  <Loader2 className="animate-spin" size={16} /> Loading uploads…
                </div>
              ) : error ? (
                <p className="text-sm py-8" style={{ color: T.accent }}>{error}</p>
              ) : videos.length === 0 ? (
                <p className="text-sm py-8" style={{ color: T.muted }}>No videos found. Try Paste URL for a single public video.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {videos.map((video) => {
                    const isSelected = selected.has(video.videoId);
                    return (
                      <button
                        key={video.videoId}
                        type="button"
                        onClick={() => toggleVideo(video.videoId)}
                        className="text-left rounded-xl overflow-hidden border-0 p-0 cursor-pointer relative"
                        style={{ background: T.panel, outline: isSelected ? `2px solid ${T.accent}` : `1px solid ${T.border}` }}
                      >
                        <div className="aspect-video relative overflow-hidden" style={{ background: '#111' }}>
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Play size={24} style={{ color: T.muted }} /></div>
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: T.accent }}>
                              <Check size={14} color="#fff" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium line-clamp-2 leading-snug">{video.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {activeTab === 'channel' && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between border-t" style={{ background: '#181818', borderColor: T.border }}>
          <span className="text-sm font-medium">{selected.size} video{selected.size !== 1 ? 's' : ''} selected</span>
          <button type="button" onClick={handleBuildFromSelection} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white border-0 cursor-pointer" style={{ background: T.accent }}>
            Build course
          </button>
        </div>
      )}
    </div>
  );
}
