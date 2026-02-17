// next-auth.d.ts
import NextAuth, {
  DefaultSession,
  DefaultUser,
  JWT as DefaultJWT,
} from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: any[];
      profile_photo_url?: string;
    } & DefaultSession["user"];
    accessToken?: string;
    profile_photo_url?: string;
  }
  interface User extends DefaultUser {
    id: string;
    roles: any[];
    accessToken?: string;
    profile_photo_url?: string;
  }
  interface JWT extends DefaultJWT {
    roles: any[];
    accessToken?: string;
    profile_photo_url?: string;
  }
}
