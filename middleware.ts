import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/client',
  
]);

/**
 * Middleware function that protects routes that are marked as protected.
 * 
 * This middleware is used to secure certain routes in the application. It checks if the
 * current request is for a protected route, and if so, it calls the `auth().protect()`
 * function to ensure that the user is authenticated before allowing access to the route.
 *
 * @param {import("@clerk/nextjs/server").Auth} auth - The authentication object provided by the Clerk library.
 * @param {import("http").IncomingMessage} req - The incoming HTTP request object.
 * @returns {Promise<void>} - A Promise that resolves when the middleware has finished executing.
 */
export default clerkMiddleware((auth, req)=>{
  if (isProtectedRoute(req)){
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};