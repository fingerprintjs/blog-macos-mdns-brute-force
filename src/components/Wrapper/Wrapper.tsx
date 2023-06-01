import { Stack } from "@mantine/core";
import { Dots } from "../Dots/Dots";
import { PropsWithChildren } from "react";

export function Wrapper({ children }: PropsWithChildren) {
  return (
    <Stack mih="100%" pos="relative" py="80px" px="md" justify="center">
      <Dots style={{ left: 0, top: 0 }} />
      <Dots style={{ left: 60, top: 0 }} />
      <Dots style={{ left: 0, top: 140 }} />
      <Dots style={{ right: 0, top: 60 }} />

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </Stack>
  );
}
