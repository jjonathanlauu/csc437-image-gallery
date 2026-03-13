import express from "express";
import { ObjectId } from "mongodb";

import {
  imageMiddlewareFactory,
  handleImageFileErrors,
} from "../imageUploadMiddleware.js";

export function registerImageRoutes(app, imageProvider) {
  app.get("/api/images", async (req, res) => {
    const images = await imageProvider.getAllImages();
    res.json(images);
  });

  app.get("/api/images/:id", async (req, res) => {
    const imageId = req.params.id;

    if (!ObjectId.isValid(imageId)) {
      return res.status(404).send({
        error: "Not Found",
        message: "No image with that ID",
      });
    }

    const image = await imageProvider.getOneImage(imageId);

    if (!image) {
      return res.status(404).send({
        error: "Not Found",
        message: "No image with that ID",
      });
    }

    res.send(image);
  });

  app.post(
    "/api/images",
    imageMiddlewareFactory.single("image"),
    handleImageFileErrors,
    async (req, res) => {
      const uploadedFile = req.file;
      const submittedName = req.body?.name;

      if (!uploadedFile || !submittedName) {
        return res.status(400).send({
          error: "Bad Request",
          message: "Image file and name are required",
        });
      }

      const id = await imageProvider.createImage({
        src: `/uploads/${uploadedFile.filename}`,
        name: submittedName,
        authorId: req.userInfo.username,
      });

      res.status(201).json({ id });
    },
  );

  app.patch("/api/images/:id", async (req, res) => {
    const imageId = req.params.id;
    const newName = req.body?.name;

    const MAX_NAME_LENGTH = 100;

    if (!ObjectId.isValid(imageId)) {
      return res.status(404).send({
        error: "Not Found",
        message: "Image does not exist",
      });
    }

    if (!newName || typeof newName !== "string") {
      return res.status(400).send({
        error: "Bad Request",
        message: "Image name must be provided",
      });
    }

    if (newName.length > MAX_NAME_LENGTH) {
      return res.status(422).send({
        error: "Unprocessable Entity",
        message: `Image name exceeds ${MAX_NAME_LENGTH} characters`,
      });
    }

    const image = await imageProvider.getOneImage(imageId);

    if (!image) {
      return res.status(404).send({
        error: "Not Found",
        message: "Image does not exist",
      });
    }

    const loggedUser = req.userInfo.username;

    if (image.author.username !== loggedUser) {
      return res.status(403).send({
        error: "Forbidden",
        message: "This user does not own this image",
      });
    }

    const matchedCount = await imageProvider.updateImageName(imageId, newName);

    if (matchedCount === 0) {
      return res.status(404).send({
        error: "Not Found",
        message: "Image does not exist",
      });
    }

    res.status(204).send();
  });
}
