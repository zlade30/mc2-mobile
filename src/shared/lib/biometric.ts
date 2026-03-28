/**
 * Safe wrapper around expo-local-authentication.
 * When the native module is not available (e.g. Expo Go, web), all functions
 * return safe defaults instead of throwing. Uses dynamic import so the native
 * module is not loaded at app startup (avoids import-time crash in Expo Go).
 */

async function getLocalAuth(): Promise<typeof import("expo-local-authentication")> {
  return import("expo-local-authentication");
}

export enum AuthenticationType {
  FINGERPRINT = 1,
  FACIAL_RECOGNITION = 2,
  IRIS = 3,
}

export type LocalAuthenticationResult =
  | { success: true }
  | { success: false; error: string; warning?: string };

export async function hasHardwareAsync(): Promise<boolean> {
  try {
    const LocalAuthentication = await getLocalAuth();
    return await LocalAuthentication.hasHardwareAsync();
  } catch {
    return false;
  }
}

export async function isEnrolledAsync(): Promise<boolean> {
  try {
    const LocalAuthentication = await getLocalAuth();
    return await LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

export async function supportedAuthenticationTypesAsync(): Promise<
  AuthenticationType[]
> {
  try {
    const LocalAuthentication = await getLocalAuth();
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  } catch {
    return [];
  }
}

export async function authenticateAsync(options?: {
  promptMessage?: string;
}): Promise<LocalAuthenticationResult> {
  try {
    const LocalAuthentication = await getLocalAuth();
    return await LocalAuthentication.authenticateAsync(options);
  } catch {
    return { success: false, error: "not_available" };
  }
}

/**
 * Returns true only if the native module is available and biometrics are
 * supported and enrolled. Use this to avoid showing biometric UI when
 * running in Expo Go or when the module is missing.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const [hasHardware, isEnrolled] = await Promise.all([
      hasHardwareAsync(),
      isEnrolledAsync(),
    ]);
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}
