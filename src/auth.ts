import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { User } from "@/types"
import { readDb } from "@/lib/db"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username as string
        const password = credentials?.password as string

        if (!username || !password) return null

        const users = readDb<User>("users")
        const user = users.find(
          (u) => u.username === username && u.password === password && u.status === "active"
        )

        if (!user) return null

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          username: user.username,
          employeeCode: user.employeeCode,
          unitId: user.unitId,
          positionId: user.positionId,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.employeeCode = (user as any).employeeCode
        token.unitId = (user as any).unitId
        token.positionId = (user as any).positionId
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.employeeCode = token.employeeCode as string
        session.user.unitId = token.unitId as string
        session.user.positionId = token.positionId as string
      }
      return session
    },
  },
})
