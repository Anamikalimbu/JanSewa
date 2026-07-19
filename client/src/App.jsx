import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import AppRouter from "./routes/AppRouter";

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </LanguageProvider>
);

export default App;
