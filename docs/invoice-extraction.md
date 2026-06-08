# Invoice Extraction

StoreDesk uses a review-first invoice workflow.

## Flow

```txt
Upload (desktop or mobile)
  → Invoice record
  → Extraction job
  → InvoiceItems (editable)
  → User review / match
  → Confirm ready rows
  → VendorPrice records only
```

## Current implementation

- PDF uploads attempt text extraction via `pdf-parse`.
- Image uploads use a placeholder until OCR/AI is wired.
- Structured rows still use sample extraction output when full parsing is unavailable.
- Bad extraction is safe: rows stay in `needs_review` until the user edits and confirms.

## Future AI hook

Replace `extractInvoice()` in `invoiceExtraction.service.ts` with:

1. Store raw file under `uploads/`.
2. Extract raw text (PDF) or OCR output (image).
3. Validate JSON against a Zod schema.
4. Create `InvoiceItem` rows with confidence scores.
5. Always require desktop review before creating `VendorPrice`.

No inventory or stock updates are performed at any step.
