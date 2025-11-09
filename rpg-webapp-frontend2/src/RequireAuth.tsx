import { Navigate, Outlet } from "react-router";

type Props = {
  logedIn: boolean;
};

export const RequireAuth = ({ logedIn }: Props) => {
  if (!logedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
