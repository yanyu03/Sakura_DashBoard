import {createRoot} from 'react-dom/client';
import {useEffect, type ReactNode} from 'react';

declare global {
  interface Window {
    __sakuraBoot?: {finish(): void; fail(): void};
  }
}

function StartupReady({children}: {children: ReactNode}) {
  useEffect(() => window.__sakuraBoot?.finish(), []);
  return children;
}

const root = createRoot(document.getElementById('root')!, {
  onUncaughtError(error, info) {
    console.error('SakuraEdu render failed', error, info);
    window.__sakuraBoot?.fail();
  },
});

async function mount() {
  // Load app styles after the HTML startup screen can paint.
  await import('./index.css');
  if (new URLSearchParams(window.location.search).get('design') === '1.0Sakura') {
    await import('./styles/SakuraEdu_1.0Sakura.css');
    await import('./styles/sakura-standard-bridge.css');
    await import('./styles/workspace-polish.css');
    if (new URLSearchParams(window.location.search).get('components') === '1') {
      const { default: DesignStandardPreview } = await import('./components/DesignStandardPreview');
      root.render(<StartupReady><DesignStandardPreview /></StartupReady>);
      return;
    }
  }
  const {default: App} = await import('./App.tsx');
  root.render(<StartupReady><App /></StartupReady>);
}

void mount().catch((error) => {
  console.error('SakuraEdu startup failed', error);
  window.__sakuraBoot?.fail();
});
