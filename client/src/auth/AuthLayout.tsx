import useAuth from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="w-full bg-dark h-screen flex items-center justify-center bg-gray-50">
          <section className="flex flex-1 justify-center items-center flex-col max-w-md">
            <Outlet />
          </section>
        </div>
      )}
    </>
  );
};
export default AuthLayout;
