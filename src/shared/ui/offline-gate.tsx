import { useNetInfo } from "@react-native-community/netinfo";
import React, { type ReactNode } from "react";
import { styled } from "styled-components/native";

import { OfflineBanner } from "@/shared/ui/offline-banner";

const Wrapper = styled.View`
  flex: 1;
`;

const Content = styled.View`
  flex: 1;
`;

type OfflineGateProps = {
  children: ReactNode;
};

export function OfflineGate({ children }: OfflineGateProps) {
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;

  return (
    <Wrapper>
      {isOffline ? <OfflineBanner /> : null}
      <Content>{children}</Content>
    </Wrapper>
  );
}
