import { useState } from "react";

export default function Code() {
  const [userRequest, setUserRequest] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
      setGeneratedCode("");
      setLoading(true);

      if (!userRequest) {
        alert("Please provide prompt request.");
        return;
      }

      const response = await fetch("/api/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRequest }),
      });

      const data = await response.json();

      if (data.output) {
        setGeneratedCode(data.output);
      } else {
        setGeneratedCode("Error." + data.error);
      }
    } catch (e: any) {
      console.log("Unexpected error.", e);
      setGeneratedCode("Error." + e?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-4">
      <h1>Move Agent Kit Code Generator</h1>
      <br></br>
      <form onSubmit={handleSubmit}>
        <textarea
          value={userRequest}
          onChange={(e) => setUserRequest(e.target.value)}
          placeholder="Enter your prompt"
          className="bg-red-600 ml-20"
          rows={3}
          cols={50}
        />
        <br></br>
        <br></br>
        <button
          type="submit"
          disabled={loading}
          className="ml-20 bg-indigo-600 text-white px-4 py-2 ml-20"
        >
          {loading ? "Generating..." : "Generate Code"}
        </button>
      </form>
      <br></br>
      {generatedCode && (
        <div>
          <h2>Generated Code:</h2>
          <pre>{generatedCode}</pre>
        </div>
      )}
      <br></br>
    </div>
  );
}
