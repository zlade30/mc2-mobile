import type { ReactNode } from "react";

export type BottomModalType = "message" | "confirm" | "custom";

export type ShowMessageOptions = {
  title: string;
  message: string;
  /** Called when the user taps OK. Default: just closes. */
  onClose?: () => void;
};

export type ShowConfirmOptions = {
  title: string;
  /** Plain string or rich content (e.g. nested `ThemedText` for emphasis). */
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Use destructive (e.g. red) style for confirm button */
  destructive?: boolean;
  /**
   * Called when the user taps the confirm button.
   * If `keepOpenOnConfirm` is true, this can be async; the modal will show a loading indicator
   * and stay open until the promise settles.
   */
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  /**
   * If true, the modal will not dismiss immediately on confirm.
   * Instead it will show a spinner while `onConfirm` runs and dismiss after it resolves.
   */
  keepOpenOnConfirm?: boolean;
};

export type ShowCustomOptions = {
  title?: string;
  content: ReactNode;
  onClose: () => void;
};

export type BottomModalState = {
  visible: boolean;
  type: BottomModalType;
  title?: string;
  message?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  keepOpenOnConfirm?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  content?: ReactNode;
};
