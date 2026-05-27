import { useState, useCallback } from "react";
import type { AlertVariant } from "@/components/Alert";

interface ToastState {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message?: string;
  duration?: number;
}

export function useToast() {
  const [state, setState] = useState<ToastState>({
    visible: false,
    variant: "info",
    title: "",
  });

  const show = useCallback(
    (
      title: string,
      options?: { variant?: AlertVariant; message?: string; duration?: number },
    ) => {
      setState({
        visible: true,
        title,
        variant: options?.variant ?? "info",
        message: options?.message,
        duration: options?.duration ?? 3000,
      });
    },
    [],
  );

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const success = useCallback(
    (title: string, message?: string) =>
      show(title, { variant: "success", message }),
    [show],
  );
  const error = useCallback(
    (title: string, message?: string) =>
      show(title, { variant: "error", message }),
    [show],
  );
  const warning = useCallback(
    (title: string, message?: string) =>
      show(title, { variant: "warning", message }),
    [show],
  );
  const info = useCallback(
    (title: string, message?: string) =>
      show(title, { variant: "info", message }),
    [show],
  );

  return { state, show, hide, success, error, warning, info };
}

interface DialogState {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useAlertDialog() {
  const [state, setState] = useState<DialogState>({
    visible: false,
    variant: "info",
    title: "",
    onConfirm: () => {},
  });

  const show = useCallback(
    (options: {
      variant?: AlertVariant;
      title: string;
      message?: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setState({ visible: true, variant: "info", ...options });
    },
    [],
  );

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      options?: {
        variant?: AlertVariant;
        confirmText?: string;
        cancelText?: string;
        onCancel?: () => void;
      },
    ) => {
      show({
        title,
        message,
        onConfirm,
        variant: options?.variant ?? "warning",
        confirmText: options?.confirmText ?? "Ya",
        cancelText: options?.cancelText ?? "Batal",
        onCancel: options?.onCancel ?? hide,
      });
    },
    [show, hide],
  );

  return { state, show, hide, confirm };
}
