import { useCallback, useRef, useState } from "react";

import type {
  BottomModalState,
  ShowConfirmOptions,
  ShowCustomOptions,
  ShowMessageOptions,
} from "./types";

const initialState: BottomModalState = {
  visible: false,
  type: "message",
  title: undefined,
  message: undefined,
  confirmText: undefined,
  cancelText: undefined,
  destructive: undefined,
  keepOpenOnConfirm: undefined,
  onConfirm: undefined,
  onCancel: undefined,
  onClose: undefined,
  content: undefined,
};

export function useLocalBottomModal() {
  const [modalState, setModalState] = useState<BottomModalState>(initialState);
  // Synchronously-updated mirror of modalState so LocalBottomModal can read
  // the latest value inside async callbacks (before React re-renders).
  const stateRef = useRef<BottomModalState>(initialState);

  const update = (next: BottomModalState) => {
    stateRef.current = next;
    setModalState(next);
  };

  const showMessage = useCallback((opts: ShowMessageOptions) => {
    update({
      visible: true,
      type: "message",
      title: opts.title,
      message: opts.message,
      onClose: opts.onClose,
      confirmText: undefined,
      cancelText: undefined,
      destructive: undefined,
      keepOpenOnConfirm: undefined,
      onConfirm: undefined,
      onCancel: undefined,
      content: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showConfirm = useCallback((opts: ShowConfirmOptions) => {
    update({
      visible: true,
      type: "confirm",
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText ?? "Confirm",
      cancelText: opts.cancelText ?? "Cancel",
      destructive: opts.destructive ?? false,
      keepOpenOnConfirm: opts.keepOpenOnConfirm ?? false,
      onConfirm: opts.onConfirm,
      onCancel: opts.onCancel,
      onClose: undefined,
      content: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showCustom = useCallback((opts: ShowCustomOptions) => {
    update({
      visible: true,
      type: "custom",
      title: opts.title,
      content: opts.content,
      onClose: opts.onClose,
      message: undefined,
      confirmText: undefined,
      cancelText: undefined,
      destructive: undefined,
      keepOpenOnConfirm: undefined,
      onConfirm: undefined,
      onCancel: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hide = useCallback(() => {
    update(initialState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getState = useCallback(() => stateRef.current, []);

  return { modalState, showMessage, showConfirm, showCustom, hide, getState };
}
