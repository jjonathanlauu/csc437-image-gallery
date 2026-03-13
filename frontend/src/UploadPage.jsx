import { useState } from "react";
import { useNavigate } from "react-router-dom";

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

export function UploadPage({ authToken }) {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const f = e.target.files[0];
    setFile(f);

    if (!f) return;

    const url = await readAsDataURL(f);
    setPreview(url);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setPending(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", name);

      const res = await fetch("/api/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      navigate(`/gallery/${data.id}`);
    } catch (err) {
      setError(err.message);
      setPreview("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="fileInput">Choose image:</label>
        <input
          id="fileInput"
          type="file"
          name="image"
          accept=".png,.jpg,.jpeg"
          required
          disabled={pending}
          onChange={handleFileChange}
        />
      </div>

      <div>
        <label>Image title:</label>
        <input
          required
          disabled={pending}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {preview && (
        <img src={preview} alt="" style={{ width: "20em", maxWidth: "100%" }} />
      )}

      <button disabled={pending}>
        {pending ? "Uploading..." : "Confirm upload"}
      </button>

      {error && <p>{error}</p>}
    </form>
  );
}
