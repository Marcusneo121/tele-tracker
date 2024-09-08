import { Context } from "grammy";
import { initDB } from "../../shared/models/init-db";
import { handleErrorMessageBot } from "./util_helper";
import { UserContext, UserTeleData } from "../interfaces/index";
const { models, sequelize } = initDB();

// Initialize user context
const user_context: UserContext = {};

export async function initializeUser(
  ctx: Context
): Promise<[UserContext[string] | null, any]> {
  const transaction = await sequelize.transaction();
  try {
    const user_telegram_data: UserTeleData = ctx.from!;

    if (!user_telegram_data) {
      await handleErrorMessageBot(ctx, "User not found. Please try again.");
      return [null, "User not found. Please try again"];
    }

    let _user = await models.user.findOne({
      where: { user_telegram_id: ctx.from?.id.toString() },
    });

    // initialize the user context
    if (!user_context[user_telegram_data.id.toString()]) {
      user_context[user_telegram_data.id.toString()] = {};
    }

    user_context[user_telegram_data.id.toString()].user = _user;

    return [user_context[user_telegram_data.id.toString()], null];
  } catch (error: any) {
    await transaction.rollback();
    await handleErrorMessageBot(ctx, error);
    return [null, error];
  }
}

// Export the user context and utility functions
export { user_context };
