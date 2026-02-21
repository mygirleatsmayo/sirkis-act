# Changelog

## [Unreleased]

- **Stat Icon Radius**: Proportional `rounded-[27%]` replaces fixed `rounded-2xl` so icon containers maintain consistent corner proportions at all sizes.
- **Market Funded Icon**: Swapped `Coins` → `TrendingUp` for better semantic fit.
- **Loss Panel Responsive Sizing**: Fluid clamp-based font sizes for quote, number, and label across narrow and three-column layouts; targets specific problem viewports (513–564px, 616–656px, 1024–1048px, 1100–1318px).
- **Loss Panel Ghost Marks Removed**: Quotation marks removed from potential loss dynamic quote in all layouts.
- **Start-Now Button Layout**: Stacks below "The Trajectory" heading at cramped viewport widths (513–564px mobile and 1024–1048px desktop) using container-width detection.
- **Fraction Labels**: Fixed `getLossFractionLabel` — removed `five sixths`; values >81% now read "nearly 90% of"; values ≥90% now read "nearly all of your retirement."

- **Dark Mode**: Full dark Cyprus palette — solid dark panels, sidebar, header, and inputs throughout.
- **New Color Palette**: 5-color system — Cyprus #003D3A bg, Persian Green brand, Corn gold, Persian Red loss, lightened Boulder grey for OPM.
- **Hero**: Solid carved-text color spans replace gradient; teal "Dr. Sirkis's", gold "High-Wire Act".
- **Table Waiting Rows**: 3+ delayed-start waiting years collapse into a single vertical age-range row (23 / ••• / 31, all $0).
- **Recharts Tooltip**: Dark styled with matching panel background and white text.
- **Delay Banner**: Now red instead of gold to match loss semantics.
- **401k Panel**: Top error text removed; label bolds on cap breach; cap amount bolded; "Over IRS caps" warning centered.
- **Withdrawal Panel**: All three heading labels unified to slate-400.
- **Gold Blobs**: Ambient corner glows (top-right + bottom-right), desktop only.
- **Typography**: Custom font pairing — Fraunces (display/headings) + Recursive Sans Linear (UI/body), self-hosted variable woff2.
- **Drawer Handle**: Delayed start age in red, Roth IRA contribution, smart salary formatting ($X.XM), directional glow via clip-path.
- **iOS Theming**: Dynamic island and address bar color via theme-color meta tag.
- **IRS Cap Enforcement**: Contributions exceeding IRS limits now clamped in projection calculations (401k, Roth IRA, HSA).
- **Compact Mobile Panels**: Hero+two-across layout for narrow screens; merged delayed-start Target+Potential Loss; "Start Early" green sub-cards with descriptors.
- **Responsive Stats Panels**: Smart per-value abbreviation, adaptive layout scaling, 3-column threshold lowered to 550px.
- **Chart Tooltip**: Reordered legend to match chart stacking order (Start Now highest).
- **Chart/Table Padding**: Fixed values matching "The Trajectory" alignment.
- **Subheadline Fix**: Prevented orphan words with inline-block wrapping.
- **Title/Meta**: Updated page title and added Open Graph meta tags.
- **Theme & Branding**: Crown favicon and updated tab title.
- **Quote Carousel**: Added "Sirkism" quote carousel for educational reinforcement.
- **Responsiveness**: Enhanced scroll handling, viewport management, and mobile layout.
- **Withdrawals**: Added life expectancy input and growth-aware withdrawal estimates.
- **Inputs**: Added major-based starting salary presets (NACE) and tightened input validation.

## [0.5.0] - Logic Overhaul
- **Comparisons**: Dual projections for “start now” vs delayed start.
- **Insights**: Potential loss surfaced in metrics and summary panel.
- **Table**: Waiting-period years visually dimmed for clarity.

## [0.4.0] - The "High-Wire" Redesign
- **Visual Overhaul**: “Dr. Sirkis’s High-Wire Act” branding with glassmorphic UI.
- **Layout**: Desktop-first sidebar with mobile drawer.
- **Typography**: Editorial serif headings.

## [0.3.0] - Delayed Start Feature
- **New Input**: “Start investing at” age to quantify delay impact.
- **Insight**: Loss alert module for delayed starts.

## [0.2.0] - Granularity Update
- **Breakdown**: Contributions vs employer match vs returns in charts and stats.
- **Inputs**: Slider + text inputs for all parameters.

## [0.1.0] - Initial Release
- Core retirement projections with 401(k), Roth, HSA, and inflation-adjusted totals.
