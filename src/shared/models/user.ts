import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import moment from "moment";
import { UserAttributes } from "../interfaces/model/user.model.interface";

//Define an interface for creation attributes
interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "id"
    | "hash_id"
    | "group_tag"
    | "referral_user_id"
    | "is_premium"
    | "username"
    | "jwt_token"
    | "created_at"
    | "updated_at"
    | "is_delete"
  > {}

// Define the User model class
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public hash_id?: string;
  public group_tag?: string;
  public referral_user_id?: number;
  public referral_code!: string;
  public user_telegram_id!: string;
  public is_premium?: boolean;
  public username?: string;
  public first_last_name!: string;
  public jwt_token?: string;
  public created_at?: number; // As epoch time
  public updated_at?: number; // As epoch time
  public is_delete!: boolean;
}

export function initUserModel(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      hash_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      group_tag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referral_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      referral_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      user_telegram_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      is_premium: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      first_last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jwt_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "user",
      timestamps: false,
    }
  );

  // Add hooks to manage timestamp updates
  User.beforeCreate((user) => {
    const now = moment().utc().unix();
    user.created_at = now;
    user.updated_at = now;
  });

  User.beforeUpdate((user) => {
    user.updated_at = moment().utc().unix();
  });

  return User;
}
