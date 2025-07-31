import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { auth as authClient, signInWithEmailAndPassword } from '@/lib/firebase'; // Import client SDK for password verification
import { firestoreAdmin } from '@/lib/firebase-admin'; // Import server-side admin SDK for DB access

const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // NextAuth doesn't directly integrate with Firebase Auth for password checks.
          // NextAuth can't directly verify a Firebase Auth password on the server.
          // The standard pattern is to use the client SDK's `signInWithEmailAndPassword` function.
          // If it succeeds, the user is valid. If it throws an error, the credentials were bad.
          const userCredential = await signInWithEmailAndPassword(
            authClient, // This is the auth instance from the client SDK
            credentials.email,
            credentials.password
          );

          if (userCredential.user) {
            // Find the corresponding business document to get the businessId
            const businessesRef = firestoreAdmin.collection('businesses');
            const snapshot = await businessesRef.where('userId', '==', userCredential.user.uid).limit(1).get();

            if (snapshot.empty) {
              // This case should ideally not happen if registration is done correctly
              return null;
            }

            const businessData = snapshot.docs[0].data();

            return {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              name: businessData.ownerName,
              businessId: businessData.businessId,
            };
          }
          return null;
        } catch (error) {
          // signInWithEmailAndPassword throws an error for invalid credentials
          console.log('Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.businessId = user.businessId;
      }
      return token;
    },
    session({ session, token }) {
      const newSession = { ...session };
      if (token && newSession.user) {
        newSession.user.id = token.id as string;
        newSession.user.businessId = token.businessId as string;
      }
      return newSession;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
