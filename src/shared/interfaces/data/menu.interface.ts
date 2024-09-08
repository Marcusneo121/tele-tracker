import { Menu } from "@grammyjs/menu";
import { Context } from "grammy";

export interface Menus {
  [key: string]: Menu;
}

export interface SetupMenus {
  home: Menu;
  showMenu: (ctx: Context) => Promise<void>;
}

export interface MenuItem {
  text: string;
  action: (ctx: Context) => void | Promise<void>;
}
