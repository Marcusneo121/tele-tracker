import { Api, Context } from "grammy";
import {
  gotReferralChecker,
  getCurrentEpochTime,
} from "../helpers/util_helper";
// import {
//   referralCodeGenerator,
//   buildReferralTag,
//   generateHashId,
// } from "../helpers/referral_helper";
import { initDB } from "../../shared/models/init-db";
import { Transaction } from "sequelize";
import { UserAttributes } from "../interfaces/model/user.model.interface";
const { models, sequelize } = initDB();
import config from "../../../config.json";
import {
  generateHashId,
  buildReferralTag,
  referralCodeGenerator,
} from "../helpers/referral_helper";
const api = new Api(config.telegram_token);

interface ChatMember {
  user: {
    id: number;
    is_premium: boolean;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export async function getOrCreateUserByCtx(
  ctx: Context,
  transaction: Transaction
): Promise<UserAttributes | null> {
  const referral_check = gotReferralChecker(ctx);
  let group_tag: string | null = null;
  let referring_user: UserAttributes | null = null;

  // Find or Create User
  const [user, isUserCreated] = await models.user.findOrCreate({
    where: {
      user_telegram_id: ctx.from?.id.toString(),
    },
    defaults: {
      referral_code: referralCodeGenerator(),
      user_telegram_id: ctx.from?.id.toString() || "",
      is_premium: ctx.from?.is_premium || false,
      username: ctx.from?.username || "",
      first_last_name: `${ctx.from?.first_name || ""} ${
        ctx.from?.last_name || ""
      }`,
      created_at: getCurrentEpochTime(),
      updated_at: getCurrentEpochTime(),
      is_delete: false,
    },
    transaction,
  });

  if (isUserCreated) {
    const gen_hash_id = generateHashId(user.id);
    if (referral_check.referral_code) {
      referring_user = await models.user.findOne({
        where: { referral_code: referral_check.referral_code },
        transaction,
      });
      group_tag = buildReferralTag(
        gen_hash_id,
        referring_user?.group_tag || null
      );
    } else {
      group_tag = buildReferralTag(gen_hash_id, null);
    }

    console.log("After create user : ", user);

    const locker_user = await models.user.findByPk(user.id, {
      transaction,
      lock: Transaction.LOCK.UPDATE,
    });

    if (locker_user) {
      const gen_hash_id = generateHashId(locker_user.id);
      await locker_user.update(
        {
          hash_id: gen_hash_id,
          group_tag,
          referral_user_id: referring_user ? referring_user.id : null,
        },
        { transaction }
      );
    }

    console.log("Before referral update before reload : ", user);

    // to get the latest user data after updating
    await user.reload({ transaction });

    console.log("After referral update before reload : ", user);
  }

  if (user.is_delete) {
    // Shadow copy
    const old_user_telegram_id = user.user_telegram_id;
    const old_user_telegram_username = user.username;
    const old_user_telegram_first_last_name = user.first_last_name;
    const old_user_telegram_is_premium = user.is_premium;

    // Shadow delete the user before creating new user
    await user.update(
      {
        user_telegram_id: `${old_user_telegram_id}_d_${getCurrentEpochTime()}`,
        is_delete: true,
        updated_at: getCurrentEpochTime(),
      },
      { transaction }
    );

    const newUser = await models.user.create(
      {
        user_telegram_id: old_user_telegram_id,
        username: old_user_telegram_username || "",
        first_last_name: old_user_telegram_first_last_name || "",
        referral_code: referralCodeGenerator(),
        is_premium: old_user_telegram_is_premium || false,
        referral_user_id: null,
        created_at: getCurrentEpochTime(),
        updated_at: getCurrentEpochTime(),
      },
      { transaction }
    );

    const gen_hash_id = generateHashId(newUser.id);
    // await newUser.update(
    //   { hash_id: gen_hash_id, group_tag: buildReferralTag(gen_hash_id, null) },
    //   { lock: transaction.LOCK.UPDATE, transaction }
    // );

    // get again user latest data
    return await models.user.findOne({
      where: {
        user_telegram_id: old_user_telegram_id.toString(),
        is_delete: false,
      },
      transaction,
    });
  }

  return user;
}

export async function getOrCreateUserByTelegramID(
  user_telegram_id: string,
  transaction: Transaction
): Promise<UserAttributes | null> {
  const user_data = (await api.getChatMember(
    Number(user_telegram_id),
    Number(user_telegram_id)
  )) as ChatMember;

  if (!user_data?.user) {
    return null;
  }

  // Find or Create User
  const [user, isUserCreated] = await models.user.findOrCreate({
    where: {
      user_telegram_id: user_telegram_id.toString(),
    },
    defaults: {
      referral_code: referralCodeGenerator(),
      user_telegram_id: user_data.user.id.toString(),
      is_premium: user_data.user.is_premium,
      username: user_data.user.username || "",
      first_last_name: `${user_data.user.first_name || ""} ${
        user_data.user.last_name || ""
      }`,
      created_at: getCurrentEpochTime(),
      updated_at: getCurrentEpochTime(),
      is_delete: false,
    },
    transaction,
  });

  if (isUserCreated) {
    // const gen_hash_id = generateHashId(user.id);
    // await user.update(
    //   { hash_id: gen_hash_id, group_tag: buildReferralTag(gen_hash_id, null) },
    //   { lock: transaction.LOCK.UPDATE, transaction }
    // );
    // to get the latest user data after updating
    await user.reload({ transaction });
  }

  if (user.is_delete) {
    // Shadow copy
    const old_user_telegram_id = user.user_telegram_id;
    const old_user_telegram_username = user.username;
    const old_user_telegram_first_last_name = user.first_last_name;
    const old_user_telegram_is_premium = user.is_premium;

    // Shadow delete the user before creating new user
    await user.update(
      {
        user_telegram_id: `${old_user_telegram_id}_d_${getCurrentEpochTime()}`,
        is_delete: true,
        updated_at: getCurrentEpochTime(),
      },
      { transaction }
    );

    const newUser = await models.user.create(
      {
        user_telegram_id: old_user_telegram_id,
        username: old_user_telegram_username || "",
        first_last_name: old_user_telegram_first_last_name || "",
        referral_code: referralCodeGenerator(),
        is_premium: old_user_telegram_is_premium || false,
        referral_user_id: null,
        created_at: getCurrentEpochTime(),
        updated_at: getCurrentEpochTime(),
      },
      { transaction }
    );
    console.log("After create user : ", newUser);

    const locker_user = await models.user.findByPk(newUser.id, {
      transaction,
      lock: Transaction.LOCK.UPDATE,
    });

    if (locker_user) {
      const gen_hash_id = generateHashId(locker_user.id);
      await locker_user.update(
        {
          hash_id: gen_hash_id,
          group_tag: buildReferralTag(gen_hash_id, null),
        },
        { transaction }
      );
    }

    // const gen_hash_id = generateHashId(newUser.id);
    // await newUser.update(
    //   { hash_id: gen_hash_id, group_tag: buildReferralTag(gen_hash_id, null) },
    //   { lock: transaction.LOCK.UPDATE, transaction }
    // );

    // get again user latest data
    return await models.user.findOne({
      where: {
        user_telegram_id: old_user_telegram_id.toString(),
        is_delete: false,
      },
      transaction,
    });
  }

  return user;
}
