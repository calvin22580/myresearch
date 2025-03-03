export interface ClerkUserData {
  id: string;
  email_addresses: {
    email_address: string;
    id: string;
    verification: {
      status: string;
    };
  }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: number;
  updated_at: number;
}

export interface UserSession {
  userId: string | null;
  isSignedIn: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    imageUrl: string | null;
  };
}

export interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  session: UserSession | null;
} 