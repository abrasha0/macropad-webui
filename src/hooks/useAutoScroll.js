import { useRef, useCallback, useState, useEffect } from "react";

export function useAutoScroll(deps = []) {
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const checkAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const threshold = 20;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  const handleScroll = useCallback(() => {
    const atBottom = checkAtBottom();
    setIsAtBottom(atBottom);
    setAutoScrollEnabled(atBottom);
  }, [checkAtBottom]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToBottom();
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { containerRef, isAtBottom, handleScroll, scrollToBottom, autoScrollEnabled, setAutoScrollEnabled };
}
