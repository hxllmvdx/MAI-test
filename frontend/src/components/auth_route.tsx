import { Navigate, Outlet } from "react-router-dom";

interface AuthRouteProps {
  isAllowed: boolean;
  redirectPath?: string;
}

export const AuthRoute = ({
  isAllowed,
  redirectPath = "/login",
}: AuthRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};