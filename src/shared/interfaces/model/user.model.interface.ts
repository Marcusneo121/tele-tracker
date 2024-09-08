export interface UserAttributes {
  id: number;
  hash_id?: string | null;
  group_tag?: string | null;
  referral_user_id?: number | null;
  referral_code: string;
  user_telegram_id: string;
  is_premium?: boolean | null;
  username?: string;
  first_last_name: string;
  jwt_token?: string | null;
  created_at?: number | null;
  updated_at?: number | null;
  is_delete: boolean;
}
