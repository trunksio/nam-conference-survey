import { Switch, Group, Text, Tooltip } from '@mantine/core';
import { IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';

interface AudioModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isSupported: boolean;
}

export function AudioModeToggle({ enabled, onToggle, isSupported }: AudioModeToggleProps) {
  const tooltipLabel = isSupported
    ? 'Enable audio mode to have questions read aloud and answer via voice'
    : 'Audio mode is not supported in this browser. Please use Chrome or Edge for voice input features.';

  return (
    <Tooltip label={tooltipLabel} position="bottom" withArrow>
      <Group gap="xs">
        <Switch
          checked={enabled}
          onChange={(event) => onToggle(event.currentTarget.checked)}
          disabled={!isSupported}
          color="equalBlue"
          thumbIcon={
            enabled ? (
              <IconMicrophone size={12} stroke={2.5} />
            ) : (
              <IconMicrophoneOff size={12} stroke={2.5} />
            )
          }
          label={
            <Text size="sm" fw={500}>
              Audio Mode
            </Text>
          }
        />
        {!isSupported && (
          <Text size="xs" c="dimmed">
            (Not supported)
          </Text>
        )}
      </Group>
    </Tooltip>
  );
}
