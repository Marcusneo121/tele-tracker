import { UserAttributes } from "../model/user.model.interface";

export interface UserContext {
  [key: string]: {
    user?: UserAttributes | null;
  };
}

export interface UserTeleData {
  id: number;
  is_bot: boolean;
  is_premium?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}
