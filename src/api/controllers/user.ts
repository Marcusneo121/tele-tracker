import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import moment from "moment";
import passport from "passport";
import config from "../../../config.json";
import { initDB } from "../../shared/models/init-db";
const { models } = initDB();

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await models.user.findAll();
    return res.json({
      data: users,
      status: 200,
      msg: "OK",
      error: false,
    });
  } catch (error) {
    return res.status(400).json({
      data: {},
      status: 400,
      msg: "Something went wrong. Please try again.",
      error: true,
    });
  }
});

export default router;
