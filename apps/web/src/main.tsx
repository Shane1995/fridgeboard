import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import { watchSession } from './services/session/watchSession';
import './index.css';

const root = document.getElementById('root');

if (root) {
  watchSession();
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
