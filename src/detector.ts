const MAX_CONNECTIONS = 50;

export async function testNames(names: string[]) {
  const validNames: string[] = [];

  for (let i = 0; i < names.length; i += MAX_CONNECTIONS) {
    const chunk = names.slice(i, i + MAX_CONNECTIONS);
    const abortController = new AbortController();

    setTimeout(() => {
      abortController.abort();
    }, 1000);

    await Promise.all(
      chunk.map((name) =>
        fetch(`https://${name}s-macbook-pro.local/`, {
          signal: abortController.signal,
        })
          .then(() => validNames.push(name))
          .catch((e) => {
            console.log(e);
            if (e.name !== "AbortError") {
              validNames.push(name);
            }
          })
      )
    );
  }

  return validNames;
}

export function getAppleDeviceName() {
  const key = `${window.screen.width}x${window.screen.height}`;
  const map: Record<string, { name: string; mdnsName: string }[]> = {
    "1366x768": [
      {
        name: 'Macbook Air 11"',
        mdnsName: "macbook-air",
      },
    ],
    "1280x800": [
      {
        name: 'Macbook Pro 13"',
        mdnsName: "macbook-pro",
      },
    ],
    "1512x982": [
      {
        name: 'Macbook Pro 14"',
        mdnsName: "macbook-pro",
      },
    ],
    "1440x900": [
      {
        name: 'Macbook Pro 15"',
        mdnsName: "macbook-pro",
      },
      {
        name: 'Macbook Air 13"',
        mdnsName: "macbook-air",
      },
    ],
    "1728x1117": [
      {
        name: 'Macbook Pro 16"',
        mdnsName: "macbook-pro",
      },
    ],
    "1920x1080": [
      {
        name: 'iMac 21"',
        mdnsName: "imac",
      },
    ],
    "2560x1440": [
      {
        name: 'iMac 27"',
        mdnsName: "imac",
      },
    ],
  };

  return map[key] ?? [];
}
