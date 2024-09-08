import { Sequelize, DataTypes, Op, fn, col } from "sequelize";
import config from "../../../config.json";
import { initUserModel } from "./user";

interface Models {
  user: ReturnType<typeof initUserModel>;
}

export function initDB(): {
  models: Models;
  sequelize: Sequelize;
  Op: typeof Op;
  fn: typeof fn;
  col: typeof col;
} {
  const sequelize = new Sequelize(
    config.database.postgres.dbName,
    config.database.postgres.dbUser,
    config.database.postgres.dbPassword,
    {
      host: config.database.postgres.host,
      port: config.database.postgres.port || 5432, // Default port for PostgreSQL
      dialect: "postgres",
      logging: config.database.postgres.logging,
      pool: {
        max: config.database.postgres.pool.max,
        min: config.database.postgres.pool.min,
        acquire: config.database.postgres.pool.acquire,
      },
    }
  );

  const user = initUserModel(sequelize);

  return {
    models: {
      user,
    },
    sequelize,
    Op,
    fn,
    col,
  };
}
