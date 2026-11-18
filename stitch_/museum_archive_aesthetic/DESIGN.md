---
name: Museum Archive Aesthetic
colors:
  surface: '#fff8f4'
  surface-dim: '#e9d7c6'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e6'
  surface-container: '#feebd9'
  surface-container-high: '#f8e5d4'
  surface-container-highest: '#f2dfce'
  on-surface: '#231a0f'
  on-surface-variant: '#54433a'
  inverse-surface: '#392e23'
  inverse-on-surface: '#ffeedf'
  outline: '#877369'
  outline-variant: '#dac2b6'
  surface-tint: '#934b19'
  primary: '#6c2f00'
  on-primary: '#ffffff'
  primary-container: '#8b4513'
  on-primary-container: '#ffc29f'
  inverse-primary: '#ffb68c'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#004662'
  on-tertiary: '#ffffff'
  tertiary-container: '#005f83'
  on-tertiary-container: '#97d7ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68c'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753401'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#8bcff8'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#fff8f4'
  on-background: '#231a0f'
  surface-variant: '#f2dfce'
typography:
  headline-lg:
    fontFamily: sourceSerifFour
    fontSize: 34px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: sourceSerifFour
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.4'
  headline-md:
    fontFamily: sourceSerifFour
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.5'
  body-lg:
    fontFamily: sourceSerifFour
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.8'
  body-md:
    fontFamily: sourceSerifFour
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.8'
  note-text:
    fontFamily: literata
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  collection-id:
    fontFamily: bodoniModa
    fontSize: 16px
    fontWeight: '400'
    letterSpacing: 0.1em
  label-bold:
    fontFamily: sourceSerifFour
    fontSize: 16px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  margin-page: 32px
  gutter-grid: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
  touch-target-min: 88px
---

## Brand & Style
This design system is built upon the "Museum Collection Quality" narrative, transforming a digital interface into a tactile, prestigious archive. It is designed specifically for seniors, prioritizing high-legibility, physical metaphors, and an emotional sense of permanence.

The style is **Tactile and Skeuomorphic**, utilizing the textures of physical preservation—linen, parchment, and etched metal. It avoids the coldness of modern minimalism in favor of "museum shelf" depth, where every digital artifact is treated as a physical heirloom. The atmosphere is quiet, respectful, and timeless, evoking the feeling of browsing a private, well-lit gallery.

## Colors
The palette is rooted in historical preservation. The **Antique White** (#F8F5EE) serves as the primary canvas, mimicking the texture of museum-grade rice paper. **Linen** (#E5DCD1) is used for structural containers to provide subtle depth without harsh value shifts.

**Ochre** (#8B4513) acts as the primary action color, providing a warm, earthy contrast that is easily distinguishable for senior eyes. **Decorative Gold** (#D4AF37) is reserved for borders, dividers, and premium accents to signify "collection-grade" importance. Text colors prioritize high contrast, using **Ink Black** (#2D2318) for maximum readability against the warm backgrounds.

## Typography
Typography is treated as a "published" document. **Source Serif Four** is the workhorse, providing a sturdy, authoritative serif feel that aids readability for older users. 

For personal touches, such as voice transcriptions or handwritten notes, **Literata** provides a warm, bookish alternative that feels intimate. **Bodoni Moda** is used exclusively for page numbers and collection IDs, adding a touch of high-fashion editorial elegance. 

A generous **1.8x line height** is strictly enforced for body text to prevent "line crowding," ensuring seniors can track text easily across the screen.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy, creating a stable and predictable environment. 

- **Generous Margins:** A mandatory 32px horizontal margin ensures content is never cramped against the device edges, providing "breathing room" similar to a matted picture frame.
- **Vertical Rhythm:** Spacing is oversized to accommodate large touch targets. The minimum vertical touch area for any interactive element is 88px.
- **Museum Shelf Reflow:** On desktop/tablet, content is arranged in "shelves" (rows) with clear horizontal dividers in Decorative Gold. On mobile, these shelves stack vertically, maintaining the 32px safety margin.

## Elevation & Depth
Depth is created through "Museum-grade Elevation." Instead of high-shadow modern depths, we use **Tonal Layers** combined with very soft, diffused ambient shadows.

- **The Shelf:** Background surfaces use a linen texture overlay (8% opacity). 
- **Picture Frames:** Active items or featured photos use a "Frame" effect: a 4px white border, a 1px Gold (#D4AF37) outer stroke, and a soft shadow (0 4px 16px rgba(45,35,24,0.08)).
- **Spotlight Effect:** When an item is selected or active, a subtle radial gradient (spotlight) is applied behind it, brightening the linen texture to guide the user's focus.

## Shapes
The shape language is primarily **Pill-shaped (3)** for interactive elements, providing a soft, non-threatening feel for touch. 

However, content containers (photos, archival records) use **Sharp (0)** or **Soft (1)** corners to mimic physical paper, cardstock, and photo prints. This distinction helps users instantly differentiate between "something I can press" (rounded) and "something I am viewing" (square).

## Components

### Buttons
- **Primary:** Capsule-shaped with a subtle gradient from Ochre (#8B4513) to a slightly warmer burnt orange. Text is white for contrast.
- **Secondary:** Capsule-shaped with a Gold (#D4AF37) border and no fill, using Ink Black text.

### Cards (The Archive Item)
Archival items are styled as framed photographs. They feature a wide white inner margin (simulating a photo mat) and a thin Decorative Gold outline. Use the parchment texture for cards that contain only text.

### Inputs & Fields
Input fields use the Linen (#E5DCD1) background with a "pressed" inset shadow to feel like an engraved area in a display case. Labels are always placed above the field in **label-bold** typography.

### Etched Icons
Icons should be monochromatic Ink Black, styled with a slight "etched metal" look (0.5px offset highlight) to feel like physical plaques.

### Voice Transcription (Note)
Transcription areas use the parchment texture background and the **note-text** font (Literata) to differentiate them from the "official" archival metadata.