# StoreDesk Wireframes

ASCII wireframes from the master spec. See `AGENTS.md` for full detail.

## Dashboard

```txt
┌────────────────────────────────────────────────────────────────────┐
│ StoreDesk                                      Server: Running ✅   │
├───────────────┬────────────────────────────────────────────────────┤
│ Sidebar       │ Dashboard                                          │
│               │                                                    │
│ Dashboard     │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ Products      │ │ Products     │ │ Vendors      │ │ Review Items │ │
│ Vendors       │ │ 245          │ │ 12           │ │ 8            │ │
│ Prices        │ └──────────────┘ └──────────────┘ └──────────────┘ │
│ Invoices      │                                                    │
│ Price Compare │ Quick Setup: Server, MongoDB, Mobile, APK QR, Pair  │
│ Lottery Setup │                                                    │
│ Mobile Access │ Recent Invoices table                              │
│ Settings      │                                                    │
└───────────────┴────────────────────────────────────────────────────┘
```

## Vendor prices

Table sorted by **price per base unit**. Best vendor highlighted. Suggested selling price column.

## Review queue

List invoices needing review → open invoice → editable rows → match product/variant → confirm saves VendorPrice only.

## Mobile Access

- Local server URL and Wi‑Fi IP
- APK download QR
- Pairing QR / 6-digit code
- Paired devices list with disable action

## StoreDesk Buddy

```txt
Connect → Home → Scan | Search | Upload Invoice | Settings
```

Connect flow: scan pairing QR or enter server URL + code. Home shows connection status.
