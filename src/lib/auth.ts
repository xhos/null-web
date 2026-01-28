import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

export const authPool = new Pool({
  connectionString: process.env.AUTH_DATABASE_URL!,
});

export const auth = betterAuth({
  database: authPool,
  trustedOrigins: ["http://localhost:3001", "http://localhost:5001"],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session data for 5 minutes
    },
  },
  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [jwt()],
  telemetry: { enabled: false },
});
