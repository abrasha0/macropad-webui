import { useState, useCallback, useRef } from "react";
import { ToastContext } from "../hooks/useToast";

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const addToast = useCallback((message, level = "info", duration = 4500) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, level }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, duration);
    timers.current[id] = timer;
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}
