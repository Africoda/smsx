import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import db from "@/db";
import { users } from "@/db/schema/schema";

const Auth = {
  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
    }).returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return user;
  },

  async login(email: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),

    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  },

  async getUser(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },
};

export default Auth;
