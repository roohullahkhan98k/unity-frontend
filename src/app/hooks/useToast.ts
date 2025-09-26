"use client";
import { toast, ToastOptions } from "react-toastify";

export function useToast() {
  const showToast = (message: string, type: "success" | "error" = "success", options?: ToastOptions) => {
    if (type === "success") {
      toast.success(message, options);
    } else {
      toast.error(message, options);
    }
  };
  return showToast;
} 