import path from "path";
import { Menu } from "@grammyjs/menu";
import { Bot, Api, InputFile, Keyboard, InlineKeyboard, Context } from "grammy";
import { initializeUser, user_context } from "../../shared/helpers/bot_user_helper";
import { Menus, SetupMenus, MenuItem} from "../../shared/interfaces/index";
const logo_path = path.join(__dirname, "../../../assets/logo.png");

export function setupMenu(menus: Menus, bot: Bot, api: Api): SetupMenus {
  const AddExpense: MenuItem = {
    text: "💸 Add Expense",
    action: async (ctx) => {
      await ctx.reply("Add Expense Button Pressed!");
    },
  };
  const AddIncome: MenuItem = {
    text: "💰 Add Income",
    action: async (ctx) => {
      await ctx.reply("Add Income Button Pressed!");
    },
  };
  async function showMenu(ctx: Context): Promise<void> {
    if (!user_context[ctx.from!.id.toString()]) {
      await initializeUser(ctx);
    }

    console.log("User context : ", user_context[ctx.from!.id.toString()]);

    const username = `${ctx.message?.from.first_name ?? ""} ${
      ctx.message?.from.last_name ?? ""
    }`;
    const message = `
<b>🤗 Hi ${username}! Welcome to Expense Tracker Bot</b>

We can help you track you expenses and give you an overlook of you spending.

We are in MVP mode. So we only allow adding expense and income feature. More features coming soon.
    `;

    await ctx.replyWithPhoto(new InputFile(logo_path), {
      caption: message,
      parse_mode: "HTML",
      reply_markup: home,
    });
  }

  const home = new Menu("home")
    .text(AddExpense.text, AddExpense.action)
    .text(AddIncome.text, AddIncome.action)
    .row();

  bot.use(home);
  return { home, showMenu };
}
