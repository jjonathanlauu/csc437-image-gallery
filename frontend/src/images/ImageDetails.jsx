import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ImageNameEditor } from "./ImageNameEditor";

export function ImageDetails() {
  const { imageId } = useParams();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function doFetch() {
      try {
        const res = await fetch(`/api/images/${imageId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch image");
        }

        const data = await res.json();
        setImage(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    doFetch();
  }, [imageId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!image) return <p>Not found</p>;

  return (
    <>
      <h2>{image.name}</h2>
      <p>By {image.author.username}</p>

      <ImageNameEditor
        imageId={image._id}
        initialValue={image.name}
        onRename={(newName) => setImage({ ...image, name: newName })}
      />

      <img src={image.src} alt={image.name} />
    </>
  );
}
