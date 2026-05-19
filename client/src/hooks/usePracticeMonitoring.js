import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  analyzeMonitoringFrame,
  finishMonitoringSession,
  recordMonitoringEvents,
  startMonitoringSession,
} from '../services/monitoringService';

const initialMetrics = {
  tabSwitches: 0,
  copyAttempts: 0,
  windowBlurCount: 0,
};
const FRAME_ANALYSIS_INTERVAL_MS = 6000;
const FRAME_KICKOFF_DELAY_MS = 1200;
const initialVisionState = {
  alerts: [],
  detections: null,
  confidence: 0,
  riskLevel: 'NONE',
  evidenceCaptured: false,
  evidenceTrigger: null,
  evidenceCount: 0,
  updatedAt: null,
};

const isBrowserMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
};

const toDataUrl = (video, canvas) => {
  const width = 320;
  const height = 240;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';
  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.62);
};

export default function usePracticeMonitoring({
  sessionType,
  topicId,
  moduleId,
  problemId,
  autoStart = false,
  mode = 'full',
  institutionLinked = false,
  sessionLabel = 'practice session',
  onStatusChange,
}) {
  const captureVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameTimerRef = useRef(null);
  const frameKickoffTimerRef = useRef(null);
  const eventFlushTimerRef = useRef(null);
  const pendingStartResolveRef = useRef(null);
  const startedAutoRef = useRef(false);
  const latestBrowserMetricsRef = useRef(initialMetrics);
  const finishingRef = useRef(false);
  const browserOnlyWarningRef = useRef(0);
  const isBrowserOnly = mode === 'browser-only';

  const [showConsent, setShowConsent] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [browserMetrics, setBrowserMetrics] = useState(initialMetrics);
  const [visionState, setVisionState] = useState(initialVisionState);
  const [sessionState, setSessionState] = useState(
    isBrowserOnly
      ? {
          monitoringSessionId: null,
          warningCount: 0,
          warningLimit: 3,
          finalFlagged: false,
          riskLevel: 'NONE',
          riskScore: 0,
          signals: [],
          finalStatus: 'clean',
        }
      : null
  );
  const [permissionState, setPermissionState] = useState('idle');
  const [browserOnlyStarted, setBrowserOnlyStarted] = useState(isBrowserOnly ? autoStart : false);
  const [isMobile, setIsMobile] = useState(isBrowserMobile);

  const warningLimit = sessionState?.warningLimit || 3;
  const sessionId = sessionState?.monitoringSessionId || null;
  const isMonitoring = isBrowserOnly ? browserOnlyStarted : (!!sessionId && !!stream);

  const cleanupMedia = useCallback(() => {
    if (frameTimerRef.current) {
      window.clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }

    if (frameKickoffTimerRef.current) {
      window.clearTimeout(frameKickoffTimerRef.current);
      frameKickoffTimerRef.current = null;
    }

    if (eventFlushTimerRef.current) {
      window.clearTimeout(eventFlushTimerRef.current);
      eventFlushTimerRef.current = null;
    }

    setStream((current) => {
      current?.getTracks?.().forEach((track) => track.stop());
      return null;
    });
  }, []);

  const resolvePendingStart = useCallback((value) => {
    if (pendingStartResolveRef.current) {
      pendingStartResolveRef.current(value);
      pendingStartResolveRef.current = null;
    }
  }, []);

  const updateSessionState = useCallback((nextState) => {
    setSessionState((current) => {
      const previousWarnings = current?.warningCount || 0;
      const previousFinalFlagged = !!current?.finalFlagged;
      if (
        nextState &&
        ((nextState.warningCount || 0) > previousWarnings || (!!nextState.finalFlagged && !previousFinalFlagged))
      ) {
        onStatusChange?.(nextState);
      }
      return nextState;
    });
  }, [onStatusChange]);

  const openConsent = useCallback(() => {
    setError('');
    return new Promise((resolve) => {
      pendingStartResolveRef.current = resolve;
      setShowConsent(true);
    });
  }, []);

  const startSampling = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const sampleFrame = async () => {
      if (!captureVideoRef.current || !sessionId || document.hidden) return;
      if (captureVideoRef.current.readyState < 2) return;

      try {
        const imageData = toDataUrl(captureVideoRef.current, canvasRef.current);
        if (!imageData) return;

        const nextState = await analyzeMonitoringFrame(sessionId, {
          imageData,
          metadata: {
            width: captureVideoRef.current.videoWidth || 320,
            height: captureVideoRef.current.videoHeight || 240,
            deviceType: isMobile ? 'mobile' : 'desktop',
          },
        });

        setVisionState({
          alerts: Array.isArray(nextState?.alerts) ? nextState.alerts : [],
          detections: nextState?.detections || null,
          confidence: Number(nextState?.confidence || 0),
          riskLevel: nextState?.riskLevel || 'NONE',
          evidenceCaptured: !!nextState?.evidenceCaptured,
          evidenceTrigger: nextState?.evidenceTrigger || null,
          evidenceCount: Number(nextState?.evidenceCount || 0),
          updatedAt: Date.now(),
        });
        updateSessionState(nextState);
      } catch (frameError) {
        // Keep the session alive even if an individual frame analysis fails.
      }
    };

    if (frameTimerRef.current) {
      window.clearInterval(frameTimerRef.current);
    }

    if (frameKickoffTimerRef.current) {
      window.clearTimeout(frameKickoffTimerRef.current);
    }

    frameKickoffTimerRef.current = window.setTimeout(() => {
      sampleFrame();
    }, FRAME_KICKOFF_DELAY_MS);

    frameTimerRef.current = window.setInterval(sampleFrame, FRAME_ANALYSIS_INTERVAL_MS);
  }, [isMobile, sessionId, updateSessionState]);

  const beginSession = useCallback(async () => {
    if (isBrowserOnly) {
      latestBrowserMetricsRef.current = initialMetrics;
      setBrowserMetrics(initialMetrics);
      setVisionState(initialVisionState);
      browserOnlyWarningRef.current = 0;
      setPermissionState('granted');
      setSessionState({
        monitoringSessionId: null,
        warningCount: 0,
        warningLimit: 3,
        finalFlagged: false,
        riskLevel: 'NONE',
        riskScore: 0,
        signals: [],
        finalStatus: 'clean',
      });
      setBrowserOnlyStarted(true);
      resolvePendingStart(true);
      setShowConsent(false);
      return true;
    }

    setStarting(true);
    setError('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support webcam access for monitored sessions.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      const nextSession = await startMonitoringSession({
        sessionType,
        topicId,
        moduleId,
        problemId,
        deviceType: isBrowserMobile() ? 'mobile' : 'desktop',
        previewEnabled: !isBrowserMobile(),
      });

      latestBrowserMetricsRef.current = initialMetrics;
      setBrowserMetrics(initialMetrics);
      setVisionState(initialVisionState);
      setPermissionState('granted');
      setStream(mediaStream);
      updateSessionState(nextSession);
      resolvePendingStart(true);
      return true;
    } catch (startError) {
      const message =
        startError?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow webcam access to continue.'
          : startError?.message || 'Unable to start camera monitoring.';

      setPermissionState('denied');
      setError(message);
      cleanupMedia();
      resolvePendingStart(false);
      return false;
    } finally {
      setStarting(false);
      setShowConsent(false);
    }
  }, [
    cleanupMedia,
    moduleId,
    isBrowserOnly,
    institutionLinked,
    problemId,
    resolvePendingStart,
    sessionType,
    topicId,
    updateSessionState,
  ]);

  const startMonitoring = useCallback(async () => {
    if (isMonitoring) return true;
    return openConsent();
  }, [isMonitoring, openConsent]);

  const finishMonitoring = useCallback(async (payload = {}, options = {}) => {
    if (isBrowserOnly) {
      cleanupMedia();
      return;
    }

    if (!sessionId || finishingRef.current) {
      cleanupMedia();
      return;
    }

    finishingRef.current = true;
    try {
      const nextState = await finishMonitoringSession(
        sessionId,
        {
          browserMetrics: latestBrowserMetricsRef.current,
          ...payload,
        },
        options
      );
      updateSessionState(nextState);
    } catch (finishError) {
      // Best effort finish for unload/unmount.
    } finally {
      finishingRef.current = false;
      cleanupMedia();
    }
  }, [cleanupMedia, sessionId, updateSessionState]);

  const trackBrowserEvent = useCallback((eventType) => {
    setBrowserMetrics((current) => {
      const next = {
        ...current,
        tabSwitches: current.tabSwitches + (eventType === 'tabSwitches' ? 1 : 0),
        copyAttempts: current.copyAttempts + (eventType === 'copyAttempts' ? 1 : 0),
        windowBlurCount: current.windowBlurCount + (eventType === 'windowBlurCount' ? 1 : 0),
      };
      latestBrowserMetricsRef.current = next;
      return next;
    });

    if (!isBrowserOnly) return;

    if (eventType === 'tabSwitches' || eventType === 'windowBlurCount') {
      browserOnlyWarningRef.current += 1;
      const nextWarningCount = browserOnlyWarningRef.current;
      updateSessionState({
        monitoringSessionId: null,
        warningCount: nextWarningCount,
        warningLimit,
        finalFlagged: false,
        riskLevel: nextWarningCount >= warningLimit ? 'MEDIUM' : 'LOW',
        riskScore: 0,
        signals: ['BROWSER_WARNING'],
        finalStatus: nextWarningCount > 0 ? 'warned' : 'clean',
      });
    }
  }, [isBrowserOnly, updateSessionState, warningLimit]);

  useEffect(() => {
    const onResize = () => setIsMobile(isBrowserMobile());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isBrowserOnly || !isMonitoring || !sessionId) return undefined;
    if (eventFlushTimerRef.current) {
      window.clearTimeout(eventFlushTimerRef.current);
    }

    eventFlushTimerRef.current = window.setTimeout(async () => {
      try {
        const nextState = await recordMonitoringEvents(sessionId, {
          browserMetrics: latestBrowserMetricsRef.current,
        });
        updateSessionState(nextState);
      } catch (eventError) {
        // Ignore transient sync issues; metrics will be retried on the next flush or finish.
      }
    }, 600);

    return () => {
      if (eventFlushTimerRef.current) {
        window.clearTimeout(eventFlushTimerRef.current);
        eventFlushTimerRef.current = null;
      }
    };
  }, [browserMetrics, isBrowserOnly, isMonitoring, sessionId, updateSessionState]);

  useEffect(() => {
    if (isBrowserOnly || !isMonitoring) return undefined;
    startSampling();
    return () => {
      if (frameKickoffTimerRef.current) {
        window.clearTimeout(frameKickoffTimerRef.current);
        frameKickoffTimerRef.current = null;
      }
      if (frameTimerRef.current) {
        window.clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
      }
    };
  }, [isBrowserOnly, isMonitoring, startSampling]);

  useEffect(() => {
    if (!autoStart || startedAutoRef.current || isMonitoring || starting) return;
    startedAutoRef.current = true;
    startMonitoring();
  }, [autoStart, isMonitoring, startMonitoring, starting]);

  useEffect(() => () => {
    cleanupMedia();
    resolvePendingStart(false);
  }, [cleanupMedia, resolvePendingStart]);

  const consentModal = useMemo(
    () => ({
      open: showConsent,
      loading: starting,
      error,
      sessionLabel,
      warningLimit,
      onAccept: beginSession,
      onDecline: () => {
        setShowConsent(false);
        setPermissionState('denied');
        setError('Camera access is required to continue this monitored session.');
        resolvePendingStart(false);
      },
    }),
    [beginSession, error, resolvePendingStart, sessionLabel, showConsent, starting, warningLimit]
  );

  return {
    browserMetrics,
    captureVideoRef,
    consentModal,
    error,
    finishMonitoring,
    isMobile,
    isMonitoring,
    permissionState,
    sessionId,
    sessionState,
    startMonitoring,
    stream,
    trackBrowserEvent,
    visionState,
  };
}
