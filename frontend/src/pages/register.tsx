import { RegisterForm } from "../components/register_form";

export const Register = () => {
  return (
    <div>
      <h1>Register</h1>
      <RegisterForm />
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};