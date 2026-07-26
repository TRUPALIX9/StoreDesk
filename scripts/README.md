# StoreDesk scripts

Only two files matter for day-to-day commands:

| File | Role |
| --- | --- |
| **`Makefile`** (repo root) | What you type: `make dev`, `make status`, etc. |
| **`scripts/make.ps1`** | Windows task runner (one file, all logic) |

`make.cmd` at the repo root calls the same runner if GNU `make` is not installed.

## Daily workflow

```powershell
cd StoreDesk
make dev       # MongoDB + server + desktop
make status    # what's running
make stop      # stop server / UI
```

Without GNU make: `.\make.cmd dev`

## Why PowerShell at all?

Make on Windows cannot natively open a second terminal for the API server, check MongoDB ports, or stop processes by port. One PowerShell file handles that; the Makefile stays a simple command list.

## Other files in this folder

| Path | Role |
|------|------|
| `invoices/` | Normalized invoice JSON seeds |
| `package.json` | Optional Node helpers |

Do **not** commit `commander-downloads/` probe dumps or Commander session XML.

## First-time clone

```powershell
git clone --recurse-submodules https://github.com/TRUPALIX9/StoreDesk.git
cd StoreDesk
make setup
make install
make dev
```

If submodules are empty after clone:

```powershell
git submodule update --init --recursive
```