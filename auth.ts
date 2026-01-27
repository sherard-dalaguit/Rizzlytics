import NextAuth from "next-auth"
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, Github],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        const response = await fetch(`http://localhost:3000/api/accounts/provider`, {
          method: 'POST',
          body: JSON.stringify({ providerAccountId: account.providerAccountId }),
        })

        const { data: existingAccount, success } = await response.json();

        if (!success || !existingAccount) return token;

        const userId = existingAccount.userId;

        if (userId) token.sub = userId.toString();
      }

      return token;
    },
    async signIn({ user, profile, account }) {
      if (!account || !user) return false;

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!
      }

      const response = await fetch(`http://localhost:3000/api/auth/signin-with-oauth`, {
        method: 'POST',
        body: JSON.stringify({
          user: userInfo,
          provider: account.provider as 'github' | 'google',
          providerAccountId: account.providerAccountId as string
        })
      })

      const success = await response.json();

      if (!success) return false;

      return success;
    }
  }
})