import { DefaultSession, User as DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      businessId: string;
      businessUrlName: string;
      logoUrl?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    businessId: string;
    businessUrlName: string;
    logoUrl?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: string;
    businessId: string;
    businessUrlName: string;
    logoUrl?: string;
  }
}
