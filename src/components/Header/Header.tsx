import { Group } from "@mantine/core";
import React from "react";

export const BLOG_ARTICLE_LINK =
  "https://fingerprint.com/blog/apple-macos-mdns-brute-force/";
export const SOURCE_CODE_LINK =
  "https://github.com/fingerprintjs/blog-macos-mdns-brute-force";

export function Header() {
  return (
    <Group
      pos="absolute"
      top={0}
      w="100%"
      position="right"
      spacing="50px"
      p="30px 50px"
    >
      <a
        href={SOURCE_CODE_LINK}
        style={{ color: "#228be6" }}
        target="_blank"
        rel="noreferrer"
      >
        Source Code
      </a>
      <a
        href={BLOG_ARTICLE_LINK}
        style={{ color: "#228be6" }}
        target="_blank"
        rel="noreferrer"
      >
        Article
      </a>
    </Group>
  );
}
