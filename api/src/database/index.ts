import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { DATABASE_URL, NODE_ENV } from "../utils/constants";

const db = drizzle(DATABASE_URL!, { schema, logger: NODE_ENV === "development" });

export default db;
