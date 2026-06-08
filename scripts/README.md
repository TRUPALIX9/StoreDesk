# StoreDesk scripts

## First-time clone

```powershell
git clone --recurse-submodules https://github.com/TRUPALIX9/StoreDesk.git
cd StoreDesk
```

If submodules are empty after clone:

```powershell
git submodule update --init --recursive
```

## Update all submodules

```powershell
git pull
git submodule update --init --recursive
```

## Pull latest submodule branches

```powershell
git submodule update --remote --merge
```
