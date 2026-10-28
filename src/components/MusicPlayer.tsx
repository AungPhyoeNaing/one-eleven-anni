import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Heart,
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Song } from "../data/songs";
export interface PlaybackHandle {
  toggle: () => void;
  playSong: (song: Song) => void;
}
interface MusicPlayerProps {
  currentSong: Song;
  onPlayingChange: (playing: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
export const MusicPlayer = forwardRef<PlaybackHandle, MusicPlayerProps>(
  function MusicPlayer({ currentSong, onPlayingChange, onNext, onPrev }, ref) {
    const audio = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.65);
    const [muted, setMuted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const playAttempt = useRef(0);
    const play = useCallback(() => {
      const element = audio.current;
      if (!element) return;
      if (element.error) element.load();
      const attempt = ++playAttempt.current;
      setError("");
      setLoading(true);
      void element.play().catch((reason: DOMException) => {
        if (attempt !== playAttempt.current || reason.name === "AbortError")
          return;
        setLoading(false);
        setError(
          reason.name === "NotAllowedError"
            ? "Tap play to start listening."
            : "This song couldn’t play. Tap play to retry.",
        );
      });
    }, []);
    const toggle = useCallback(() => {
      if (!audio.current) return;
      if (audio.current.paused) play();
      else {
        ++playAttempt.current;
        audio.current.pause();
      }
    }, [play]);
    useImperativeHandle(
      ref,
      () => ({
        toggle,
        playSong: (song: Song) => {
          if (!audio.current) return;
          ++playAttempt.current;
          audio.current.src = song.audio;
          audio.current.load();
          setPosition(0);
          setDuration(0);
          play();
        },
      }),
      [play, toggle],
    );
    useEffect(() => {
      if (audio.current) {
        audio.current.volume = volume;
        audio.current.muted = muted;
      }
    }, [volume, muted]);
    useEffect(() => {
      const element = audio.current;
      if (element && !element.getAttribute("src")) {
        element.src = currentSong.audio;
      }
    }, [currentSong]);
    const updatePlaying = (playing: boolean) => {
      setIsPlaying(playing);
      onPlayingChange(playing);
      setLoading(false);
    };
    const progress = duration ? (position / duration) * 100 : 0;
    return (
      <aside className="music-dock" aria-label="Music player">
        <audio
          ref={audio}
          preload="metadata"
          onLoadedMetadata={() =>
            setDuration(
              Number.isFinite(audio.current?.duration)
                ? audio.current!.duration
                : 0,
            )
          }
          onTimeUpdate={() => setPosition(audio.current?.currentTime || 0)}
          onPlaying={() => updatePlaying(true)}
          onPause={() => updatePlaying(false)}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onEnded={onNext}
          onError={() => {
            setLoading(false);
            updatePlaying(false);
            setError("This song couldn’t load. Tap play to retry.");
          }}
        />
        <div className="dock-inner page-width">
          <div className="now-playing">
            <img src={currentSong.cover} alt="" width="48" height="48" />
            <div>
              <span className="now-playing-label">
                {isPlaying ? "Our soundtrack, playing" : "A song for you"}
              </span>
              <strong>{currentSong.track}</strong>
              <span className="dock-artist">{currentSong.artist}</span>
            </div>
            <Heart className="dock-heart" size={16} />
          </div>
          <div className="playback">
            <div className="playback-buttons">
              <button
                className="icon-button"
                aria-label="Previous song"
                onClick={onPrev}
              >
                <SkipBack size={17} fill="currentColor" />
              </button>
              <button
                className="play-button"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={toggle}
              >
                {loading ? (
                  <Loader2 className="loading-spinner" size={18} />
                ) : isPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </button>
              <button
                className="icon-button"
                aria-label="Next song"
                onClick={onNext}
              >
                <SkipForward size={17} fill="currentColor" />
              </button>
            </div>
            <div className="seek-row">
              <span>{formatTime(position)}</span>
              <input
                aria-label="Seek in song"
                type="range"
                min="0"
                max={duration || 0}
                step="1"
                value={position}
                disabled={!duration}
                style={{
                  background: `linear-gradient(to right, var(--lavender) ${progress}%, #30364a ${progress}%)`,
                }}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (audio.current) audio.current.currentTime = next;
                  setPosition(next);
                }}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="volume-controls">
            <button
              className="icon-button"
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={muted}
              onClick={() => setMuted(!muted)}
            >
              {muted || volume === 0 ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={(event) => {
                setVolume(Number(event.target.value));
                setMuted(false);
              }}
            />
            <span className="dock-message">
              <span
                className={isPlaying ? "status-dot active" : "status-dot"}
              />
              {isPlaying ? "Just us & the music" : "Whenever you’re ready"}
            </span>
          </div>
        </div>
        {error && (
          <div className="audio-error" role="alert">
            <AlertCircle size={14} />
            {error}
            <button onClick={play}>Retry</button>
          </div>
        )}
        <span className="sr-only" role="status">
          {isPlaying
            ? `Playing ${currentSong.track} by ${currentSong.artist}`
            : `Paused: ${currentSong.track}`}
        </span>
      </aside>
    );
  },
);
