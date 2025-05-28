import { RegisterForm } from "./register_form";
import '../components/register.css';

export const Register = () => {
  return (
    <div className="register-page">
      <h1>Register</h1>
      <div className="register-form">
        <RegisterForm />
      </div>
      <div className="auth-links">
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};
