import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ColorModeProvider } from './theme/ColorModeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <ColorModeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  );
}

export default App;

