import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
          throw new Error("Admin credentials not configured in environment variables.");
        }

        if (credentials.username === adminUsername && credentials.password === adminPassword) {
          return { id: "admin", name: adminUsername, role: "Admin" };
        }
        
        throw new Error("Invalid username or password");
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/unkown/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development",
};
