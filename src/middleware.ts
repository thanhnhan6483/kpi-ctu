import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/auth")) return

  if (pathname === "/login") {
    if (req.auth) {
      return Response.redirect(new URL("/", req.nextUrl.origin))
    }
    return
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
