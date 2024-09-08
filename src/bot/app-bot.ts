import {
  Api,
  Bot,
  CommandContext,
  Context,
  GrammyError,
  HttpError,
} from "grammy";
import { run } from "@grammyjs/runner";
import config from "../../config.json";
import { initDB } from "../shared/models/init-db";
const { models, sequelize } = initDB();
const bot = new Bot(config.telegram_token);
const api = new Api(config.telegram_token);
import { Menus } from "../shared/interfaces/index" 
const menus: Menus = {};
import { setupMenu } from "../bot/menu/home";
const { home, showMenu } = setupMenu(menus, bot, api);

bot.command("start", async (ctx) => {
  await showMenu(ctx);
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

run(bot);
