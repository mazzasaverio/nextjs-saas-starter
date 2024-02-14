import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhook"],
  afterAuth(auth, req) {
    if (auth.userId && auth.isPublicRoute) {
      let path = "/home";

      const userSelection = new URL(path, req.url);
      return NextResponse.redirect(userSelection);
    }
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
