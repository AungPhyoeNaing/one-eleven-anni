import { lazy, Suspense, useRef, useState } from "react";
import {
  ArrowUpRight,
  Heart,
  Mail,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { MusicPlayer, PlaybackHandle } from "./components/MusicPlayer";
import { LoveLetter } from "./components/LoveLetter";
import { Modal } from "./components/Modal";
import { Song, songs } from "./data/songs";
const Galaxy = lazy(() => import("./components/Galaxy"));

function App() {
  const [activeSong, setActiveSong] = useState(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [resetView, setResetView] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const player = useRef<PlaybackHandle>(null);
  const selectSong = (song: Song) => {
    if (song.id === activeSong.id) player.current?.toggle();
    else {
      setActiveSong(song);
      player.current?.playSong(song);
    }
  };
  const changeSong = (direction: number) => {
    const song =
      songs[
        (songs.findIndex((item) => item.id === activeSong.id) +
          direction +
          songs.length) %
          songs.length
      ];
    setActiveSong(song);
    player.current?.playSong(song);
  };
  return (
    <div className="universe">
      <a className="skip-link" href="#soundtrack">
        Skip to soundtrack
      </a>
      <Suspense
        fallback={
          <div className="scene-loading" role="status">
            <Orbit size={22} /> Gathering a little stardust…
          </div>
        }
      >
        <Galaxy
          activeSong={activeSong}
          isPlaying={isPlaying}
          onPlanetClick={selectSong}
          onCenterClick={() => setIsPhotoOpen(true)}
          resetView={resetView}
          motionPaused={motionPaused}
        />
      </Suspense>
      <header className="site-header page-width">
        <a
          className="brand"
          href="#main"
          aria-label="APN and Jia, home"
          onClick={() => setResetView((value) => value + 1)}
        >
          <span className="brand-symbol">
            <Orbit size={28} />
          </span>
          <span>
            APN <span className="brand-amp">&</span> JIA
            <span className="brand-caption">A universe of our own</span>
          </span>
        </a>
        <span className="header-dedication">
          <span /> Somewhere, in every lifetime.
        </span>
        <button className="letter-nav" onClick={() => setIsLetterOpen(true)}>
          <Mail size={16} />
          <span>A letter for you</span>
          <ArrowUpRight size={13} />
        </button>
      </header>
      <main id="main">
        <section className="galaxy-intro" aria-labelledby="hero-title">
          <div className="wish-time" aria-label="Eleven eleven">
            11:11<span className="wish-star">✧</span>
          </div>
          <p className="wish-caption">I made a wish. It was you.</p>
          <h1 id="hero-title">
            My favorite place
            <br />
            in the universe.
          </h1>
          <p className="hero-description">
            Isn’t a place at all.
            <br />
            It’s a little closer to you.
          </p>
          <button
            className="primary-button"
            onClick={() => selectSong(activeSong)}
          >
            {isPlaying ? (
              <Pause size={15} fill="currentColor" />
            ) : (
              <Play size={15} fill="currentColor" />
            )}
            {isPlaying ? "Pause our soundtrack" : "Let our universe play"}
          </button>
          <p className="personal-note">
            For Jia. Always, in all ways. <Heart size={12} />
          </p>
        </section>
        <div className="scene-tools">
          <span>
            <span className="drag-symbol">↔</span> Drag to wander. Pick a planet
            to listen.
          </span>
          <button
            onClick={() => setResetView((value) => value + 1)}
            aria-label="Reset galaxy view"
          >
            <RotateCcw size={14} /> Reset view
          </button>
          <button
            aria-pressed={motionPaused}
            onClick={() => setMotionPaused((value) => !value)}
          >
            {motionPaused ? <Play size={12} /> : <Pause size={12} />}
            {motionPaused ? "Resume motion" : "Pause motion"}
          </button>
        </div>
        <section
          className="soundtrack-section page-width"
          id="soundtrack"
          aria-label="The soundtrack of us"
        >
          <div className="soundtrack-intro">
            <Sparkles size={15} />
            <span>
              Three little worlds.
              <br />
              <strong>A thousand feelings.</strong>
            </span>
          </div>
          <div className="song-grid">
            {songs.map((song, index) => {
              const playing = activeSong.id === song.id && isPlaying;
              return (
                <button
                  key={song.id}
                  className={`song-card ${activeSong.id === song.id ? "is-selected" : ""}`}
                  onClick={() => selectSong(song)}
                  aria-label={`${playing ? "Pause" : "Play"} ${song.title} by ${song.artist}`}
                  aria-pressed={playing}
                >
                  <span
                    className={`song-orb song-orb-${index}`}
                    aria-hidden="true"
                  />
                  <span className="song-card-copy">
                    <span className="song-chapter">{song.title}</span>
                    <strong>{song.track}</strong>
                    <span className="song-artist">{song.artist}</span>
                  </span>
                  <span
                    className={playing ? "equalizer" : "song-play"}
                    aria-hidden="true"
                  >
                    {playing ? (
                      <>
                        <i />
                        <i />
                        <i />
                      </>
                    ) : (
                      <Play size={12} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
        <p className="song-memory" aria-live="polite">
          “{activeSong.message}”
        </p>
      </main>
      <MusicPlayer
        ref={player}
        currentSong={activeSong}
        onPlayingChange={setIsPlaying}
        onNext={() => changeSong(1)}
        onPrev={() => changeSong(-1)}
      />
      <LoveLetter
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
      />
      <Modal
        isOpen={isPhotoOpen}
        onClose={() => {
          setIsPhotoOpen(false);
          setSecretClickCount(0);
        }}
        title="My favorite place is with you"
        className="photo-dialog"
      >
        <button
          className="memory-photo"
          aria-label="Our photo. Tap five times for a little secret."
          onClick={() => {
            const count = secretClickCount + 1;
            setSecretClickCount(count);
            if (count >= 5) {
              setIsPhotoOpen(false);
              setIsLetterOpen(true);
              setSecretClickCount(0);
            }
          }}
        >
          <img
            src="/images/central-star-photo.webp"
            alt="APN and Jia holding hands in a field of orange flowers"
          />
        </button>
        <p className="photo-caption">
          {secretClickCount
            ? `${5 - secretClickCount} more taps to a little secret…`
            : "Of all the stars, you’re my favorite."}
        </p>
      </Modal>
    </div>
  );
}
export default App;
