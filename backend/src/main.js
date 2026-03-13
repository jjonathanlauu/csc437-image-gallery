import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "../../shared/example.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ImageProvider } from "./ImageProvider.js";
import { registerImageRoutes } from "./routes/imageRoutes.js";
import { CredentialsProvider } from "./CredentialsProvider.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { verifyAuthToken } from "./routes/verifyAuthToken.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";

const mongoClient = connectMongo();
await mongoClient.connect();

const imageProvider = new ImageProvider(mongoClient);
const credsProvider = new CredentialsProvider(mongoClient);

const app = express();

app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(getEnvVar("IMAGE_UPLOAD_DIR")));
app.use(express.json());

function waitDuration(numMs) {
  return new Promise((resolve) => setTimeout(resolve, numMs));
}

app.get("/api/hello", (req, res) => {
  res.send("Hello, World " + SHARED_TEST);
});

registerAuthRoutes(app, credsProvider);
app.use("/api/images", verifyAuthToken);
registerImageRoutes(app, imageProvider);

app.get(Object.values(VALID_ROUTES), (req, res) => {
  res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}. CTRL+C to stop.`);
});
