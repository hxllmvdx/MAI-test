import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthRoute } from "./components/auth_route";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Dashboard } from "./pages/dashboard";
import OlympiadsPage from "./pages/OlympiadsPage";
import ProfilePage from "./pages/ProfilePage";
import OlympiadDetailPage from './pages/OlympiadDetailPage';

function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  const isGuest = localStorage.getItem("guest_mode") === "true";

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AuthRoute isAllowed={isAuthenticated || isGuest} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/olympiads" element={<OlympiadsPage />} />
          <Route path="/olympiads" element={<OlympiadsPage />} />
          <Route path="/olympiads/:olympiadId" element={<OlympiadDetailPage />} />
        </Route>

        <Route element={<AuthRoute isAllowed={isAuthenticated} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;