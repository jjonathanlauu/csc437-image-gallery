import { useState, useEffect } from "react";
import { ImageGrid } from "./ImageGrid.jsx";

export function AllImages({ authToken }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authToken) {
      return; // don't fetch if not logged in
    }

    async function fetchImages() {
      try {
        setLoading(true);

        const response = await fetch("/api/images", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load images");
        }

        const data = await response.json();
        setImages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [authToken]);

  if (!authToken) {
    return <p>Not logged in</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <h2>All Images</h2>
      <ImageGrid images={images} />
    </>
  );
}
