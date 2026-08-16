import jwt from "jsonwebtoken";

/**
 * Generates a short-lived JWT access token.
 * @param {string} userId
 * @returns {string} access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });
};

/**
 * Generates a long-lived JWT refresh token.
 * @param {string} userId
 * @returns {string} refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

/**
 * Sets the refresh token as an HttpOnly secure cookie on the response.
 * @param {import('express').Response} res
 * @param {string} refreshToken
 */
export const setRefreshTokenCookie = (res, refreshToken) => {
  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE_DAYS) || 7;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: cookieExpireDays * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });
};

/**
 * Generates both access & refresh tokens, sets refresh cookie, and returns access token.
 * @param {import('express').Response} res
 * @param {string} userId
 * @returns {{accessToken: string, refreshToken: string}}
 */
export const issueTokens = (res, userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  setRefreshTokenCookie(res, refreshToken);
  return { accessToken, refreshToken };
};
