// A loan-page link may suggest an existing option; it never submits a request
// or carries a borrower's details in the URL, storage, or analytics.
const LOAN_OPTIONS = new Map([
  ['fix-flip', 'Fix & Flip'],
  ['bridge', 'Bridge'],
  ['construction', 'Construction'],
  ['land', 'Land'],
  ['cash-out', 'Cash-Out Refinance'],
  ['second-position', '2nd Position'],
]);

export function loanTypeFromSearch(search) {
  if (typeof search !== 'string' || search.length > 4096) return null;
  const values = new URLSearchParams(search).getAll('loan');
  return values.length === 1 ? LOAN_OPTIONS.get(values[0]) ?? null : null;
}

export function prefillLoanRequest(form, search) {
  const type = loanTypeFromSearch(search);
  const field = form?.querySelector('select[name="loan_type"]');
  // Preserve browser-restored choices and any selection made before the
  // module loaded. Unknown links leave the normal form completely unchanged.
  if (!type || !field || field.value || !Array.from(field.options).some(option => option.value === type)) return false;
  field.value = type;
  return true;
}

if (typeof document !== 'undefined') {
  const start = () => prefillLoanRequest(
    document.querySelector('form[name="pre-approval"]'),
    window.location.search,
  );
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}
