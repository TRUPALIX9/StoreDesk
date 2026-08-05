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

## StoreDesk Mobile

### Navigation
Side drawer (65% width) with Brand Logo Lockup Header. 
Links: Dashboard, Analytics, Sales Tax, Price Book, Reports, Settings.

### Dashboard
- **Top Summary**: Today's Total Sales Amount.
- **Tabbed Analytics**: Segmented control for TAX | DEPT | GAS views. Donut chart with centered total. Legends below in 2-column grid.
- **Live Transactions**: Elevated cards with payment icons (Card/Cash), #ID, Amount, and precise receipt timestamp.

### Price Book Item Page
- **PLU Tab**: Retail Price (large), UPC, Department, Tax Category (High/Low).
- **Cost Analysis Tab**: List of vendors. BEST COST highlighted with a badge. Per-item cost calculated.

### Reports Page
Categorized list of retrieval actions for Verifone Commander (Financial, Inventory, Audit).

### Settings
- Store Connection status and toggle.
- **GA Tax Profile**: GTC account connection section + saved info (STI number, etc.).
- Log out / Unlink action.
