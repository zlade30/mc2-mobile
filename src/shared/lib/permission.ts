import {
  AuthorizationStatus,
  requestPermission,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";
import { messaging } from "../../../firebase";

const requestNotificationPermissionAndroid = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return granted;
};

const requestNotificationPermissionIos = async () => {
  const authStatus = await requestPermission(messaging);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  return enabled;
};

const requestNotificationPermission = async () => {
  if (Platform.OS === "ios") {
    return requestNotificationPermissionIos();
  } else {
    return requestNotificationPermissionAndroid();
  }
};

export { requestNotificationPermission };
