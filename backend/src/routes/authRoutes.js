import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

export function registerAuthRoutes(app, credsProvider) {
  app.post("/api/users", async (req, res) => {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).send({
        error: "Bad request",
        message: "Missing username, email, or password",
      });
    }

    const success = await credsProvider.registerUser(username, email, password);

    if (!success) {
      return res.status(409).send({
        error: "Conflict",
        message: "Username already taken",
      });
    }

    const token = await generateAuthToken(username);
    res.status(201).send({ token });
  });

  app.post("/api/auth/tokens", async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).send({
        error: "Bad request",
      });
    }

    const valid = await credsProvider.verifyPassword(username, password);

    if (!valid) {
      return res.status(401).send({
        error: "Unauthorized",
      });
    }

    const token = await generateAuthToken(username);

    res.send({
      token,
    });
  });
}

function generateAuthToken(username) {
  return new Promise((resolve, reject) => {
    const payload = { username };

    jwt.sign(
      payload,
      getEnvVar("JWT_SECRET"),
      { expiresIn: "1d" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      },
    );
  });
}
