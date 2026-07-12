import type { Meta, StoryObj } from '@storybook/react-native';
import { ErrorStateTemplate } from './ErrorStateTemplate';

const meta = {
  title: 'Templates/ErrorState',
  component: ErrorStateTemplate,
  parameters: { layout: 'fullscreen' },
  args: {
    retryAction: { label: 'Try again', onPress: () => undefined },
    secondaryAction: { label: 'Contact support', onPress: () => undefined },
  },
} satisfies Meta<typeof ErrorStateTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const General: Story = { args: { type: 'general' } };
export const Network: Story = { args: { type: 'network' } };
export const Server: Story = { args: { type: 'server', referenceCode: 'ERR-500-2481' } };
export const SessionExpired: Story = { args: { type: 'sessionExpired' } };
export const Permission: Story = { args: { type: 'permission' } };
export const Maintenance: Story = { args: { type: 'maintenance' } };
export const Compact: Story = { args: { type: 'network', variant: 'compact' } };
