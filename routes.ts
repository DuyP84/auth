/**
 * 
 */
export const publicRoutes = [
    "/", "/auth/new-verification"
];

export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/reset",
    "/auth/new-password",
];

export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string[]} 
 */
export const DEFAULT_LOGIN_REDIRECT = "/settings";
