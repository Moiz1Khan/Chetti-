import { useEffect, useRef, useCallback } from "react";

/**
 * Shows an idle message after a period of user inactivity.
 */
export function useIdleMessage({
  enabled,
  timeoutSeconds = 30,
  idleMessage,
  onIdle,
}: {
  enabled: boolean;
  timeoutSeconds: number;
  idleMessage?: string | null;
  onIdle: (message: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!enabled || !idleMessage || firedRef.current) return;

    timerRef.current = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onIdle(idleMessage);
      }
    }, timeoutSeconds * 1000);
  }, [enabled, idleMessage, timeoutSeconds, onIdle]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return { resetIdleTimer: resetTimer };
}
