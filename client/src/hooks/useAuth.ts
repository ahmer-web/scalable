import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { IDecode } from "@/types";
import { selectCurrentToken } from "@/app/authSlice";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);

  if (token) {
    try {
      const decoded = jwtDecode<IDecode>(token);
      return { ...decoded.user, isAuthenticated: true, role: decoded.user.role };
    } catch (error) {
      console.log("Invalid token", error);
      return {
        id: "",
        name: "",
        username: "",
        email: "",
        profilePicture: "",
        bio: "",
        role: undefined,
        isAuthenticated: false,
      };
    }
  }

  return {
    id: "",
    name: "",
    username: "",
    email: "",
    profilePicture: "",
    bio: "",
    role: undefined,
    isAuthenticated: false,
  };
};

export default useAuth;
