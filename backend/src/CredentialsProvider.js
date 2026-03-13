import { getEnvVar } from "./getEnvVar.js";
import bcrypt from "bcrypt";

export class CredentialsProvider {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;

    const credsCollection = getEnvVar("CREDS_COLLECTION_NAME");
    const usersCollection = getEnvVar("USERS_COLLECTION_NAME");

    this.creds = this.mongoClient.db().collection(credsCollection);
    this.users = this.mongoClient.db().collection(usersCollection);
  }

  async registerUser(username, email, password) {
    const existing = await this.creds.findOne({ username });

    if (existing) {
      return false;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await this.creds.insertOne({
      username,
      password: hash,
    });

    await this.users.insertOne({
      username,
      email,
    });

    return true;
  }

  async verifyPassword(username, password) {
    const user = await this.creds.findOne({ username });

    if (!user) {
      return false;
    }

    return await bcrypt.compare(password, user.password);
  }
}
