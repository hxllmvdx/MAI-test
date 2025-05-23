import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthRoute } from "./components/auth_route";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Dashboard } from "./pages/dashboard";
import OlympiadsPage from "./pages/OlympiadsPage"
import ProfilePage from "./pages/ProfilePage";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/olympiads" element={<OlympiadsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route element={<AuthRoute isAllowed={isAuthenticated} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;