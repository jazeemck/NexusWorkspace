"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#16161f",
          color: "#f0f0ff",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          fontSize: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        },
        success: {
          iconTheme: { primary: "#22d3a0", secondary: "#16161f" },
        },
        error: {
          iconTheme: { primary: "#ff5b6d", secondary: "#16161f" },
        },
        duration: 4000,
      }}
    />
  );
}
