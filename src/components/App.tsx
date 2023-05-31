import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  ChevronIcon,
  Collapse,
  Container,
  Group,
  NativeSelect,
  Radio,
  Space,
  Stack,
  Text,
  Textarea,
  Title,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import nameMap from "../data/names-by-country.json";
import { Dots } from "./Dots/Dots";
import { getPossibleAppleDeviceMdnsBaseNames } from "../detection/device";
import { useLocalStorageFormCache } from "../hooks/form";
import { resolveLocalHostnamesWithFetch } from "../detection/fetch";
import { MDNSCandidate, ResolvedHostname } from "../detection/types";
import { resolveLocalHostnamesWithWebRTC } from "../detection/webrtc";
import { resolveLocalHostnamesWithIframe } from "../detection/iframe";

type CountryCode = keyof typeof nameMap;

const countryCodes = Object.keys(nameMap) as CountryCode[];

const useStyles = createStyles((theme) => ({
  inner: {
    position: "relative",
    zIndex: 1,
  },

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

  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  primaryInput: {
    width: "250px",
  },

  advancedSettings: {
    color: theme.colors.blue,
    fontWeight: 600,
    fontSize: rem(14),
    display: "flex",
    alignItems: "center",
    gap: "4px",
    width: "516px",
    maxWidth: "100%",
  },

  chevronIcon: {
    width: "18px",
    height: "18px",
  },
}));

const NAME_PLACEHOLDER_TOKEN = "<name>";

const resolvers = {
  webrtc: resolveLocalHostnamesWithWebRTC,
  fetch: resolveLocalHostnamesWithFetch,
  iframe: resolveLocalHostnamesWithIframe,
};

// TODO: use IP location
const defaultCountryCode = countryCodes[0];
const defaultGender = "male_names" as const;
const deviceBaseNames = getPossibleAppleDeviceMdnsBaseNames();
const formInitialValues = {
  countryCode: defaultCountryCode,
  names: "",
  gender: defaultGender,
  patterns: deviceBaseNames
    .flatMap((deviceName) => [
      `${NAME_PLACEHOLDER_TOKEN}s-${deviceName}.local`,
      `${deviceName}-${NAME_PLACEHOLDER_TOKEN}.local`,
      `${deviceName}.local`,
    ])
    .join("\n"),
  detectionMethod: "fetch" as keyof typeof resolvers,
};

export default function App() {
  const { classes } = useStyles();

  const [isProcessing, setProcessing] = useState(false);
  const [detectedNames, setDetectedNames] = useState<null | ResolvedHostname[]>(
    null
  );
  const [isAdvancedSettingsShowed, setAdvancedSettings] = useState(false);
  const toggleAdvancedSettings = () => setAdvancedSettings((state) => !state);

  const form = useForm({ initialValues: formInitialValues });
  useLocalStorageFormCache(form, "user-form");

  useEffect(() => {
    const { countryCode, gender } = form.values;
    form.setFieldValue("names", nameMap[countryCode][gender].join("\n"));
  }, [form.values.countryCode, form.values.gender]);

  const handleSubmit = useCallback(async () => {
    const patterns = form.values.patterns.split("\n");
    const names = form.values.names.split("\n");

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

    const detected = await resolvers[form.values.detectionMethod](
      mdnsCandidates
    );

    setDetectedNames(detected);
    setProcessing(false);

    if (detected.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [form, setProcessing]);

  if (detectedNames !== null) {
  }

  return (
    <Stack mih="100%" pos="relative" py="80px" px="md" justify="center">
      <Dots style={{ left: 0, top: 0 }} />
      <Dots style={{ left: 60, top: 0 }} />
      <Dots style={{ left: 0, top: 140 }} />
      <Dots style={{ right: 0, top: 60 }} />

      <div className={classes.inner}>
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
            This interactive demo site illuminates how the mDNS protocol can
            potentially be exploited in a web browser to uncover sensitive user
            information such as their first name.
          </Text>
        </Container>

        {detectedNames !== null && detectedNames.length <= 10 && (
          <>
            <Space h="80px" />
            <Title className={classes.title} mb="lg">
              Your Name Is:
            </Title>
            {detectedNames.map((it) => (
              <Title
                className={classes.title}
                size="xs"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                inherit
                mb="lg"
                key={it.hostname}
              >
                Hi, {it.firstName}
                <br />
                {it.hostname}
              </Title>
            ))}

            <Space h="80px" />
          </>
        )}

        <form className={classes.form} onSubmit={form.onSubmit(handleSubmit)}>
          <Group>
            <NativeSelect
              label="Name Origin"
              data={countryCodes.map((it) => ({
                value: it,
                label: `${nameMap[it].emoji} ${nameMap[it].name}`,
              }))}
              error={form.errors.countryCode}
              className={classes.primaryInput}
              {...form.getInputProps("countryCode")}
            />
            <NativeSelect
              label="Name Gender"
              data={[
                { value: "male_names", label: "🙎‍♂️ Male" },
                { value: "female_names", label: "🙎‍♀️ Female" },
                { value: "neutral", label: "👤 Neutral", disabled: true },
              ]}
              className={classes.primaryInput}
              error={form.errors.gender}
              {...form.getInputProps("gender")}
            />
          </Group>

          <UnstyledButton
            onClick={toggleAdvancedSettings}
            mt="sm"
            className={classes.advancedSettings}
          >
            <Text>Advanced Settings</Text>
            <ChevronIcon className={classes.chevronIcon} />
          </UnstyledButton>

          <Collapse in={isAdvancedSettingsShowed}>
            <Radio.Group
              name="detectionMethod"
              label="Detection Method"
              description="Availability depends on the browser"
              mt="xl"
              {...form.getInputProps("detectionMethod")}
            >
              <Group mt="xs">
                <Radio value="fetch" label="fetch" />
                <Radio value="webrtc" label="WebRTC" />
                <Radio value="iframe" label="iframe" />
              </Group>
            </Radio.Group>

            <Textarea
              autosize
              w="516px"
              mt="xl"
              label="mDNS Patterns"
              placeholder="<name>-macbook-pro.local"
              {...form.getInputProps("patterns")}
            />

            <UnstyledButton
              onClick={() => form.reset()}
              mt="xs"
              className={classes.advancedSettings}
            >
              <Text>Reset patterns</Text>
            </UnstyledButton>

            <Textarea
              w="516px"
              rows={10}
              mt="xl"
              label="Names To Check"
              placeholder={"John\nKevin\nAlex"}
              minRows={10}
              disabled={!form.values.patterns.includes("<name>")}
              {...form.getInputProps("names")}
            />
          </Collapse>

          <Button
            mt="xl"
            type="submit"
            size="lg"
            loaderPosition="right"
            loading={isProcessing}
          >
            Guess My Name
          </Button>
        </form>
      </div>
    </Stack>
  );
}
