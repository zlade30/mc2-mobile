/**
 * App unlock PIN stored in SecureStore.
 * Used when biometrics are not available.
 */

const PIN_STORAGE_KEY = "app-unlock-pin";

async function getSecureStore(): Promise<
  typeof import("expo-secure-store")
> {
  return import("expo-secure-store");
}

export async function setPin(pin: string): Promise<void> {
  const SecureStore = await getSecureStore();
  await SecureStore.setItemAsync(PIN_STORAGE_KEY, pin);
}

export async function clearPin(): Promise<void> {
  const SecureStore = await getSecureStore();
  await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
}

export async function isPinSet(): Promise<boolean> {
  try {
    const SecureStore = await getSecureStore();
    const value = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    return value != null && value.length > 0;
  } catch {
    return false;
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const SecureStore = await getSecureStore();
    const stored = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    return stored === pin;
  } catch {
    return false;
  }
}

export const PIN_LENGTH = 6;
