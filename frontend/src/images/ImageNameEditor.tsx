import { useState } from "react";

type Props = {
  imageId: string;
  initialValue: string;
  onRename: (newName: string) => void;
};

export function ImageNameEditor({ imageId, initialValue, onRename }: Props) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(initialValue || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleEditPressed() {
    setIsEditingName(true);
    setNameInput(initialValue || "");
    setError("");
  }

  async function handleSubmitPressed() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/images/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      onRename(nameInput);

      setIsEditingName(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name
          <input
            disabled={loading}
            style={{ marginLeft: "0.5em" }}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
        </label>

        <button
          disabled={loading || nameInput.length === 0}
          onClick={handleSubmitPressed}
        >
          Submit
        </button>

        <button onClick={() => setIsEditingName(false)}>Cancel</button>

        <div aria-live="polite">
          {loading && <p>Renaming image...</p>}
          {error && <p>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: "1em 0" }}>
      <button onClick={handleEditPressed}>Edit name</button>
    </div>
  );
}
