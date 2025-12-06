import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

interface ThemeToggleProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ThemeToggle({ size = 'lg' }: ThemeToggleProps): JSX.Element {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleColorScheme = (): void => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ActionIcon
      onClick={toggleColorScheme}
      variant="default"
      size={size}
      aria-label={`Switch to ${computedColorScheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${computedColorScheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {computedColorScheme === 'dark' ? (
        <IconSun style={{ width: '70%', height: '70%' }} />
      ) : (
        <IconMoon style={{ width: '70%', height: '70%' }} />
      )}
    </ActionIcon>
  );
}
