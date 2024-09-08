import crypto from "crypto";
import moment from "moment/moment";
import { Context } from "grammy";
import { UserAttributes } from "../interfaces/model/user.model.interface";

interface CustomError extends Error {
  message: string;
}

// Function to get current epoch time in seconds
export function getCurrentEpochTime(): number {
  const unix_epoch = moment().utc().unix();
  return unix_epoch;
}

// Function to generate a SHA3-512 hash for user login
export function loginHash(user: UserAttributes): string {
  const sha512 = crypto.createHash("sha3-512");
  sha512.update("!EXPENSE TRACKER! USER START APP !EXPENSE TRACKER!");
  sha512.update(user.first_last_name.toString());
  sha512.update(user.user_telegram_id.toString());
  sha512.update(user.referral_code.toString());
  sha512.update(user.id.toString());
  return sha512.digest("hex");
}

// Function to handle errors and send messages to the bot
export const handleErrorMessageBot = async (
  ctx: Context,
  error: any
): Promise<void> => {
  const error_message =
    error.message || "Something went wrong, please contact support";
  console.error({
    user_id: ctx.from?.id,
    error: error.message,
  });
  await ctx.reply(error_message, { parse_mode: "HTML" });
};

// Function to handle errors for the API
export async function handleErrorMessageAPI(
  user_id: string,
  error: CustomError
): Promise<string> {
  const error_message =
    error.message || "Something went wrong, please try again.";
  console.error({
    user_id: user_id,
    error: error.message,
  });
  return error_message;
}

// Function to parse the referral code from a message
export function parseReferralCode(text: string): string | null {
  if (!text) {
    return null;
  }

  const parts = text.split(" ");
  if (parts.length > 1) {
    const referral_code = parts[1].match(/ref-([^_]+)/);
    return referral_code ? referral_code[1] : null;
  }
  return null;
}

// Function to check for referral code in the message context
export function gotReferralChecker(ctx: Context): {
  got_referral: boolean;
  referral_code: string | null;
} {
  const referral_code = parseReferralCode(ctx.msg?.text || "");
  return {
    got_referral: referral_code !== null,
    referral_code: referral_code,
  };
}
