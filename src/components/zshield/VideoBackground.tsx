'use client'

// Swap VIDEO_ID when you publish your edited version to YouTube
const VIDEO_ID = 'JZN76YZSdmM'

export default function VideoBackground() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
    }}>
      <iframe
        src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&playlist=${VIDEO_ID}&start=6&enablejsapi=0`}
        allow="autoplay; encrypted-media"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          // Cover the viewport regardless of aspect ratio
          width: 'max(100%, 177.8vh)',
          height: 'max(56.25vw, 100%)',
          transform: 'translate(-50%, -50%)',
          border: 'none',
          opacity: 0.22,
          mixBlendMode: 'lighten',
          pointerEvents: 'none',
        }}
        title="Background"
      />
    </div>
  )
}
