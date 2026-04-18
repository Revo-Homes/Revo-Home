import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRoutes from './routes';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '556006503736-ffqsd7mjrbhmubor3ttd2o0l7evivmcs.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppRoutes />
    </GoogleOAuthProvider>
  );
}

export default App;
