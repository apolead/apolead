import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx'
import './index.css'
import { interceptRecoveryFlow } from "./utils/recoveryInterceptor";

// Intercept recovery flow before anything else runs
interceptRecoveryFlow();

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
  </>
);
