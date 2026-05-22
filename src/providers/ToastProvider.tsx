import { createContext, useCallback, useContext, useState } from "react";
import Toast from "@/components/rideComponents/Toast";

type ToastContextValue = {
  showToast: (message: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [durationMs, setDurationMs] = useState(1800);

  const showToast = useCallback((msg: string, dur = 1800) => {
    setMessage(msg);
    setDurationMs(dur);
    setVisible(true);
  }, []);

  const onHide = useCallback(() => setVisible(false), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={visible}
        message={message}
        durationMs={durationMs}
        onHide={onHide}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
