# Natalie Nicole — October 23, 2026 snapshot

Source: https://models.maxim.com/t/SJV3LHC5

These are manually recorded standings from the official public profile, not final
results and not a live ranking feed. The prior site snapshot was dated October 22.

| Competition | October 22 site record | October 23 profile snapshot | Round on October 23 |
|---|---|---|---|
| IVY Swimwear | 3rd of 11 | 3rd of 11 | Finals |
| Salty Mermaid Runway | 3rd of 12 | 6th of 26 | Semi-Final Wild Card |
| Elegance – Vienna | 7th, total absent | 11th of 17 | Finals |
| Radiance 2026 | 4th of 13 | 5th of 13 | Finals Wild Card |
| Natural Beauty 2026 | 12th of 15 | 12th of 15 | Finals |
| Centerfold 2026 | 1st of 21, Semi-Final Wild Card | 4th, total not displayed | Finals Wild Card |

## Deadline evidence and IVY confirmation

The campaign owner subsequently supplied the official MAXIM round-details screenshot
on October 23, explicitly displaying **“Round ends on 23 October, 9:00 PM EDT.”**
The screenshot also confirms IVY’s Finals round and rank 3 of 11. IVY’s deadline is
therefore confirmed as `2026-10-23T21:00:00-04:00`, equivalent to
`2026-10-24T01:00:00Z`. The public page now displays “Closes” without an estimate
label for IVY. No private dashboard screenshot is published in this repository.

The earlier profile retrieval around 2:52 PM EDT on October 23 displayed an IVY timer of
00 days, 06 hours, 07 minutes, 59 seconds. That indicates approximately October 23
at 9 PM EDT, equivalent to October 24 at 01:00 UTC. The old October 24 sorting
date treated a next-day date as though it were the Eastern closing date.

The other round countdowns had the same hours/minutes/seconds and the following
day offsets. Their profile date labels fell on the following UTC calendar date:

| Competition | Countdown days | Close in America/New_York | Equivalent UTC |
|---|---:|---|---|
| IVY Swimwear | 0 | October 23, 9 PM EDT — confirmed | October 24, 01:00Z |
| Natural Beauty 2026 | 3 | October 26, 9 PM EDT | October 27, 01:00Z |
| Radiance 2026 | 3 | October 26, 9 PM EDT | October 27, 01:00Z |
| Elegance – Vienna | 4 | October 27, 9 PM EDT | October 28, 01:00Z |
| Salty Mermaid Runway | 5 | October 28, 9 PM EDT | October 29, 01:00Z |
| Centerfold 2026 | 6 | October 29, 9 PM EDT | October 30, 01:00Z |

**Only IVY’s absolute deadline is confirmed. The other five times remain estimates.**
The interactive MAXIM page returned “Site Unavailable” in the agent browser.
Search retrieval supplied the other standings and countdowns; repeated retrievals
may return cached text. The general terms page did not expose competition-specific
absolute cutoffs. MAXIM remains authoritative for voting availability and schedule changes.

IVY now uses `deadlineVerified: true` and the offset-qualified `dateIso` above.
Its `estimatedCloseIso` has been removed. Its evidence records the official screenshot
and confirmation date. The other five rows retain `deadlineVerified: false`,
`dateIso: null` and their provisional `estimatedCloseIso` values.
A maintainer who obtains another official timestamp should update that row’s
`dateIso`, set `deadlineVerified: true`, record the source, and revise this evidence
note. Verified timestamps take precedence over estimates automatically.
Never promote a date-only value to a verified instant.

## Rotation behavior

- Select the earliest future cutoff from the recorded rounds; preserve original
  order for equal cutoffs. After IVY's confirmed cutoff, Natural Beauty is featured.
  Radiance has the same cutoff and remains visible in the competition list.
- Exclude every expired row, including previously promoted rows. Do not invent a
  later round or imply Natalie advanced when no refreshed snapshot confirms it.
- Reevaluate at the next boundary, once a minute, when a hidden tab becomes visible,
  and when restored via back/forward navigation.
- Update the hero, photo, document title, voting instructions, button text and
  highlighted row together. Keep recorded rankings explicitly dated even after rotation.
- Show official-results wording if no eligible dated round remains.
- Disable the old Centerfold bonus claim pending confirmation for the new round.

## Verification

Run `node test-competition-rotation.cjs` from the repository root. Nine tests cover
rank/round data, the Eastern-to-UTC boundary, exact expiry, tie order, later expiry,
unknown/future schedules, IVY confirmation, verified timestamp precedence, resumed tabs, stale
snapshots, the exhausted-schedule state, navigation and 12 gallery paths.
The original suite passed under UTC, America/Los_Angeles and Pacific/Auckland.
After the IVY confirmation, the updated suite was rerun in all three zones.

The gallery section, navigation markup and embedded voting QR image were also
compared byte-for-byte with the prior source and are unchanged. The voting URL
remains https://models.maxim.com/t/SJV3LHC5. No gallery image file or CNAME was changed.
An existing literal backslash-n separating CSS media rules was corrected so the
existing mobile styles parse.

Only `index.html` serves the active page; the old `Natalie_index_optimized.html`
archive is intentionally untouched. Publishing the commit to `main` triggers the
repository's existing GitHub Pages build and deployment workflow.
