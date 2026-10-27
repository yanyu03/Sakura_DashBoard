import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function mount() {
  if (new URLSearchParams(window.location.search).get('design') === '1.0Sakura') {
    await import('./styles/SakuraEdu_1.0Sakura.css');
    await import('./styles/sakura-standard-bridge.css');
    await import('./styles/workspace-polish.css');
    if (new URLSearchParams(window.location.search).get('components') === '1') {
      const { default: DesignStandardPreview } = await import('./components/DesignStandardPreview');
      createRoot(document.getElementById('root')!).render(<DesignStandardPreview />);
      return;
    }
  }
  createRoot(document.getElementById('root')!).render(<App />);
}

void mount();
