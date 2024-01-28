import authConfig from "./auth.config";
import NextAuth from "next-auth"
import {
    DEFAULT_LOGIN_REDIRECT,
    apiAuthPrefix,
    publicRoutes,
    authRoutes,
} from '@/routes';

const { auth } = NextAuth(authConfig);
export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
   //xuat ra man hinh dia diem route, login vào chưa 
    // console.log("ROUTE: ", req.nextUrl.pathname);
    // console.log("Logged In?: ", isLoggedIn);

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return null;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return null;
    }

    if (!isLoggedIn && !isPublicRoute)
    {
        return Response.redirect(new URL("/auth/login", nextUrl));
        
    }

    return null;
})

// Optionally, don't invoke Middleware on some paths
//match link to route o tren, tuc la no khong can biet dang o route nao, matcher nay se hien len bang clg
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}