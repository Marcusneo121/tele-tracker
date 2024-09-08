import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import http from "http";
import config from "../../config.json";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import rateLimit from "express-rate-limit";

const app = express();
const port = config.port;

// Set rate limiter
const rateLimiter = rateLimit({
  windowMs: config.rate_limit_window_in_min * 60 * 1000, // e.g., 15 minutes
  max: 500,
  handler: (req: Request, res: Response, next: NextFunction) => {
    res.status(429).json({
      error: true,
      status: 429,
      message: "Too many requests, please try again later.",
      data: {},
    });
  },
});

app.set("port", port);
// Trust local proxy and Cloudflare
// app.set("trust proxy", 2);
app.use(passport.initialize());
app.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: false,
  })
);
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);

server.listen(port);
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
  console.log(`Server Running ->>> Listening on ${bind}`);
});

app.get("/healthcheck", (req: Request, res: Response) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  try {
    return res.status(200).send(healthcheck);
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).send({ message: "Service Unavailable" });
  }
});

// import tokenStrategy from "../shared/helpers/passport/jwt";
import userController from "../api/controllers/user";
// Use controllers
app.use("/user", userController);

// 404 handler middleware for all unavailable routes
app.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    "data": {},
    "status": 404,
    "msg": "Resource not found. Please try again",
    "error": true,
  });
});
