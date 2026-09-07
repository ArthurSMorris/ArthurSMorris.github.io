# Arthur Morris — updated academic website

Unzip this archive and open `index.html`. For static hosting, upload the contents
of the `arthur-morris-website` folder, keeping the `assets` folder alongside the
HTML pages. There is no build step.

Original page content and `Arthur_Morris_CV.pdf` are preserved. The `(1)`
attachment suffixes have been removed from filenames so the existing links work.
Each footer now links to `graphics.html`, which explains all 16 diagrams and has
no background decorations. Footers also link to CC BY-SA 4.0 and the AI
Disclosure page. Changes to the existing script are limited to its background
function; the CSS additions are scoped to backgrounds, the Graphics page and
footer links.

The site selects uniformly from all 16 original SVG diagrams without repeating
a graphic within a page load. Positions, sizes and subtle rotations vary on each
refresh. Small screens (720px and below) and touch-only devices keep one graphic
centered behind the reading area, including on phones in landscape orientation.
The drawing is fitted within the viewport, with clearer contrast and limited
rotation. Its position and size stay fixed while scrolling, even when the mobile
browser address bar expands or collapses. A screen-width or layout-mode change
recalculates placement. It remains behind the text and adds no extra page space.
Desktop screens keep the randomized placement and reduced opacity, showing one
or two graphics, with a chance of three on large screens. The backgrounds stay
still and fade over the desktop reading column. On desktop hover, an
exposed graphic brightens and links directly to its explanation. Text, figures,
the footer and the rest of the reading column retain their normal interaction.
The links also support keyboard focus. Touch-only devices keep the backgrounds
decorative; printing omits them.

All diagram labels now use Computer Modern mathematical lettering, with proper
subscripts, kets and Greek symbols. The lettering is embedded as SVG paths and
requires no visitor font installation or download.

Open `graphics.html` for the illustrated scientific guide, or
`background-catalogue.svg` for an overview of the collection. Construction
and customization notes are in `BACKGROUND_GRAPHICS.md`. The SVGs are in
`assets/backgrounds/`; keep that folder with the website.

The omitted research image at `assets/PG32Plane.png` has a neutral placeholder.
Replace that file with the original image when available; no HTML edit is needed.
The existing external KaTeX resources and Copenhagen photograph are unchanged
and still require an internet connection.
