import { useEffect, useRef } from 'react';
import { recordWatchProgress } from '../api/courseApi';

type YTPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

type YTPlayerState = {
  UNSTARTED: number;
  ENDED: number;
  PLAYING: number;
  PAUSED: number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: YTPlayerState;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    });
  }
  return youtubeApiPromise;
}

const HEARTBEAT_MS = 20_000;

type YoutubeLessonPlayerProps = {
  videoId: string;
  title: string;
  courseId: string;
  lessonId: string;
  /** When false, renders player without sending telemetry (anonymous / preview). */
  trackProgress: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function YoutubeLessonPlayer({
  videoId,
  title,
  courseId,
  lessonId,
  trackProgress,
  className,
  style,
}: YoutubeLessonPlayerProps) {
  const containerId = useRef(`yt-player-${lessonId}-${Math.random().toString(36).slice(2, 9)}`);
  const playerRef = useRef<YTPlayer | null>(null);
  const sessionIdRef = useRef<string | undefined>();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendingRef = useRef(false);

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const sendProgress = async (player: YTPlayer) => {
    if (!trackProgress || sendingRef.current) return;
    const duration = Math.floor(player.getDuration() || 0);
    if (duration <= 0) return;

    const positionSec = Math.min(Math.floor(player.getCurrentTime() || 0), duration);
    sendingRef.current = true;
    try {
      const result = await recordWatchProgress(courseId, lessonId, {
        positionSec,
        durationSec: duration,
        sessionId: sessionIdRef.current,
      });
      sessionIdRef.current = result.sessionId;
    } catch {
      /* telemetry must not block playback */
    } finally {
      sendingRef.current = false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      await loadYoutubeApi();
      if (cancelled || !window.YT?.Player) return;

      playerRef.current?.destroy();
      playerRef.current = new window.YT.Player(containerId.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (event) => {
            const player = playerRef.current;
            if (!player || !trackProgress) return;

            const playing = event.data === window.YT?.PlayerState.PLAYING;
            const pausedOrEnded =
              event.data === window.YT?.PlayerState.PAUSED
              || event.data === window.YT?.PlayerState.ENDED;

            if (playing) {
              void sendProgress(player);
              clearHeartbeat();
              heartbeatRef.current = setInterval(() => {
                void sendProgress(player);
              }, HEARTBEAT_MS);
            } else if (pausedOrEnded) {
              clearHeartbeat();
              void sendProgress(player);
            }
          },
        },
      });
    };

    void setup();

    return () => {
      cancelled = true;
      clearHeartbeat();
      playerRef.current?.destroy();
      playerRef.current = null;
      sessionIdRef.current = undefined;
    };
  }, [videoId, courseId, lessonId, trackProgress]);

  return (
    <div
      id={containerId.current}
      title={title}
      className={className}
      style={style}
    />
  );
}
