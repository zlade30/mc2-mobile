import "styled-components/native";
import type { AppTheme } from "@/shared/theme";

declare module "styled-components/native" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- module augmentation
  export interface DefaultTheme extends AppTheme {}
}
