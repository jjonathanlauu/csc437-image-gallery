import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ImageNameEditor } from "./ImageNameEditor.jsx";

export function ImageDetails({ authToken }) {
  const { imageId } = useParams();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function doFetch() {
      try {
        const res = await fetch(`/api/images/${imageId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("Not authorized.");
          }
          throw new Error("Failed to fetch image");
        }

        const data = await res.json();
        setImage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    doFetch();
  }, [imageId, authToken]);

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
        authToken={authToken}
        onRename={(newName) => setImage((prev) => ({ ...prev, name: newName }))}
      />

      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </>
  );
}
