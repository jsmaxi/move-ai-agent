import { Tool } from "langchain/tools";
import { AgentRuntime, parseJson } from "move-agent-kit";

class TokenTransferTool extends Tool {
  name = "aptos_transfer_token";
  description = `"
this tool can be used to transfer APT, any token or fungible asset to a recipient

  if you want to transfer APT, mint will be "0x1::aptos_coin::AptosCoin"
  if you want to transfer token other than APT, you need to provide the mint of that specific token
  if you want to transfer fungible asset, add fungible asset address as mint

  keep to blank if user themselves wants to receive the token and not send to anybody else

  Inputs ( input is a JSON string ):
  to: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (optional)
  amount: number, eg 1 or 0.01 (required)
  mint: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" 
  or "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)"`;

  constructor(agent) {
    super();
  }

  async _call(args) {
    const parsedInput = parseJson(input);
    // Implement token transfer logic
    // ...
    return JSON.stringify({ data: "Transfer Completed" });
  }
}
