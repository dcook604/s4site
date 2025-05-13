import 'next-auth';

declare module 'next-auth' {
  /**
   * Extend the Session interface with custom properties
   */
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string;
      role?: string;
    };
  }

  /**
   * Extend the User interface with custom properties
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the JWT interface with custom properties
   */
  interface JWT {
    id?: string;
    role?: string;
  }
} 