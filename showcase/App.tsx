import Storybook from './.rnstorybook';
import PreviewEntry from './src/preview/PreviewEntry';

declare const process: {
  env: {
    EXPO_PUBLIC_SHOWCASE_ENTRY?: string;
    EXPO_PUBLIC_PREVIEW_APP?: string;
    EXPO_PUBLIC_STORYBOOK_ENABLED?: string;
  };
};

export default function App() {
  const entry = process.env.EXPO_PUBLIC_SHOWCASE_ENTRY;
  const previewEnabled = process.env.EXPO_PUBLIC_PREVIEW_APP === 'true';
  const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

  if (entry === 'preview' || previewEnabled) {
    return <PreviewEntry />;
  }

  if (entry === 'storybook' || storybookEnabled) {
    return <Storybook />;
  }

  return <PreviewEntry />;
}
