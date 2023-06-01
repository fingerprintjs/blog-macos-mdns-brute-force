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
import { IconAccessPoint } from "@tabler/icons-react";

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

  const [isProcessing, setProcessing] = useState(false);
  const [detectedNames, setDetectedNames] = useState<null | ResolvedHostname[]>(
    null
  );

  const handleSubmit = useCallback(
    async (data: FormData) => {
      const patterns = data.patterns.split("\n");
      const names = data.names.split("\n");

      const mdnsCandidates: MDNSCandidate[] = patterns.flatMap((pattern) =>
        pattern.includes(NAME_PLACEHOLDER_TOKEN)
          ? names.map((name) => ({
              firstName: name,
              hostname: pattern
                .replaceAll(NAME_PLACEHOLDER_TOKEN, name)
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
                  Ping: {it.ping}ms
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
          To check your local hostname open <strong>System Preferences</strong>{" "}
          and go to the <strong>Sharing</strong> section:
        </Text>

        <center>
          <Image src="./sharing-settings.png" width="700px" />
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
    );
  }

  return (
    <Wrapper>
      <Title className={classes.title} mb="lg">
        Can I Guess Your Name?
      </Title>

      <Container p={0} size={600}>
        <Text size="lg" mb="xl" color="dimmed" className={classes.description}>
          This interactive demo site illuminates how the mDNS protocol can
          potentially be exploited in a web browser to uncover sensitive user
          information such as their first name.
        </Text>
      </Container>

      <Form isLoading={false} onSubmit={handleSubmit} />
    </Wrapper>
  );
}
