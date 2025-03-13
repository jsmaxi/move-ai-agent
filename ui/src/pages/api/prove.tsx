import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { moveCode, tomlManifest } = req.body;

  if (!moveCode || !tomlManifest) {
    return res.status(400).json({
      message: "Both contract.Move code and Move.toml manifest are required",
    });
  }

  // Create a temporary directory to store the files
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Create a temporary directory to store the files
  const tempDir2 = path.join(process.cwd(), "temp", "sources");
  if (!fs.existsSync(tempDir2)) {
    fs.mkdirSync(tempDir2);
  }

  try {
    // Save the provided code and manifest to temporary files
    const moveFilePath = path.join(tempDir2, "contract.Move");
    const tomlFilePath = path.join(tempDir, "Move.toml");

    fs.writeFileSync(moveFilePath, moveCode);
    fs.writeFileSync(tomlFilePath, tomlManifest);

    const child = spawn("aptos", ["move", "prove", "--package-dir", tempDir]);

    let stdout = "";
    let stderr = "";
    let stdall = "";

    // Capture stdout
    child.stdout.on("data", (data) => {
      stdout += data.toString();
      stdall += data.toString();
      console.log("stdout:", data.toString());
    });

    // Capture stderr
    child.stderr.on("data", (data) => {
      stderr += data.toString();
      stdall += data.toString();
      console.error("stderr:", data.toString());
    });

    // Wait for the command to finish
    await new Promise((resolve, reject) => {
      child.on("close", (code) => {
        if (code === 0) {
          resolve("Command completed successfully");
        } else {
          reject(
            new Error(`Command failed with code ${code}. Output: ${stdall}`)
          );
        }
      });
    });

    // Return the compilation output
    res.status(200).json({ output: stdall });
  } catch (error: any) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Failed to compile Move code", error: error?.message });
  } finally {
    // Clean up: Delete the temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}
