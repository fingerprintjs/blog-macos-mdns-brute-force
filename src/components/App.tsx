import { useCallback, useState } from "react";
import {
  Container,
  Image,
  Loader,
  Notification,
  Space,
  Text,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import { MDNSCandidate, ResolvedHostname } from "../detection/types";
import { Form, FormData, NAME_PLACEHOLDER_TOKEN } from "./Form/Form";
import { mdnsResolvers } from "../detection";
import { Wrapper } from "./Wrapper/Wrapper";
import { IconAccessPoint, IconDevicesPc } from "@tabler/icons-react";
import { BLOG_ARTICLE_LINK, Header } from "./Header/Header";

const useStyles = createStyles((theme) => ({
  title: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: rem(40),
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  description: {
    textAlign: "center",
  },
}));

export default function App() {
  const { classes } = useStyles();
  const isMobile = window.screen.width < 600;

  const [isProcessing, setProcessing] = useState(false);
  const [detectedNames, setDetectedNames] = useState<null | ResolvedHostname[]>(
    null
  );

  const handleSubmit = useCallback(
    async (data: FormData) => {
      const patterns = data.patterns.split("\n");
      const names = Array.from(new Set(data.names.split("\n")));

      const mdnsCandidates: MDNSCandidate[] = patterns.flatMap((pattern) =>
        pattern.includes(NAME_PLACEHOLDER_TOKEN)
          ? names.map((name) => ({
              firstName: name,
              hostname: pattern
                .replaceAll(NAME_PLACEHOLDER_TOKEN, name.replaceAll(" ", "-"))
                .toLowerCase(),
            }))
          : { hostname: pattern.toLowerCase() }
      );

      setProcessing(true);

      const detected = await mdnsResolvers[data.detectionMethod](
        mdnsCandidates,
        (candidate) => setDetectedNames([candidate])
      );

      if (detected.length < 15) {
        setDetectedNames(detected);
      } else {
        setDetectedNames([]);
      }

      setProcessing(false);

      if (detected.length > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [setProcessing]
  );

  if (isProcessing) {
    return (
      <Wrapper>
        <center>
          <Text
            size="lg"
            mb="xl"
            color="dimmed"
            className={classes.description}
          >
            Resolving local hostnames. Please wait.
          </Text>

          {detectedNames && (
            <Container p={0} mt="lg" mb="lg" size={400}>
              {detectedNames.map((it) => (
                <Notification
                  mb="sm"
                  title={it.hostname}
                  icon={<IconAccessPoint />}
                  withCloseButton={false}
                  withBorder
                  key={it.hostname}
                >
                  Ping: {it.ping.toFixed(0)}ms
                </Notification>
              ))}
            </Container>
          )}

          <Loader />
        </center>
      </Wrapper>
    );
  }

  if (detectedNames !== null) {
    const [first] = detectedNames;

    return (
      <>
        <Wrapper>
          {first ? (
            <>
              <Title
                className={classes.title}
                size="xs"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                inherit
                mb="lg"
              >
                Are you {first.firstName}?
              </Title>

              <Container p={0} size={400}>
                <Text
                  size="lg"
                  mb="xl"
                  color="dimmed"
                  className={classes.description}
                >
                  Based on the list of hostnames resolved <br /> in your local
                  network:
                </Text>

                {detectedNames.map((it) => (
                  <Notification
                    mb="sm"
                    title={it.hostname}
                    icon={<IconAccessPoint />}
                    withCloseButton={false}
                    withBorder
                    key={it.hostname}
                  >
                    Ping: {it.ping}ms
                  </Notification>
                ))}
              </Container>
            </>
          ) : (
            <>
              <Title
                className={classes.title}
                size="xs"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                inherit
                mb="lg"
              >
                We Could Not Detect Your Name
              </Title>

              <Container p={0} size={700}>
                <Text
                  size="lg"
                  mb="xl"
                  color="dimmed"
                  className={classes.description}
                >
                  This probably means that your name is rare or your network
                  configuration does not support MDNS. Consider configuring the
                  demo with advanced settings and running it again.
                </Text>
              </Container>
            </>
          )}

          <Space h="80px" />

          <Text size="lg" className={classes.description}>
            To check your local hostname open{" "}
            <strong>System Preferences</strong> and go to the{" "}
            <strong>Sharing</strong> section:
          </Text>

          <center>
            <Image src="./sharing-settings.png" width="700px" />
          </center>

          <Text size="lg" className={classes.description}>
            Sometimes detection results may be affected by the{" "}
            <strong>network configuration</strong>. <br />
            Please check if your <strong>Firewall</strong> is disabled and your
            device hostname can be resolved.
          </Text>

          <center>
            <Image src="./terminal.png" width="700px" />
          </center>

          <Space h="40px" />
          <Title size="h2" mb="lg" align="center">
            Try Again
          </Title>

          <Form
            isLoading={isProcessing}
            onSubmit={handleSubmit}
            advancedSettingsOpened
          />
        </Wrapper>

        <Header />
      </>
    );
  }

  return (
    <>
      {" "}
      <Wrapper>
        <Title className={classes.title} mb="lg">
          Can I Guess Your Name?
        </Title>

        <Container p={0} size={600}>
          <Text
            size="lg"
            mb="xl"
            color="dimmed"
            className={classes.description}
          >
            This demo illustrates how the mDNS protocol can be exploited in a
            web browser to reveal macOS user's first name.{" "}
            <a
              href={BLOG_ARTICLE_LINK}
              style={{ color: "#228be6" }}
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
            .
          </Text>

          <Notification
            icon={<IconDevicesPc size="1.3rem" />}
            color="yellow"
            withCloseButton={false}
            withBorder
            w={500}
            maw="100%"
            m="0 auto 40px"
          >
            The demo works only for devices running <strong>MacOS</strong>, such
            as Macbook or iMac
          </Notification>
        </Container>

        {!isMobile && <Form isLoading={false} onSubmit={handleSubmit} />}
      </Wrapper>
      <Header />
    </>
  );
}
