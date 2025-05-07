import { RootState } from "@/app/store";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {jwtDecode} from "jwt-decode";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  role: "creator" | "consumer";
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
      }>
    ) => {
      const token = action.payload.token;
      if (token) {
        const decoded: any = jwtDecode(token);
        state.token = token;
        state.user = {
          id: decoded.user.id,
          name: decoded.user.name,
          username: decoded.user.username,
          email: decoded.user.email,
          profilePicture: decoded.user.profilePicture,
          bio: decoded.user.bio,
          role: decoded.user.role || "consumer"
        };
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;