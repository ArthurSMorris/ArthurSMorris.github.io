# Arthur Morris — updated academic website

Unzip this archive and open `index.html`. For static hosting, upload the contents
of the `arthur-morris-website` folder, keeping the `assets` folder alongside the
HTML pages. There is no build step.

Original page content and `Arthur_Morris_CV.pdf` are preserved. The `(1)`
attachment suffixes have been removed from filenames so the existing links work.
Each footer now links to `graphics.html`, which explains all 16 diagrams and has
no background decorations. Changes to the existing script are limited to its
background function; the CSS additions are scoped to backgrounds, the Graphics
page and its footer link.

The site selects uniformly from all 16 original SVG diagrams without repeating
a graphic within a page load. Positions, sizes and subtle rotations vary on each
refresh, and background opacity is 12% lower than in the initial version. Mobile screens show one graphic;
desktop screens show one or two, with a chance of three on large screens. The
backgrounds are static, do not capture clicks, fade over the reading column and
are hidden from assistive technology and printing.

Open `graphics.html` for the illustrated scientific guide, or
`background-catalogue.svg` for an overview of the collection. Construction
and customization notes are in `BACKGROUND_GRAPHICS.md`. The SVGs are in
`assets/backgrounds/`; keep that folder with the website.

The omitted research image at `assets/PG32Plane.png` has a neutral placeholder.
Replace that file with the original image when available; no HTML edit is needed.
The existing external KaTeX resources and Copenhagen photograph are unchanged
and still require an internet connection.
