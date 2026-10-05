import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import confetti from 'canvas-confetti'
import type { GiftData } from '@/lib/giftData'

interface Props {
  data: GiftData
}

type ScreenType = 'lock' | 'question' | 'letter' | 'photos' | 'song' | 'video'

export default function GiftClient({ data }: Props) {
  const [, setLoading] = useState(true)
  const [screen, setScreen] = useState<ScreenType>('lock')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  // Passcode Lock State
  const [passcodeInput, setPasscodeInput] = useState('')
  const [isPassError, setIsPassError] = useState(false)

  // Global Music
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // --- Song Player State ---
  const [isSongPlaying, setIsSongPlaying] = useState(false)
  const [songProgress, setSongProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const songAudioRef = useRef<HTMLAudioElement | null>(null)

  // --- Video Player State ---
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [noCount, setNoCount] = useState(0)

  const photosList = data.photos && data.photos.length > 0
    ? data.photos
    : ['/images/pic1.jpg', '/images/pic2.jpg', '/images/pic3.jpg', '/images/pic4.jpg']

  const songTitle = data.songTitle || 'Our Special Song'
  const songArtist = data.songArtist || 'For You'
  const songCover = data.songCover || '/images/pic5.jpg'
  const songSrc = data.songSrc || '/audio/song.mp3'

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (data.musicUrl) {
      const audio = new Audio(data.musicUrl)
      audio.loop = true
      audio.volume = 0.3
      audioRef.current = audio
    }
    return () => audioRef.current?.pause()
  }, [data.musicUrl])

  const navigateTo = useCallback((newScreen: ScreenType) => {
    window.history.pushState({ screen: newScreen }, '')
    setScreen(newScreen)

    // إيقاف الأغنية لو مش في صفحتها
    if (newScreen !== 'song' && isSongPlaying && songAudioRef.current) {
      songAudioRef.current.pause()
      setIsSongPlaying(false)
    }

    // إيقاف الفيديو لو خرجنا من صفحته
    if (newScreen !== 'video' && videoRef.current) {
      videoRef.current.pause()
    }

    // لو دخلنا صفحة الفيديو، نوقف أي موسيقى شغالة
    if (newScreen === 'video') {
      if (audioRef.current) {
        audioRef.current.pause()
        setMusicPlaying(false)
      }
    }
  }, [isSongPlaying])

  const handleUnlockPasscode = (e: React.FormEvent) => {
    e.preventDefault()
    const targetPass = (data.passcode || '2302').trim().replace(/[-/\s]/g, '')
    const enteredPass = passcodeInput.trim().replace(/[-/\s]/g, '')

    if (enteredPass === targetPass) {
      setIsPassError(false)
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch {
        // ignore confetti errors
      }
      navigateTo('question')
    } else {
      setIsPassError(true)
      setTimeout(() => setIsPassError(false), 800)
    }
  }

  const handleYesClick = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch {
      // ignore if confetti fails
    }
    navigateTo('letter')
  }

  useEffect(() => {
    window.history.replaceState({ screen: 'lock' }, '')
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) setScreen(event.state.screen)
      else setScreen('lock')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // --- Functions for Song Player ---
  const toggleOurSong = () => {
    if (!songAudioRef.current) return
    if (isSongPlaying) {
      songAudioRef.current.pause()
      setIsSongPlaying(false)
    } else {
      if (musicPlaying && audioRef.current) {
        audioRef.current.pause()
        setMusicPlaying(false)
      }
      songAudioRef.current.play()
      setIsSongPlaying(true)
    }
  }

  const handleSongTimeUpdate = () => {
    if (songAudioRef.current) {
      setCurrentTime(songAudioRef.current.currentTime)
      if (songAudioRef.current.duration) {
        setSongProgress((songAudioRef.current.currentTime / songAudioRef.current.duration) * 100)
      }
    }
  }

  const handleSongLoadedMetadata = () => {
    if (songAudioRef.current) {
      setDuration(songAudioRef.current.duration)
      songAudioRef.current.volume = volume / 100
    }
  }

  const handleSongSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (songAudioRef.current && songAudioRef.current.duration) {
      const newTime = (Number(e.target.value) / 100) * songAudioRef.current.duration
      songAudioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setSongProgress(Number(e.target.value))
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    if (songAudioRef.current) {
      songAudioRef.current.volume = val / 100
    }
  }

  const skipForward = () => {
    if (songAudioRef.current) {
      songAudioRef.current.currentTime = Math.min(songAudioRef.current.currentTime + 10, duration)
    }
  }

  const skipBackward = () => {
    if (songAudioRef.current) {
      songAudioRef.current.currentTime = Math.max(songAudioRef.current.currentTime - 10, 0)
    }
  }

  return (
    <div className="gift-page">
      <FloatingHearts />

      <div className="corners-overlay">
        <div className="corner tl"></div>
        <div className="corner tr"></div>
        <div className="corner bl"></div>
        <div className="corner br"></div>
      </div>

      {/* ── SCREEN 0: PASSWORD LOCK (FIRST SCREEN) ── */}
      <div className={`screen ${screen === 'lock' ? 'visible' : ''}`}>
        <div className="content-wrapper center-content">
          <div className="lock-card">
            <div className="lock-badge">
              🔒
            </div>
            <p className="subtitle">✦ Private & Protected ✦</p>
            <h1 className="gift-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
              Special Gift For You
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
              Enter the secret date to open your gift ✨
            </p>

            <form onSubmit={handleUnlockPasscode} className="passcode-form">
              <div className="passcode-input-container">
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter Password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="passcode-input"
                  autoFocus
                />
                {isPassError && (
                  <p className="passcode-error">
                    Incorrect password! Try again 🥺
                  </p>
                )}
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Unlock Gift 🔓
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── SCREEN 1: QUESTION ── */}
      <div className={`screen ${screen === 'question' ? 'visible' : ''}`}>
        <div className="content-wrapper center-content">
          <p className="subtitle">✦ Just a simple question ✦</p>
          <h1 className="gift-title">Will you forgive me?</h1>

          <div className="heart-sticker-wrapper">
            <div className="heart-sticker-aura"></div>
            <div
              className="heart-sticker-badge"
              onClick={() => {
                try {
                  confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.5 }
                  })
                } catch { }
              }}
              title="❣️"
            >
              <ChicHeartExclamation />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '2rem' }}>
            <button
              className="btn-primary"
              style={{
                fontSize: `${1 + noCount * 0.12}rem`,
                padding: `${0.8 + noCount * 0.08}rem ${2 + noCount * 0.18}rem`
              }}
              onClick={handleYesClick}
            >
              Yes!
            </button>

            {noCount < 7 && (
              <button
                className="secret-link btn-no"
                onClick={() => setNoCount((prev) => prev + 1)}
              >
                {[
                  'No',
                  'Please? 🥺',
                  'Really?! 😢',
                  'Are you sure? 💔',
                  'Think again! 🥺',
                  'Don’t do this 😭',
                  'Last chance... 🥺',
                ][noCount]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SCREEN 2: LETTER 1 ── */}
      <div className={`screen ${screen === 'letter' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div className="letter-card">
            <div className="top-accent-sq"></div>
            <h2 className="letter-title">To my favorite person,</h2>

            <div className="letter-scroll-area">
              <div className="letter-body">{data.message}</div>
              <div className="letter-divider"><span>✦</span></div>
              <div className="signature">
                <p>With all my love,</p>
                <p>{data.senderName || 'وليدك'} ✨</p>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigateTo('photos')}>
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── SCREEN 3: PHOTOS / MEMORIES (BEFORE LAST) ── */}
      <div className={`screen ${screen === 'photos' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div className="photos-card">
            <div className="top-accent-sq"></div>
            <h2 className="letter-title">Our Moments ✨</h2>
            <p className="subtitle" style={{ marginBottom: '0.4rem' }}>✦ Every picture holds a feeling ✦</p>

            <div className="photos-grid">
              {photosList.slice(0, 4).map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="photo-item"
                  onClick={() => setSelectedPhoto(imgSrc)}
                  title="Click to view full photo"
                >
                  <img src={imgSrc} alt={`Memory ${idx + 1}`} />
                  <span className="photo-tag">#{idx + 1} ❤</span>
                </div>
              ))}
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigateTo('song')}>
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Photo Fullscreen Zoom Modal */}
      {selectedPhoto && (
        <div className="photo-modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <img className="photo-modal-img" src={selectedPhoto} alt="Zoomed memory" />
        </div>
      )}

      {/* ── SCREEN 4: SONG 1 (LAST SCREEN) ── */}
      <div className={`screen ${screen === 'song' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div className="player-container">
            {/* Centered Vinyl Record emerging gracefully from behind card */}
            <div className={`vinyl-record-container ${isSongPlaying ? 'vinyl-active' : ''}`}>
              <div className={`vinyl-disc ${isSongPlaying ? 'vinyl-spin' : 'vinyl-paused'}`}>
                <VinylSVG />
              </div>
            </div>

            <div className="music-player-card">
              <div className="player-cover">
                <img
                  src={songCover}
                  alt={songTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div className="player-info">
                <div className="player-title">{songTitle}</div>
                <div className="player-artist">{songArtist}</div>
              </div>
              <div className="timeline-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={songProgress || 0}
                  onChange={handleSongSeek}
                  className="ios-slider"
                />
                <div className="time-labels">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(duration - currentTime)}</span>
                </div>
              </div>
              <div className="player-controls">
                <button className="control-btn" onClick={skipBackward} aria-label="Skip Backward">
                  <BackwardIcon />
                </button>
                <button
                  className="control-btn play-pause-circle"
                  onClick={toggleOurSong}
                  aria-label={isSongPlaying ? 'Pause' : 'Play'}
                >
                  {isSongPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button className="control-btn" onClick={skipForward} aria-label="Skip Forward">
                  <ForwardIcon />
                </button>
              </div>
              <div className="volume-container">
                <VolumeMinIcon />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="ios-slider"
                  style={{ marginBottom: 0 }}
                />
                <VolumeMaxIcon />
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: '1.2rem', padding: '0.8rem 1.4rem', fontSize: '1rem' }}
                onClick={() => navigateTo('video')}
              >
                A Moment of Ours❣️→
              </button>
            </div>
          </div>

          <audio
            ref={songAudioRef}
            src={songSrc}
            onTimeUpdate={handleSongTimeUpdate}
            onLoadedMetadata={handleSongLoadedMetadata}
            onEnded={() => setIsSongPlaying(false)}
          />
        </div>
      </div>

      {/* ── SCREEN 5: VIDEO SCREEN (FINAL SCREEN) ── */}
      <div className={`screen ${screen === 'video' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div className="video-card">
            <div className="top-accent-sq"></div>
            <p className="subtitle">✦ A Special Memory ✦</p>
            <h2 className="letter-title" style={{ marginBottom: '0.8rem' }}>
              {data.videoTitle || 'A Moment of Ours❣️'}
            </h2>

            <div className="video-frame-container">
              <video
                ref={videoRef}
                src={data.videoSrc || '/video.mp4'}
                className="video-element"
                controls
                playsInline
                preload="metadata"
                onPlay={() => {
                  if (isSongPlaying && songAudioRef.current) {
                    songAudioRef.current.pause()
                    setIsSongPlaying(false)
                  }
                  if (musicPlaying && audioRef.current) {
                    audioRef.current.pause()
                    setMusicPlaying(false)
                  }
                }}
              />
            </div>

            <div className="video-actions">
              <button
                className="btn-secondary"
                onClick={() => navigateTo('song')}
              >
                ← Back to Song 🎵
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  try {
                    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
                  } catch { }
                  navigateTo('letter')
                }}
              >
                Read Letter Again 💌
              </button>
            </div>

            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '1.4rem' }}>
              With all my love, always & forever ❣️
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

// =============================================
// HELPER COMPONENTS & OPTIMIZED SVGS
// =============================================

// Pre-computed fixed random hearts (prevents re-render stutter during audio playback)
interface HeartData {
  id: number
  left: number
  delay: number
  duration: number
  size: number
}

const STATIC_HEARTS: HeartData[] = Array.from({ length: 24 }).map((_, i) => ({
  id: i,
  left: Math.floor((i * 4.1 + Math.random() * 5) % 100),
  delay: Number((Math.random() * 6).toFixed(2)),
  duration: Number((7 + Math.random() * 6).toFixed(2)),
  size: Number((0.9 + Math.random() * 1.3).toFixed(2)),
}))

const FloatingHearts = memo(function FloatingHearts() {
  return (
    <div className="hearts-bg">
      {STATIC_HEARTS.map((h) => (
        <div
          key={h.id}
          className="heart"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            fontSize: `${h.size}rem`,
          }}
        >
          ❤
        </div>
      ))}
    </div>
  )
})

function VinylSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="vinylShine" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="50%" stopColor="#111827" />
          <stop offset="85%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>
      </defs>
      {/* Outer vinyl disc */}
      <circle cx="100" cy="100" r="98" fill="url(#vinylShine)" stroke="#374151" strokeWidth="1.5" />

      {/* Vinyl Grooves */}
      <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* Center Label */}
      <circle cx="100" cy="100" r="34" fill="#374151" stroke="#4b5563" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="28" fill="#1f2937" />
      <text x="100" y="105" textAnchor="middle" fontSize="14" fill="#9ca3af" fontFamily="sans-serif">🎵</text>

      {/* Spindle hole */}
      <circle cx="100" cy="100" r="5" fill="#030712" stroke="#6b7280" strokeWidth="1" />
    </svg>
  )
}

function PlayIcon() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> }
function PauseIcon() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> }
function ForwardIcon() { return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" /></svg> }
function BackwardIcon() { return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" /></svg> }
function VolumeMinIcon() { return <svg viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4l-5 5H7z" /></svg> }
function VolumeMaxIcon() { return <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg> }

function ChicHeartExclamation() {
  return (
    <svg
      viewBox="0 0 120 150"
      className="heart-svg-anim"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main Heart Red Gradient */}
        <linearGradient id="heartGrad" x1="15%" y1="10%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#ff4d79" />
          <stop offset="35%" stopColor="#f43f5e" />
          <stop offset="75%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>

        {/* Ambient Inner Glow */}
        <radialGradient id="innerShine" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffe4e6" stopOpacity="0.75" />
          <stop offset="40%" stopColor="#fb7185" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
        </radialGradient>

        {/* Exclamation Dot Gradient */}
        <linearGradient id="dotGrad" x1="20%" y1="15%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#ff4d79" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>
      </defs>

      {/* Sparkles around heart */}
      <path
        d="M 14 36 Q 14 42 20 42 Q 14 42 14 48 Q 14 42 8 42 Q 14 42 14 36 Z"
        fill="#fda4af"
        opacity="0.85"
      />
      <path
        d="M 106 28 Q 106 33 111 33 Q 106 33 106 38 Q 106 33 101 33 Q 106 33 106 28 Z"
        fill="#fda4af"
        opacity="0.9"
      />
      <path
        d="M 16 96 Q 16 100 20 100 Q 16 100 16 104 Q 16 100 12 100 Q 16 100 16 96 Z"
        fill="#f43f5e"
        opacity="0.75"
      />
      <path
        d="M 104 98 Q 104 102 108 102 Q 104 102 104 106 Q 104 102 100 102 Q 104 102 104 98 Z"
        fill="#fda4af"
        opacity="0.8"
      />

      {/* Main Heart Body (❣️ Top heart part) */}
      <path
        d="M 60 40 
           C 60 22, 22 18, 22 52 
           C 22 78, 48 98, 60 114 
           C 72 98, 98 78, 98 52 
           C 98 18, 60 22, 60 40 Z"
        fill="url(#heartGrad)"
      />

      {/* Soft inner light */}
      <path
        d="M 60 40 
           C 60 22, 22 18, 22 52 
           C 22 78, 48 98, 60 114 
           C 72 98, 98 78, 98 52 
           C 98 18, 60 22, 60 40 Z"
        fill="url(#innerShine)"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Glossy top-left 3D highlight sheen */}
      <path
        d="M 30 46 
           C 30 35, 40 28, 50 28 
           C 54 28, 57 30, 59 34 
           C 55 31, 50 31, 44 33 
           C 36 36, 31 43, 30 52 
           C 29.5 50, 29.5 48, 30 46 Z"
        fill="#ffffff"
        opacity="0.55"
      />

      {/* Secondary subtle micro highlight */}
      <ellipse
        cx="72"
        cy="36"
        rx="5"
        ry="2.5"
        fill="#ffffff"
        opacity="0.35"
        transform="rotate(25 72 36)"
      />

      {/* Exclamation Dot (❣️ Bottom circle part) */}
      <circle
        cx="60"
        cy="134"
        r="9"
        fill="url(#dotGrad)"
      />

      {/* Dot 3D highlight reflection */}
      <ellipse
        cx="57.5"
        cy="131.5"
        rx="3.2"
        ry="2.2"
        fill="#ffffff"
        opacity="0.6"
        transform="rotate(-25 57.5 131.5)"
      />
    </svg>
  )
}

