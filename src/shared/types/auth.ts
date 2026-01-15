export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

export interface Session {
  user?: SessionUser | null;
  [key: string]: any;
}
