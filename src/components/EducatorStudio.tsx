import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
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
import type { CourseGenerationOptions } from '../types/courseGeneration';
import { DEFAULT_GENERATION_OPTIONS } from '../types/courseGeneration';
import { GenerationOptionsPanel } from './GenerationOptionsPanel';
import { PageHeader } from '../shell/PageHeader';
import { useRequireEducatorExperience } from '../hooks/useRequireEducatorExperience';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

const YOUTUBE_READONLY_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';
/** GIS popup auth-code flow requires this literal redirect_uri at token exchange (not window.location.origin). */
const YOUTUBE_OAUTH_REDIRECT_URI = 'postmessage';

type StudioTab = 'channel' | 'url';

export function EducatorStudio() {
  useRequireEducatorExperience();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [generationOptions, setGenerationOptions] = useState<CourseGenerationOptions>({ ...DEFAULT_GENERATION_OPTIONS });

  const setTab = (tab: StudioTab) => {
    setSearchParams(tab === 'url' ? { tab: 'url' } : {});
  };

  useEffect(() => {
    const incomingUrl =
      (location.state?.youtubeUrl as string | undefined)
      || (location.state?.playlistUrl as string | undefined);
    if (!incomingUrl) return;
    setPasteUrl(incomingUrl);
    setSearchParams({ tab: 'url' }, { replace: true });
  }, [location.state, setSearchParams]);

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
    redirect_uri: YOUTUBE_OAUTH_REDIRECT_URI,
    onSuccess: async (response) => {
      setConnecting(true);
      setError(null);
      try {
        const connected = await connectYoutubeChannel({
          code: response.code,
          redirectUri: YOUTUBE_OAUTH_REDIRECT_URI,
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
      state: { videoUrls: selectedVideos.map((v) => v.watchUrl), from: '/educator-studio', generationOptions },
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
    navigate('/course-details', { state: { ...state, generationOptions } });
  };

  const handleDisconnect = async () => {
    await disconnectYoutubeChannel();
    setStatus({ connected: false });
    setVideos([]);
    setSelected(new Set());
  };

  return (
    <div>
      <PageHeader
        label="Create"
        title="Studio"
        description="Build courses from your YouTube channel or any public video URL."
      />

      <GenerationOptionsPanel value={generationOptions} onChange={setGenerationOptions} />

      <Tabs value={activeTab} onValueChange={(v) => setTab(v as StudioTab)} className="mb-6">
        <TabsList>
          <TabsTrigger value="channel" className="gap-1.5"><LayoutGrid size={14} /> My channel</TabsTrigger>
          <TabsTrigger value="url" className="gap-1.5"><Link2 size={14} /> Paste URL</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'url' ? (
        <div className="max-w-2xl">
          <Card>
            <CardContent className="space-y-4 p-4">
              <textarea
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=… or playlist?list=…"
                rows={4}
                className="w-full resize-none bg-transparent text-sm outline-none"
              />
              <div className="flex justify-end">
                <Button onClick={handleBuildFromUrl} disabled={!pasteUrl.trim()}>Build course</Button>
              </div>
            </CardContent>
          </Card>
          {pasteError && <p className="mt-3 text-sm text-destructive">{pasteError}</p>}
        </div>
      ) : loadingStatus ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={16} /> Loading studio…
        </div>
      ) : !status?.connected ? (
        <div className="max-w-xl">
          <Card className="p-6">
            <CardContent className="space-y-4 p-0">
              <p className="text-sm text-muted-foreground">
                Connect YouTube to pick from your uploads, or use Paste URL for any public video.
              </p>
              <Button onClick={() => connectWithGoogle()} disabled={connecting}>
                {connecting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                Connect YouTube
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              {status.channelThumbnailUrl ? (
                <img src={status.channelThumbnailUrl} alt="" className="size-14 rounded-full object-cover" />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-muted"><Youtube size={24} /></div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-medium">{status.channelTitle || 'Your channel'}</h2>
                <p className="text-sm text-muted-foreground">{status.channelId}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => void handleDisconnect()}>
                <LogOut size={14} /> Disconnect
              </Button>
            </CardContent>
          </Card>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">Your uploads</h2>
            <p className="text-sm text-muted-foreground">{selected.size > 0 ? `${selected.size} selected` : 'Select videos'}</p>
          </div>

          {loadingVideos ? (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} /> Loading uploads…
            </div>
          ) : error ? (
            <p className="py-8 text-sm text-destructive">{error}</p>
          ) : videos.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">No videos found. Try Paste URL.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => {
                const isSelected = selected.has(video.videoId);
                return (
                  <button
                    key={video.videoId}
                    type="button"
                    onClick={() => toggleVideo(video.videoId)}
                    className={`overflow-hidden rounded-lg text-left transition-all ${isSelected ? 'ring-2 ring-[var(--brand)]' : 'border border-border'}`}
                  >
                    <div className="relative aspect-video bg-muted">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><Play size={24} className="text-muted-foreground" /></div>
                      )}
                      {isSelected && (
                        <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-[var(--brand)]">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'channel' && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-6 py-4 backdrop-blur lg:left-[240px]">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="text-sm font-medium">{selected.size} video{selected.size !== 1 ? 's' : ''} selected</span>
            <Button onClick={handleBuildFromSelection}>Build course</Button>
          </div>
        </div>
      )}
    </div>
  );
}
