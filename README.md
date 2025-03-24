![alt text](image.png)

# 🧪 Aptos PlayLab: AI-Powered IDE for Move Smart Contracts

UI: https://move-ai-agent-production.up.railway.app/

<img src="./images/playlablogo.png" alt="project logo" width="100" height="100"/>

**Aptos PlayLab** is an interactive development environment for experimenting with Move smart contracts on the **Aptos** network. With built-in AI assistance, you can write, audit, compile, and deploy Move contracts — all from a single interface.

This project is designed to streamline development and push the boundaries of autonomous agent-based tooling. This could also act as a learning tool for Move Smart Contract Development.

> ⚠️ Many components are **proof-of-concept** and under active development. Expect bugs, experimental features, and a growing playground for innovation!

## 🚀 What Aptos PlayLab Can Do

- 🤖 **AI agent to generate Aptos smart contracts** in Move
- 🧠 **AI agent to generate LangChain JS / LangGraph agent code** using the Move Agent Kit
  - Agent creating agents — like **Von Neumann factories** for on-chain AI
- 📚 **RAG-powered chat with Aptos documentation**
- 📚 **RAG-powered chat with Move Agent Kit documentation and codebase**
- ⚙️ **Compile and deploy generated smart contracts** to the Aptos network
- 🧾 **Run the Move Prover** for formal verification of smart contracts
- 🔐 **Basic AI-assisted smart contract security audit** (early-stage)

## Quick Start - Run it locally

Run:

```
cd ui
npm install
npm run dev
```

Open: http://localhost:3000/

Setup environment variables by .env.example

Also, to interact with the contracts locally, install and setup aptos-cli tool. Then run (inside ui folder):

```
aptos init
```

## Move Agent Kit

Package:

https://www.npmjs.com/package/move-agent-kit

Docs:

https://metamove.gitbook.io/move-agent-kit

## Contract Actions Example

Install Aptos CLI: https://aptos.dev/en/build/cli

Install prover (aptos update prover-dependencies): https://aptos.dev/en/build/cli/setup-cli/install-move-prover

On Windows 11, for example, prover dependencies boogie.exe and z3.exe are located here:

C:\Users\{USER}\.aptoscli\bin

```
export BOOGIE_EXE=C:\Users\{USER}\.aptoscli\bin\boogie.exe
export Z3_EXE=C:\Users\{USER}\.aptoscli\bin\z3.exe
```

Edit C:\Users\{USER}\.aptos\global_config.yaml with prover config:

```
move_prover:
  boogie_path: "C:\\Users\\{USER}\\.aptoscli\\bin\\boogie.exe"
  z3_path: "C:\\Users\\{USER}\\.aptoscli\\bin\\z3.exe"
```

Run:

```
cd example
aptos move compile
aptos move prove
aptos init
aptos move deploy
```

[Output Example](OUTPUT.md)

## Online Code Sandbox

```
npm install codesandbox
```

https://codesandbox.io/docs/learn/sandboxes/cli-api#define-api
