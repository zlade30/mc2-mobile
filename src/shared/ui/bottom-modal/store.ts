import { create } from "zustand";

import type {
  BottomModalState,
  ShowConfirmOptions,
  ShowCustomOptions,
  ShowMessageOptions,
} from "./types";

type BottomModalStore = BottomModalState & {
  showMessage: (opts: ShowMessageOptions) => void;
  showConfirm: (opts: ShowConfirmOptions) => void;
  showCustom: (opts: ShowCustomOptions) => void;
  hide: () => void;
};

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

export const useBottomModalStore = create<BottomModalStore>((set) => ({
  ...initialState,

  showMessage: (opts) => {
    set({
      visible: true,
      type: "message",
      title: opts.title,
      message: opts.message,
      onClose: opts.onClose,
      confirmText: undefined,
      cancelText: undefined,
      destructive: undefined,
      onConfirm: undefined,
      onCancel: undefined,
      content: undefined,
    });
  },

  showConfirm: (opts) => {
    set({
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
  },

  showCustom: (opts) => {
    set({
      visible: true,
      type: "custom",
      title: opts.title,
      content: opts.content,
      onClose: opts.onClose,
      message: undefined,
      confirmText: undefined,
      cancelText: undefined,
      destructive: undefined,
      onConfirm: undefined,
      onCancel: undefined,
    });
  },

  hide: () => {
    set(initialState);
  },
}));

export const showMessage = (opts: ShowMessageOptions) => {
  useBottomModalStore.getState().showMessage(opts);
};

export const showConfirm = (opts: ShowConfirmOptions) => {
  useBottomModalStore.getState().showConfirm(opts);
};

export const showCustom = (opts: ShowCustomOptions) => {
  useBottomModalStore.getState().showCustom(opts);
};

export const hideBottomModal = () => {
  useBottomModalStore.getState().hide();
};
