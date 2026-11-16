# Pixel scene assets

These WebP files are normalized copies of the ten user-provided source images. Each copy uses a centered 16:9 crop at 1920 × 1080 and WebP quality 88. No color changes, stretching, or generated replacement artwork were applied.

## Landing

- `landing/poster.webp`: `Sunset at Space Academy.png`; static reduced-motion fallback.
- `landing/frame-01.webp`: `Gemini_Generated_Image_6ykssg6ykssg6yks (1).jpeg`; stable open-expression frame.
- `landing/frame-02.webp`: `Gemini_Generated_Image_6ykssg6ykssg6yks.jpeg`; brief expression variation.
- `landing/frame-03.webp`: `Gemini_Generated_Image_6ykssg6ykssg6yks (2).jpeg`; second brief expression variation.

## Arequipa

- `cities/arequipa/poster.webp`: `Arequipa Science Base Beneath Misti.png`; static reduced-motion fallback.
- `cities/arequipa/frame-01.webp`: `Gemini_Generated_Image_b6yqthb6yqthb6yq (3).jpeg`; stable base frame.
- `cities/arequipa/frame-02.webp`: `Gemini_Generated_Image_b6yqthb6yqthb6yq (2).jpeg`; occasional solar highlight.

## Tromsø

- `cities/tromso/poster.webp`: `Aurora Over Arctic Research Base.png`; static reduced-motion fallback.
- `cities/tromso/frame-01.webp`: `Gemini_Generated_Image_b6yqthb6yqthb6yq.jpeg`; stable aurora frame.
- `cities/tromso/frame-02.webp`: `Gemini_Generated_Image_b6yqthb6yqthb6yq (1).jpeg`; alternate aurora brightness.

The PNG compositions are deliberately not mixed into the animated loops because their camera framing differs more than the JPEG variants. They remain in use as the approved static poster for users who request reduced motion.

## Moon and Mars destinations

- `destinations/moon.webp`: `Imagen de ChatGPT 15 nov 2026, 03_47_48 p.m-1.png`.
- `destinations/mars.webp`: `Imagen de ChatGPT 15 nov 2026, 03_47_49 p.m-2.png`.

These are WebP quality 88 copies at their original 1672 × 941 dimensions. The selection screen displays them with `object-fit: cover`, without stretching. Each destination has one source image, so the screen uses a short crossfade between destinations instead of a frame animation.
