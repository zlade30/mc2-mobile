import { Asset } from "expo-asset";
import React, { useCallback, useEffect, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { SvgUri } from "react-native-svg";
import { styled } from "styled-components/native";

const CONFETTI_MODULE = require("../../../../../assets/images/birthday-confetti.svg");

const TILE_ASPECT = 500 / 750;

const ConfettiClip = styled.View`
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  overflow: hidden;
  z-index: 0;
`;

/** Shows only the upper portion of the artwork (hides the dense bottom band). */
const ConfettiTopHalf = styled.View<{ $visibleH: number }>`
  height: ${({ $visibleH }) => $visibleH}px;
  overflow: hidden;
`;

export function BirthdayConfettiRain() {
  const [tileW, setTileW] = useState(0);
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const asset = Asset.fromModule(CONFETTI_MODULE);
      await asset.downloadAsync();
      if (!cancelled && asset.localUri) {
        setUri(asset.localUri);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tileH = tileW > 0 ? tileW * TILE_ASPECT : 0;
  /** Bottom half of the SVG is clipped — less crowding over the title/gift. */
  const visibleH = tileH > 0 ? tileH / 2 : 0;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      setTileW(w);
    }
  }, []);

  const show = uri !== null && tileW > 0 && tileH > 0 && visibleH > 0;

  return (
    <ConfettiClip
      onLayout={onLayout}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {show ? (
        <ConfettiTopHalf $visibleH={visibleH}>
          <SvgUri width={tileW} height={tileH} uri={uri} />
        </ConfettiTopHalf>
      ) : null}
    </ConfettiClip>
  );
}
