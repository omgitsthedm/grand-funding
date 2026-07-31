# Grand Funding Quote-Language Production Release

- Date: 2026-07-30
- Status: executed, verified, and closed
- Authorized by: David Marsh
- Production URL: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Netlify site ID: `055c5942-aeaa-478a-9508-a34406994d5d`

## Authorization

After receiving confirmation that the complete local change passed 1,623 checks
with zero failures, that all seven existing legal claim gates remain unresolved,
and that the update had not been committed, pushed, or deployed, David Marsh
explicitly instructed Codex: “push it all live.”

This is a new, one-time operational authorization for the exact reviewed
quote-language release. It does not reuse or reopen a prior production
exception.

## Authorized scope

- Replace every public-facing `pre-approved`, `pre-approval`, and equivalent
  variant with context-appropriate quote language.
- Cover visible page copy, calls to action, metadata, machine-readable content,
  article guidance, the application page, and success messaging.
- Preserve the internal Netlify form name `pre-approval`, its hidden
  `form-name` values, and the matching JavaScript selector so existing form
  routing, notifications, and submission history remain connected.
- Add a fail-closed validator preventing public pre-approval wording from
  returning.
- Record the removal-only timing snapshot change without resolving or expanding
  the underlying timing-policy issue.

## Claims boundary

The release does not add a rate, point, loan amount, leverage value, eligibility
rule, service area, timing value, licensing statement, comparative claim, or
commitment to lend. The seven regulated-claim categories remain unresolved and
strict-blocking. This authorization permits publication of the exact reviewed
artifact despite that expected strict stop; it does not constitute lending-
counsel approval.

## Reviewed candidate

- Required runtime: Node `24.18.0`
- Public boundary: `dist/` only
- Public files: 294
- Aggregate SHA-256: `04049521ffb9edef7767aca5c2d61bb47cc64205631e2de87a74ea825f3267b0`
- Full local matrix: 1,623 checks; zero failures
- Public pre-approval wording: zero source or generated matches
- Preserved machine-only references: two form names, two hidden values, and one
  JavaScript selector

## Release controls

1. Commit and push only the reviewed quote-language change.
2. Open a GitHub pull request and require the repository checks to pass.
3. Publish `dist/` only to an immutable Netlify preview.
4. Verify the preview without submitting a form or enabling telemetry.
5. Merge the reviewed source to `master`.
6. Publish the same unchanged `dist/` artifact to production.
7. Verify production, the custom domain, quote language, restricted-token
   separation, form contracts, representative routes, metadata, and assets.
8. Record the source, pull request, deploy identifiers, artifact identity, and
   final verification.

Do not change Domain Name System records, advertising, environment variables,
borrower data, production form submissions, analytics consent, or strict-claim
status.

## Release result

- Source commit: `f05b4a6cb1cd6ea70c7111ea10d36e1137adc17d`
- Production review: pull request #20
- Production-source merge:
  `2c5557443e90fc0662a41291d0b04ccc7081a556`
- GitHub `deployable-artifact` check: passed
- Verified immutable preview: `6a6c058dcfc9e87fa6da4283`
- Preview URL:
  `https://6a6c058dcfc9e87fa6da4283--grandfundingllc.netlify.app`
- Production deploy: `6a6c09806ddf7952fda85da5`
- Production state: `ready`
- Published: `2026-07-31T02:34:01.543Z`
- Production URL: `https://www.grandfundingllc.com`

The merged `master` build reproduced the reviewed 294-file artifact and
aggregate SHA-256
`04049521ffb9edef7767aca5c2d61bb47cc64205631e2de87a74ea825f3267b0`.
The immutable preview and custom domain each matched all 88 HTML documents
after expected Netlify form normalization, all 18 form contracts, and all 205
directly served non-HTML assets byte-for-byte.

Verification passed:

- 1,623 local checks with zero failures;
- the required GitHub artifact check;
- 1,606 live-safe preview checks with zero failures;
- 1,606 live-safe production checks with zero failures;
- zero public pre-approval wording across text, metadata, accessible
  attributes, and structured data;
- zero public Forward, NMLS, MLO, or sponsored-license association; and
- five intentionally preserved machine-only `pre-approval` references: two
  form names, two hidden `form-name` values, and one JavaScript selector.

No production form was submitted. Third-party telemetry was blocked during
verification. No DNS, advertising, environment variable, analytics-consent,
borrower-record, form-submission, or strict-claim state was changed.

Deploy `6a6c09806ddf7952fda85da5` consumed and closed this one-time operational
authorization. All seven regulated-claim categories remain unresolved and
strict-blocking.
