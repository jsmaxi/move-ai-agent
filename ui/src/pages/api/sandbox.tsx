import { NextApiRequest, NextApiResponse } from "next";
import { getParameters } from "codesandbox/lib/api/define";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { agent, packagejson } = req.body;

  if (!agent || !packagejson) {
    return res.status(400).json({
      message: "Both agent.ts code and package.json code are required",
    });
  }

  try {
    const parameters = getParameters({
      files: {
        "agent.ts": {
          content: agent,
          isBinary: false,
        },
        "package.json": {
          content: packagejson,
          isBinary: false,
        },
      },
    });

    res.status(200).json({
      url: `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`,
    });
  } catch (error: any) {
    console.error("Sandbox Error.", error);
    res.status(500).json({ message: "Sandbox error", error: error?.message });
  }
}
