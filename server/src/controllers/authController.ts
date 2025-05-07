import asyncHandler from "express-async-handler";
import { CookieOptions, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { IUser } from "../types";

// @desc Authenticate a User
// @route PUT /api/auth/
// @access Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required!" });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({ message: "Invalid Email!" });
    return;
  }

  const match = await bcrypt.compare(password, user.password as string);

  if (!match) {
    res.status(401).json({ message: "Incorrect Password!" });
    return;
  }

  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.status(200).json({ accessToken });
});

// @desc Register User
// @route POST /api/auth
// @access Public
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Registration request body:", req.body);
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !email || !password) {
      res.status(400).json({ message: "All fields are required!" });
      return;
    }

    if (role && !["creator", "consumer"].includes(role)) {
      res.status(400).json({ message: "Invalid role specified" });
      return;
    }

    const userExist = await User.findOne({ email }).lean().exec();
    if (userExist) {
      res.status(409).json({ message: "User already exists with this email" });
      return;
    }

    const duplicate = await User.findOne({ username }).lean().exec();
    if (duplicate) {
      res.status(409).json({ message: "Username already taken" });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const role1= ["creator", "consumer"].includes(req.body.role)
      ? req.body.role
      : "consumer";
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: role1,
    });

    if (user) {
      const { accessToken, refreshToken } = generateTokens(user);

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      res.status(201).json({ accessToken });
    } else {
      res.status(400).json({ message: "Invalid user data received" });
    }
  }
);

// @desc Refresh token
// @route GET /api/auth/refresh
// @access Public
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      res.status(401).json({ message: "Please login again" });
      return;
    }

    const refreshToken = cookies.jwt;

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      async (err, decoded: any) => {
        if (err) {
          res.status(403).json({ message: "Forbidden" });
          return;
        }

        const foundUser = await User.findOne({
          username: decoded.username,
        }).exec();

        if (!foundUser) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }

        const { accessToken } = generateTokens(foundUser);
        res.status(200).json({ accessToken });
      }
    );
  }
);

// @desc Logout
// @route DELETE /api/auth
// @access Public
export const logout = (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookie cleared" });
};

const generateTokens = (user: IUser) => {
  const accessToken = jwt.sign(
    {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role || "consumer",
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username: user.username, role: user.role },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};