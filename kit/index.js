import "dotenv/config";
import {
  AptosConfig,
  Network,
  Aptos,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import {
  AgentRuntime,
  /*createAptosTools,*/ LocalSigner,
} from "move-agent-kit";

try {
  console.log("Is Mainnet:", process.env.IS_MAINNET);
  console.log("Private Key:", process.env.PRIVATE_KEY);
  console.log("Panora API Key:", process.env.PANORA_API_KEY);
  console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);

  const netw =
    process.env.IS_MAINNET === "true" ? Network.MAINNET : Network.TESTNET;

  console.log("Network.", netw);

  const aptosConfig = new AptosConfig({
    network: netw,
  });

  const aptos = new Aptos(aptosConfig);

  const account = await aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(
      PrivateKey.formatPrivateKey(
        process.env.PRIVATE_KEY,
        PrivateKeyVariants.Ed25519
      )
    ),
  });

  const signer = new LocalSigner(account, netw);

  // const agent = new AgentRuntime(signer, aptos, {
  //   PANORA_API_KEY: process.env.PANORA_API_KEY, // optional
  //   OPENAI_API_KEY: process.env.OPENAI_API_KEY, // optional
  // });
  // const tools = createAptosTools(agent);

  const agent = new AgentRuntime(signer, aptos);

  const balance = await agent.getBalance();

  console.log("Balance.", balance + " APT");

  console.log("Script executed successfully.");
} catch (e) {
  console.error("Error.", e);
}
