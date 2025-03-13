import { useState } from "react";

export default function Home() {
  const [moveCode, setMoveCode] = useState("");
  const [tomlManifest, setTomlManifest] = useState("");
  const [promptText, setPromptText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (action: string) => {
    setLoading(true);
    setOutput("");

    if (!moveCode || !tomlManifest) {
      alert("Please provide both contract.Move code and Move.toml manifest.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(action, {
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

  const handleRAG = async (action: string) => {
    setLoading(true);
    setOutput("");

    if (!promptText) {
      alert("Please provide prompt text.");
      setLoading(false);
      return;
    }

    const query = promptText;

    try {
      const response = await fetch(action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
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
      <form>
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
          />
        </div>
        <br />
        <div className="flex justify-start">
          <button
            disabled={loading}
            onClick={() => handleSubmit("/api/compile")}
            className="bg-gray-600 text-white px-4 py-2 ml-20"
          >
            {loading ? "Loading..." : "Compile"}
          </button>
          <button
            disabled={loading}
            onClick={() => handleSubmit("/api/prove")}
            className="bg-indigo-600 text-white px-4 py-2 ml-20"
          >
            {loading ? "Loading..." : "Prove"}
          </button>
          <button
            disabled={loading}
            onClick={() => handleSubmit("/api/deploy")}
            className="bg-red-600 text-white px-4 py-2 ml-20"
          >
            {loading ? "Loading..." : "Deploy"}
          </button>
        </div>
        <br />
        <div className="mt-4">
          <label htmlFor="prompt" className="mr-4">
            AI Prompt:
          </label>
          <textarea
            id="prompt"
            className="bg-blue-600 ml-1"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={3}
            cols={50}
            placeholder="Enter your prompt here"
          />
        </div>
        <br />
        <div className="flex justify-start">
          <button
            disabled={loading}
            onClick={() => handleRAG("/api/llmrag")}
            className="bg-orange-600 text-white px-4 py-2 ml-20"
          >
            {loading ? "Loading..." : "RAG CodeGen"}
          </button>
        </div>
      </form>

      {output && (
        <div>
          <h2>Command Output:</h2>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}
