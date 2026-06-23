import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      username: string
      employeeCode: string
      unitId: string
      positionId: string
    }
  }

  interface User {
    username: string
    employeeCode: string
    unitId: string
    positionId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    employeeCode: string
    unitId: string
    positionId: string
  }
}
