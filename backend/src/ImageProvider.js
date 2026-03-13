import { getEnvVar } from "./getEnvVar.js";
import { ObjectId } from "mongodb";

export class ImageProvider {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;

    const collectionName = getEnvVar("IMAGES_COLLECTION_NAME");
    this.collection = this.mongoClient.db().collection(collectionName);
  }

  async getAllImages() {
    const usersCollection = getEnvVar("USERS_COLLECTION_NAME");

    const pipeline = [];

    pipeline.push({
      $lookup: {
        from: usersCollection,
        localField: "authorId",
        foreignField: "username",
        as: "author",
      },
    });

    pipeline.push({
      $unwind: "$author",
    });

    return this.collection.aggregate(pipeline).toArray();
  }

  async getOneImage(imageId) {
    const usersCollection = getEnvVar("USERS_COLLECTION_NAME");

    const pipeline = [];

    pipeline.push({
      $match: {
        _id: new ObjectId(imageId),
      },
    });

    pipeline.push({
      $lookup: {
        from: usersCollection,
        localField: "authorId",
        foreignField: "username",
        as: "author",
      },
    });

    pipeline.push({
      $unwind: "$author",
    });

    const results = await this.collection.aggregate(pipeline).toArray();

    return results[0];
  }

  async createImage({ src, name, authorId }) {
    const result = await this.collection.insertOne({
      src,
      name,
      authorId,
    });

    return result.insertedId.toString();
  }

  async updateImageName(imageId, newName) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(imageId) },
      { $set: { name: newName } },
    );

    return result.matchedCount;
  }
}
