import { LoginForm } from "./login_form";
import { useNavigate } from "react-router-dom";
import '../components/login.css';

export const Login = () => {
  const navigate = useNavigate();

  const handleGuestAccess = () => {
    localStorage.setItem('guest_mode', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <LoginForm />
      <div className="auth-links">
        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
        <div className="guest-section">
          <p>Or continue as guest:</p>
          <button 
            onClick={handleGuestAccess}
            className="guest-button"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};