import { useState } from "react";

export default function Home() {
  const [moveCode, setMoveCode] = useState("");
  const [tomlManifest, setTomlManifest] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (!moveCode || !tomlManifest) {
      alert("Please provide both contract.Move code and Move.toml manifest.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moveCode, tomlManifest }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.output);
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="my-4">Compile Move Code with Aptos CLI</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="moveCode" className="mr-4">
            contract.Move Code:
          </label>
          <textarea
            id="moveCode"
            className="bg-green-600"
            value={moveCode}
            onChange={(e) => setMoveCode(e.target.value)}
            rows={10}
            cols={50}
            placeholder="Paste your contract.Move code here"
            required
          />
        </div>
        <div className="mt-4">
          <label htmlFor="tomlManifest" className="mr-4">
            Move.toml Manifest:
          </label>
          <textarea
            id="tomlManifest"
            className="bg-blue-600 ml-1"
            value={tomlManifest}
            onChange={(e) => setTomlManifest(e.target.value)}
            rows={5}
            cols={50}
            placeholder="Paste your Move.toml manifest here"
            required
          />
        </div>
        <br />
        <div className="flex justify-start">
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 ml-20"
          >
            {loading ? "Compiling..." : "Compile"}
          </button>
        </div>
      </form>

      {output && (
        <div>
          <h2>Compilation Output:</h2>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}
