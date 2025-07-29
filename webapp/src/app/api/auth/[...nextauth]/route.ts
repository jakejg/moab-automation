import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { firestore } from '@/lib/firebase';
import bcrypt from 'bcrypt';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        businessId: { label: 'Business ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { businessId, password } = credentials;

        const businessQuery = await firestore.collection('businesses').where('businessId', '==', businessId).limit(1).get();

        if (businessQuery.empty) {
          return null;
        }

        const business = businessQuery.docs[0].data();

                const passwordMatch = await bcrypt.compare(password, business.password);

        if (passwordMatch) {
          return { id: business.businessId, name: business.businessName };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
