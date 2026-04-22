# FeesPage Direct Payment Fix ✅ COMPLETE
- [x] 1. Create TODO.md with implementation steps
- [x] 2. Update Coins button to directly record full payment via recordPaymentMutation (inline handler)
- [x] 3. Integrate markingPaid Map state for per-row loading/spinner
- [x] 4. Update recordPaymentMutation onSuccess/onError to clear markingPaid
- [x] 5. Button shows Loader2 during mutation, emerald colors, "Mark Paid (Full Amount)" title
- [x] 6. Existing guards (status !== 'paid', canDo('fees.update')) preserved
- [x] 7. Table auto-refetches via invalidateQueries on success

The Coins button now directly marks unpaid vouchers as paid (full netAmount, cash method), updates server, refreshes table without modal. Ready for testing in browser.

