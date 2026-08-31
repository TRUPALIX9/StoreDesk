/**
 * StoreDesk Page Registry — Canonical Source of Truth
 *
 * This file defines EVERY page that exists across all StoreDesk apps.
 * It is the single authoritative list of page keys, labels, descriptions,
 * and known per-page feature flags.
 *
 * ─── RULES ───────────────────────────────────────────────────────────────────
 *
 * 1. Every page in store-desk-electron MUST have an entry here with app: "electron"
 * 2. Every screen in store-desk-mobile MUST have an entry here with app: "mobile"
 * 3. The `key` field is the identifier used in configJson.roles[].accessKeys
 * 4. Each app MUST maintain a local mirror of this file:
 *    - Electron:  src/config/pages.ts          ← keep in sync with shared/pages-registry.ts
 *    - Mobile:    lib/core/constants/pages.dart ← keep in sync with shared/pages-registry.ts
 *    - Web Admin: src/config/pages.ts           ← re-exports from this root file
 * 5. When adding a new page/screen to any app, ADD IT HERE FIRST,
 *    then update the app-local mirror and the default role configs.
 * 6. `knownFeatureFlags` keys are the exact string keys the app reads
 *    from pageEntry.featureFlags at runtime.
 *
 * ─── SYNC VERIFICATION ───────────────────────────────────────────────────────
 *   node scripts/verify-pages-registry.js
 *   (checks that every key listed here has a matching file in each app repo)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type App = "electron" | "mobile";

export interface PageFeatureFlagDef {
  /** Human-readable label shown in admin UI toggle */
  label: string;
  /** What enabling this flag does in the app */
  description: string;
  /** Default value used when scaffolding a new role */
  default: boolean;
}

export interface PageDefinition {
  /**
   * Unique page key — used as the value in:
   * configJson.roles[].accessKeys.{app}.pages[].key
   *
   * Keys are camelCase for Electron, camelCase prefixed with "mobile" for Mobile.
   */
  key: string;
  /** Human-readable page name shown in StoreDesk Web admin */
  label: string;
  /** Short description of what this page does */
  description: string;
  /** Which StoreDesk app this page lives in */
  app: App;
  /**
   * Path to the page file relative to the app root.
   * Used by verify-pages-registry.js to confirm the file exists.
   */
  filePath: string;
  /**
   * Whether this page is enabled by default for newly scaffolded roles.
   * org_admin always gets all pages; lower roles use this default.
   */
  defaultEnabled: boolean;
  /**
   * Named feature flags that can be toggled independently per page per role.
   * The app reads these at runtime from pageEntry.featureFlags[key].
   *
   * Add a new flag here first, then read it in the app with a safe default.
   */
  knownFeatureFlags: Record<string, PageFeatureFlagDef>;
}

// ─── ELECTRON PAGES ──────────────────────────────────────────────────────────
// Mirror at: store-desk-electron/src/config/pages.ts
// Keep in sync when adding/removing pages.

export const ELECTRON_PAGES: PageDefinition[] = [
  {
    key: "pos",
    label: "POS Workspace",
    description: "Point-of-sale terminal — ring up sales, accept payment, open cash drawer.",
    app: "electron",
    filePath: "src/pages/POSWorkspacePage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {
      enableRefunds:         { label: "Refunds",         description: "Allow cashiers to process refunds.",         default: true  },
      enableDiscounts:       { label: "Discounts",        description: "Allow manual discount entry on line items.", default: true  },
      enableVoidTransaction: { label: "Void Transaction", description: "Allow voiding an active transaction.",       default: true  },
      enableCashDrawer:      { label: "Cash Drawer",      description: "Trigger cash drawer open on payment.",       default: true  },
    },
  },
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Overview cards, setup checklist, server status, and recent activity.",
    app: "electron",
    filePath: "src/pages/DashboardPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "products",
    label: "Products",
    description: "Product catalog management — add, edit, search products and variants.",
    app: "electron",
    filePath: "src/pages/ProductDetailPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {
      enableBulkImport:        { label: "Bulk Import",        description: "Allow CSV bulk product import.",           default: false },
      enableBarcodeGeneration: { label: "Barcode Generation", description: "Generate internal barcodes for products.", default: true  },
    },
  },
  {
    key: "vendors",
    label: "Vendors",
    description: "Vendor directory — add vendors, contacts, payment and delivery terms.",
    app: "electron",
    filePath: "src/pages/VendorsPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "vendorPrices",
    label: "Vendor Prices",
    description: "Manual vendor price entry and price history per variant.",
    app: "electron",
    filePath: "src/pages/VendorPricesPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "priceBook",
    label: "Price Book",
    description: "Suggested and manual selling price management across all variants.",
    app: "electron",
    filePath: "src/pages/PriceBookPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "pricingRules",
    label: "Pricing Rules",
    description: "Margin/markup rules, rounding configuration, and scope-based overrides.",
    app: "electron",
    filePath: "src/pages/PricingRulesPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "costAnalysis",
    label: "Cost Analysis",
    description: "True cost comparison across vendors — price per item, per pack, per unit.",
    app: "electron",
    filePath: "src/pages/CostAnalysisPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "transactions",
    label: "Transactions",
    description: "Transaction history, search, receipt reprint, and daily summary.",
    app: "electron",
    filePath: "src/pages/TransactionsPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {
      enableExport:     { label: "Export",      description: "Allow exporting transaction history to CSV.", default: true  },
      enableRefundView: { label: "Refund View", description: "Show refunded transactions in the list.",    default: true  },
    },
  },
  {
    key: "lotterySetup",
    label: "Lottery Setup",
    description: "Lottery product and scratch ticket configuration for the store.",
    app: "electron",
    filePath: "src/pages/LotterySetupPage.tsx",
    defaultEnabled: false,
    knownFeatureFlags: {},
  },
  {
    key: "manageWorker",
    label: "Manage Worker",
    description: "Edge server status, service controls, logs, and Cloudflare Tunnel status.",
    app: "electron",
    filePath: "src/pages/ManageWorkerPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "userManagement",
    label: "User Management",
    description: "App user roles, assignment management, and session controls.",
    app: "electron",
    filePath: "src/pages/UserManagementPage.tsx",
    defaultEnabled: false,
    knownFeatureFlags: {},
  },
  {
    key: "settings",
    label: "Settings",
    description: "Store settings — POS config, receipt template, tax rates, and preferences.",
    app: "electron",
    filePath: "src/pages/SettingsPage.tsx",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
];

// ─── MOBILE SCREENS ───────────────────────────────────────────────────────────
// Mirror at: store-desk-mobile/lib/core/constants/pages.dart
// Keep in sync when adding/removing screens.

export const MOBILE_PAGES: PageDefinition[] = [
  {
    key: "mobilePos",
    label: "POS Workspace",
    description: "Mobile point-of-sale — scan items, accept payment, print receipt.",
    app: "mobile",
    filePath: "lib/features/pos/pos_workspace_screen.dart",
    defaultEnabled: true,
    knownFeatureFlags: {
      enableManualEntry: { label: "Manual Entry", description: "Allow manual item entry without scanning.", default: true  },
      enableQuickSale:   { label: "Quick Sale",   description: "One-tap quick sale for common items.",     default: false },
    },
  },
  {
    key: "mobileDashboard",
    label: "Dashboard",
    description: "Mobile home screen — connection status, quick actions, recent activity.",
    app: "mobile",
    filePath: "lib/features/dashboard/dashboard_screen.dart",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "mobileScanner",
    label: "Barcode Scanner",
    description: "Camera barcode scanner — scan UPC to look up products and prices.",
    app: "mobile",
    filePath: "lib/features/scanner/scanner_screen.dart",
    defaultEnabled: true,
    knownFeatureFlags: {
      enableCameraFlash: { label: "Camera Flash", description: "Allow toggling flashlight during scanning.", default: true  },
      enableManualEntry: { label: "Manual Code",  description: "Allow manual barcode entry as fallback.",   default: true  },
    },
  },
  {
    key: "mobileProductSearch",
    label: "Product Search",
    description: "Search products by name, UPC, or SKU.",
    app: "mobile",
    filePath: "lib/features/products/product_search_screen.dart",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "mobileVendorPrices",
    label: "Vendor Prices",
    description: "View and compare vendor pricing for a product on mobile.",
    app: "mobile",
    filePath: "lib/features/products/vendor_prices_screen.dart",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "mobilePriceBook",
    label: "Price Book",
    description: "View the selling price book and suggested prices on mobile.",
    app: "mobile",
    filePath: "lib/features/price_book/price_book_screen.dart",
    defaultEnabled: true,
    knownFeatureFlags: {},
  },
  {
    key: "mobileTransactions",
    label: "Transactions",
    description: "View transaction history on mobile.",
    app: "mobile",
    filePath: "lib/features/transactions/transactions_screen.dart",
    defaultEnabled: true,
    knownFeatureFlags: {
      enableExport: { label: "Export", description: "Allow exporting transactions to CSV from mobile.", default: false },
    },
  },
  {
    key: "mobileReports",
    label: "Reports",
    description: "Sales and inventory reports on mobile.",
    app: "mobile",
    filePath: "lib/features/reports/reports_screen.dart",
    defaultEnabled: false,
    knownFeatureFlags: {},
  },
  {
    key: "mobileAnalytics",
    label: "Analytics",
    description: "Analytics dashboard — revenue charts, top products, and trends.",
    app: "mobile",
    filePath: "lib/features/analytics/analytics_screen.dart",
    defaultEnabled: false,
    knownFeatureFlags: {},
  },
  {
    key: "mobileSalesTax",
    label: "Sales Tax",
    description: "Sales tax management and rate configuration on mobile.",
    app: "mobile",
    filePath: "lib/features/sales_tax/sales_tax_screen.dart",
    defaultEnabled: false,
    knownFeatureFlags: {},
  },
];

// ─── COMBINED REGISTRY ────────────────────────────────────────────────────────

/** All pages across all StoreDesk apps */
export const ALL_PAGES: PageDefinition[] = [...ELECTRON_PAGES, ...MOBILE_PAGES];

/** Lookup a page definition by key */
export function getPage(key: string): PageDefinition | undefined {
  return ALL_PAGES.find(p => p.key === key);
}

export const ELECTRON_PAGE_KEYS = ELECTRON_PAGES.map(p => p.key);
export const MOBILE_PAGE_KEYS   = MOBILE_PAGES.map(p => p.key);

/**
 * Build a default pages array for a role from the registry defaults.
 * Use this to generate configJson.roles[].accessKeys.{app}.pages
 * when creating a new store.
 *
 * @param app - "electron" | "mobile"
 * @param enabledOverrides - explicit enabled values per page key (overrides defaultEnabled)
 */
export function buildDefaultRolePages(
  app: App,
  enabledOverrides: Record<string, boolean> = {}
): Array<{ key: string; enabled: boolean; featureFlags: Record<string, boolean> }> {
  const pages = app === "electron" ? ELECTRON_PAGES : MOBILE_PAGES;
  return pages.map(p => ({
    key: p.key,
    enabled: enabledOverrides[p.key] !== undefined ? enabledOverrides[p.key] : p.defaultEnabled,
    featureFlags: Object.fromEntries(
      Object.entries(p.knownFeatureFlags).map(([k, def]) => [k, def.default])
    ),
  }));
}
