# Move AI Agent

## Quick Start

Run:

```
cd ui
npm install
npm run dev
```

Open: http://localhost:3000/

---

## Move Agent Kit

Package:

https://www.npmjs.com/package/move-agent-kit

Docs:

https://metamove.gitbook.io/move-agent-kit

---

## Contract Example:

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

---
