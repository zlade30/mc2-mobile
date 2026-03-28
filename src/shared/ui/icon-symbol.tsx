import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

/** Semantic icon names used by the app; mapped to MaterialCommunityIcons names. */
export type IconSymbolName =
  | "house.fill"
  | "house"
  | "paperplane.fill"
  | "chevron.left.forwardslash.chevron.right"
  | "chevron.right"
  | "receipt.fill"
  | "receipt"
  | "gift.fill"
  | "gift"
  | "megaphone.fill"
  | "megaphone"
  | "qrcode"
  | "qrcode.fill"
  | "person.fill"
  | "person"
  | "square.grid.2x2.fill"
  | "square.grid.2x2"
  | "list.bullet.rectangle.fill"
  | "checkmark.circle.fill"
  | "chart.bar.fill"
  | "gearshape.fill"
  | "history";

const MAPPING: Record<IconSymbolName, MaterialCommunityIconName> = {
  "house.fill": "home-outline",
  house: "home-outline",
  "paperplane.fill": "send-outline",
  "chevron.left.forwardslash.chevron.right": "code-tags",
  "chevron.right": "chevron-right",
  "receipt.fill": "receipt-outline",
  receipt: "receipt-outline",
  "gift.fill": "gift-outline",
  gift: "gift-outline",
  "megaphone.fill": "bullhorn-outline",
  megaphone: "bullhorn-outline",
  qrcode: "qrcode",
  "qrcode.fill": "qrcode",
  "person.fill": "account-outline",
  person: "account-outline",
  "square.grid.2x2.fill": "view-grid-outline",
  "square.grid.2x2": "view-grid-outline",
  "list.bullet.rectangle.fill": "format-list-bulleted",
  "checkmark.circle.fill": "check-circle-outline",
  "chart.bar.fill": "chart-bar",
  "gearshape.fill": "cog-outline",
  history: "history",
};

/**
 * Icon component that uses MaterialCommunityIcons on all platforms.
 * Accepts semantic names and maps them to MaterialCommunityIcons icon names.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <MaterialCommunityIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
