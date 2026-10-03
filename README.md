# Sogio & Danet Wedding Invitation

Static website. No build step: open `index.html` in a browser, or upload the whole folder to any web host.

## Structure
- `index.html`    page content (text, sections, Location, Itinerary)
- `css/style.css` all styling
- `js/script.js`  music, sliders, itinerary animation, map button
- `images/`       photos (bg-*, slider-*, story-*, location)
- `audio/music.mp3` background music (plays automatically; starts on first tap if the browser blocks autoplay)

## Common edits
- Map pin link / address: `MAP` at the "GOOGLE MAP BOX" comment in `js/script.js`
- Music file: `SRC` at the "MUSIC" comment in `js/script.js`
- Itinerary times and labels: "ITINERARY TIMELINE" comment in `index.html`
- Khmer wording: `<p class="kh">` paragraphs in `index.html`
- Fonts load from Google Fonts, so they need an internet connection.
