import { useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function CameraMonitoringLayer({
  stream,
  captureVideoRef,
  hidden = false,
  width = 220,
  height = 160,
}) {
  const previewVideoRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => ({
    x: Math.max(16, window.innerWidth - (width + 32)),
    y: 88,
  }));
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!captureVideoRef?.current) return;
    captureVideoRef.current.srcObject = stream || null;
  }, [captureVideoRef, stream]);

  useEffect(() => {
    if (!previewVideoRef.current) return;
    previewVideoRef.current.srcObject = stream || null;
  }, [stream]);

  useEffect(() => {
    if (!dragging) return undefined;

    const onMove = (event) => {
      const nextX = clamp(event.clientX - dragOffsetRef.current.x, 12, Math.max(12, window.innerWidth - width - 12));
      const nextY = clamp(event.clientY - dragOffsetRef.current.y, 12, Math.max(12, window.innerHeight - height - 12));
      setPosition({ x: nextX, y: nextY });
    };

    const onUp = () => setDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
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
            onMouseDown={(event) => {
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
