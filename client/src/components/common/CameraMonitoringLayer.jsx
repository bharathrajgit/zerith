import { useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const resolveViewport = () => ({
  width: typeof window === 'undefined' ? 1280 : window.innerWidth,
  height: typeof window === 'undefined' ? 720 : window.innerHeight,
});

const attachStreamToVideo = (video, stream, onReady) => {
  if (!video) return () => {};

  if (!stream) {
    video.srcObject = null;
    return () => {};
  }

  if (video.srcObject !== stream) {
    video.srcObject = stream;
  }

  const handleReady = () => {
    onReady?.();
    const playback = video.play?.();
    if (playback?.catch) {
      playback.catch(() => {});
    }
  };

  if (video.readyState >= 1) {
    handleReady();
    return () => {};
  }

  video.addEventListener('loadedmetadata', handleReady);
  return () => video.removeEventListener('loadedmetadata', handleReady);
};

export default function CameraMonitoringLayer({
  stream,
  captureVideoRef,
  hidden = false,
  width = 220,
  height = 160,
}) {
  const previewVideoRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => {
    const viewport = resolveViewport();
    return {
      x: Math.max(12, viewport.width - (width + 24)),
      y: Math.min(88, Math.max(12, viewport.height - height - 12)),
    };
  });
  const [dragging, setDragging] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    setPreviewReady(false);
  }, [stream]);

  useEffect(() => attachStreamToVideo(captureVideoRef?.current, stream), [captureVideoRef, stream]);

  useEffect(
    () => attachStreamToVideo(previewVideoRef.current, stream, () => setPreviewReady(true)),
    [stream]
  );

  useEffect(() => {
    const onResize = () => {
      const viewport = resolveViewport();
      setPosition((current) => ({
        x: clamp(current.x, 12, Math.max(12, viewport.width - width - 12)),
        y: clamp(current.y, 12, Math.max(12, viewport.height - height - 12)),
      }));
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [height, width]);

  useEffect(() => {
    if (!dragging) return undefined;

    const onMove = (event) => {
      const nextX = clamp(
        event.clientX - dragOffsetRef.current.x,
        12,
        Math.max(12, window.innerWidth - width - 12)
      );
      const nextY = clamp(
        event.clientY - dragOffsetRef.current.y,
        12,
        Math.max(12, window.innerHeight - height - 12)
      );
      setPosition({ x: nextX, y: nextY });
    };

    const onUp = () => setDragging(false);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, height, width]);

  return (
    <>
      <video
        ref={captureVideoRef}
        autoPlay
        muted
        playsInline
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      {!hidden ? (
        <div
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            width,
            height,
            zIndex: 1100,
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(96, 165, 250, 0.35)',
            boxShadow: '0 18px 45px rgba(2, 6, 23, 0.45)',
            background: 'rgba(2, 6, 23, 0.86)',
            userSelect: 'none',
          }}
        >
          <button
            type="button"
            onPointerDown={(event) => {
              const rect = event.currentTarget.parentElement?.getBoundingClientRect();
              dragOffsetRef.current = {
                x: event.clientX - (rect?.left || 0),
                y: event.clientY - (rect?.top || 0),
              };
              setDragging(true);
            }}
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 2,
              borderRadius: 999,
              border: '1px solid rgba(148, 163, 184, 0.26)',
              background: 'rgba(15, 23, 42, 0.76)',
              color: '#e2e8f0',
              padding: '0.35rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            Drag Camera
          </button>
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 2,
              borderRadius: 999,
              background: 'rgba(15, 118, 110, 0.82)',
              color: '#ecfeff',
              fontSize: '0.72rem',
              padding: '0.35rem 0.55rem',
              fontWeight: 700,
            }}
          >
            Monitoring Active
          </div>
          {!previewReady ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                display: 'grid',
                placeItems: 'center',
                padding: '1rem',
                textAlign: 'center',
                color: '#cbd5e1',
                background:
                  'linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.84))',
                fontSize: '0.8rem',
                lineHeight: 1.5,
              }}
            >
              <div>
                <strong style={{ display: 'block', color: '#eff6ff', marginBottom: '0.35rem' }}>
                  Starting camera preview
                </strong>
                Keep this window visible while monitoring starts.
              </div>
            </div>
          ) : null}
          <video
            ref={previewVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : null}
    </>
  );
}
