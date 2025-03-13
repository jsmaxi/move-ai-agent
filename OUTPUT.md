init:

```
aptos init
Configuring for profile default
Choose network from [devnet, testnet, mainnet, local, custom | defaults to devnet]
testnet
Enter your private key as a hex literal (0x...) [Current: None | No input: Generate new key (or keep one if present)]

No key given, generating key...

---
Aptos CLI is now set up for account 0x... as profile default!
---

The account has not been created on chain yet. To create the account and get APT on testnet you must visit https://aptos.dev/network/faucet?address=0x...
Press [Enter] to go there now >
{
  "Result": "Success"
}
```

compile:

```
aptos move compile
Compiling, may take a little while to download git dependencies...
UPDATING GIT DEPENDENCY https://github.com/aptos-labs/aptos-core.git
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING test
{
  "Result": [
    "1bf73bec8dfa6f10f0996f73986745c279e65b4e3d58582a2cacddd8cfe48bff::hello"
  ]
}
```

prove:

```
aptos move prove
[INFO] preparing module 0x1bf73bec8dfa6f10f0996f73986745c279e65b4e3d58582a2cacddd8cfe48bff::hello
[INFO] transforming bytecode
[INFO] generating verification conditions
[INFO] 1 verification conditions
[INFO] running solver
[INFO] 0.31s build, 0.01s trafo, 0.01s gen, 0.75s verify, total 1.09s
{
  "Result": "Success"
}
```

deploy:

```
aptos move deploy
Compiling, may take a little while to download git dependencies...
UPDATING GIT DEPENDENCY https://github.com/aptos-labs/aptos-core.git
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING test
package size 921 bytes
Do you want to submit a transaction for a range of [127900 - 191800] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0xbafcd30bf5a9c934674fa37797aab0170a7c7266bf74c10bd483bf8d356c7a8e?network=testnet
{
  "Result": {
    "transaction_hash": "0xbafcd30bf5a9c934674fa37797aab0170a7c7266bf74c10bd483bf8d356c7a8e",
    "gas_used": 1279,
    "gas_unit_price": 100,
    "sender": "1bf73bec8dfa6f10f0996f73986745c279e65b4e3d58582a2cacddd8cfe48bff",
    "sequence_number": 0,
    "success": true,
    "timestamp_us": 1741853871476832,
    "version": 6650167004,
    "vm_status": "Executed successfully"
  }
}
```

---
