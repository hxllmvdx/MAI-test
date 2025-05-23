import { LoginForm } from "../components/login_form";

export const Login = () => {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
};