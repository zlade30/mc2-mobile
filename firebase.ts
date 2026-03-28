// Import the functions you need from the React Native Firebase SDK
import { getApp } from "@react-native-firebase/app";
import {
    AuthorizationStatus,
    getMessaging,
    requestPermission, // Add this import
} from "@react-native-firebase/messaging";

// Get the default app instance
const app = getApp();

// Get messaging instance
const messagingInstance = getMessaging(app);

export { AuthorizationStatus, messagingInstance as messaging, requestPermission };
