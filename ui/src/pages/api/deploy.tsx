import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import { execSync } from "child_process";

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

    if (!checkAptosInitialized(tempDir)) {
      console.log("aptos not initialized");
      // Step 1: Run `aptos init`
      console.log("Running `aptos init`...");
      await runCommand(
        "aptos",
        ["init", "--profile", "default", "--network", "devnet"],
        tempDir
      );
    } else {
      console.log("aptos already initialized");
    }

    // Step 2: Run `aptos move deploy`
    console.log("Running `aptos move deploy`...");
    const deployOutput = await runCommand(
      "aptos",
      ["move", "deploy", "--package-dir", tempDir],
      tempDir
    );

    // Return the deployment output
    res.status(200).json({ output: deployOutput });
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

/**
 * Helper function to run a command using `spawn` and return its output.
 */
async function runCommand(command: string, args: Array<string>, cwd: string) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd });

    let stdout = "";
    let stderr = "";
    let stdall = "";

    // Capture stdout
    child.stdout.on("data", (data) => {
      stdout += data.toString();
      stdall += data.toString();

      console.log(`stdout (${command}):`, data.toString());

      // Check for prompts and automatically respond with newline
      if (data.includes("Do you want to submit a transaction")) {
        // Send yes
        console.log("send yes");
        child.stdin.write("yes\n");
      }
    });

    // Capture stderr
    child.stderr.on("data", (data) => {
      stderr += data.toString();
      stdall += data.toString();

      console.error(`stderr (${command}):`, data.toString());

      // Check for prompts and automatically respond with newline
      if (data.includes("private key")) {
        // Send a newline character to accept default option (generate new)
        child.stdin.write("\n");
      }
    });

    // Handle command completion
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdall); // Command succeeded
      } else {
        reject(
          new Error(
            `Command '${command}' failed with code ${code}. Outout: ${stdall}`
          )
        );
      }
    });

    // Handle command start errors
    child.on("error", (error) => {
      reject(
        new Error(`Failed to start command '${command}': ${error.message}`)
      );
    });
  });
}

function checkAptosInitialized(directory: string) {
  try {
    // Run a simple Aptos command that requires initialization
    execSync("aptos config show-profiles", { cwd: directory, stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
}
