import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/index.css';
import { ThemeProvider, useTheme } from './store/ThemeContext.jsx';

// This wrapper applies the theme background directly to the root div
// so it covers the entire viewport regardless of body/html CSS specificity.
function ThemedRoot() {
  const { theme } = useTheme();
  return (
    <div
      id="themed-root"
      style={{
        minHeight: '100vh',
        backgroundColor: theme.bg,
        transition: 'background-color 0.5s ease',
      }}
    >
      <App />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemedRoot />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
