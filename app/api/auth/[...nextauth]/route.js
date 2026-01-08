import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import connectDB from "@/app/lib/db";
import User from "@/app/model/User";
import CustomerAccount from "@/app/model/CustomerAccount";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailId: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },

      async authorize(credentials) {
        await connectDB();

        const loginInput = credentials.emailId?.trim().toLowerCase();

        // Allow login using: emailId, mobileNumber, accountCode
        const user = await User.findOne({
          $or: [
            { emailId: { $regex: `^${loginInput}$`, $options: "i" } },
            { mobileNumber: { $regex: `^${loginInput}$`, $options: "i" } },
            { accountCode: { $regex: `^${loginInput}$`, $options: "i" } }
          ]
        });

        if (!user) throw new Error("UserNotRegistered");

        // TEMP: password check (replace later with bcrypt)
        const valid = credentials.password === user.password;
        if (!valid) throw new Error("InvalidCredentials");

        return {
          id: user._id.toString(),
          email: user.emailId,        // **always email for NextAuth**
          name: user.fullName,
          status: user.status,
          accountCode: user.accountCode,
          rememberMe:
            credentials.rememberMe === "on" ||
            credentials.rememberMe === true,
        };
      },
    })
  ],

  callbacks: {
    // --------------------------
    // SIGN IN (Google + Credentials)
    // --------------------------
    async signIn({ user, account }) {
      await connectDB();

      if (account.provider === "google") {
        const exists = await User.findOne({ emailId: user.email });

        if (!exists) throw new Error("UserNotRegistered");
      }

      return true;
    },

    // --------------------------
    // JWT TOKEN CREATION
    // --------------------------
    async jwt({ token, user }) {
      await connectDB();

      // First time login
      if (user) {
        const dbUser = await User.findOne({ emailId: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.email = dbUser.emailId; // Always use DB email
          token.name = dbUser.fullName;
          token.userStatus = dbUser.status;
          token.verified = Boolean(dbUser.verified);

          // User table has accountCode
          if (dbUser.accountCode) {
            token.accountCode = dbUser.accountCode;
          }

          // Remember Me expiration
          token.rememberMe = user.rememberMe;
          token.expiresIn = user.rememberMe
            ? 60 * 60 * 24 * 7   // 7 days
            : 60 * 60 * 24 * 1; // 1 day
        }
      }

      // Add customer account (if exists)
      if (token.email) {
        const customer = await CustomerAccount.findOne({ email: token.email }).lean();

        if (customer) {
          token.accountCode = customer.accountCode; // Overwrite with real customer code
          token.branch = customer.branch;
        }
      }

      return token;
    },

    // --------------------------
    // SESSION OBJECT (Frontend)
    // --------------------------
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        accountCode: token.accountCode || null,
        status: token.userStatus ?? "pending",
        verified: Boolean(token.verified),
        branch: token.branch || null,
      };

      session.expiresIn = token.expiresIn;

      return session;
    }
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // max allowed, but overridden by token.expiresIn
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
