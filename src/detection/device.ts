export function getPossibleAppleDeviceMdnsBaseNames(): string[] {
  const key = `${window.screen.width}x${window.screen.height}`;
  switch (key) {
    case "1366x768": // 11 inch
      return ["macbook-air"];

    case "1280x800": // 13 inch
    case "1512x982": // 14 inch
    case "1728x1117": // 16 inch
      return ["macbook-pro"];

    case "1440x900": // 14 inch pro or 13 inch air
      return ["macbook-pro", "macbook-air"];

    case "1920x1080":
      return ["imac"];

    case "2560x1440":
      return ["imac"];

    default:
      return ["macbook-pro", "macbook-air", "imac", "mac-mini", "mac"];
  }
}
