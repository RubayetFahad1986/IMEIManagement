import { toast as sonnerToast, ExternalToast } from "sonner";
import { playSound } from "./sound";

export const toast = {
  success: (message: string | React.ReactNode, data?: ExternalToast) => {
    playSound('success');
    return sonnerToast.success(message, data);
  },
  error: (message: string | React.ReactNode, data?: ExternalToast) => {
    playSound('error');
    return sonnerToast.error(message, data);
  },
  info: (message: string | React.ReactNode, data?: ExternalToast) => {
    return sonnerToast.info(message, data);
  },
  warning: (message: string | React.ReactNode, data?: ExternalToast) => {
    return sonnerToast.warning(message, data);
  },
  message: (message: string | React.ReactNode, data?: ExternalToast) => {
    return sonnerToast.message(message, data);
  },
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
  loading: sonnerToast.loading,
};
