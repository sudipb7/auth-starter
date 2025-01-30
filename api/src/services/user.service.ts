import { eq } from "drizzle-orm";

import db from "../database";
import { getZodError } from "../utils/zod";
import { users, userSchema, UserSchema } from "../database/schema";

export default class UserService {
  public async findUserById(id: string) {
    const user = (await db.select().from(users).where(eq(users.id, id)))[0];
    console.log("findUserById", user);
    return user;
  }

  public async findUserByEmail(email: string) {
    const user = (await db.select().from(users).where(eq(users.email, email)))[0];
    console.log("findUserByEmail", user);
    return user;
  }

  public async createUser(data: UserSchema) {
    const validated = userSchema.safeParse(data);
    if (!validated.success) {
      throw new Error(getZodError(validated.error));
    }

    if (validated.data.mode === "update" || validated.data.mode === "emailSignIn") {
      throw new Error("Invalid Data");
    }

    const values = validated.data;
    console.log("createUser -> Data", values);

    const user = (
      await db
        .insert(users)
        .values({ ...values })
        .returning()
    )[0];
    if (!user) {
      throw new Error("Failed to create user");
    }

    console.log("createUser -> User", user);

    return user;
  }

  public async updateUserById(data: UserSchema) {
    const validated = userSchema.safeParse(data);
    if (!validated.success) {
      throw new Error(getZodError(validated.error));
    }

    if (validated.data.mode !== "update") {
      throw new Error("Invalid Data");
    }

    const values = validated.data;

    console.log("updateUserById -> Data", values);

    const user = (
      await db
        .update(users)
        .set({
          name: values.name,
          image: values.image,
          updatedAt: new Date(),
        })
        .where(eq(users.id, values.id))
        .returning()
    )[0];

    if (!user) {
      throw new Error("Failed to update user");
    }

    console.log("updateUserById -> User", user);

    return user;
  }

  public async deleteUserById(id: string) {
    await db.delete(users).where(eq(users.id, id));
  }
}
