# Chicago Artist Guide Design System

**Single source of truth for all design tokens and styling patterns**

This document consolidates design tokens from `tailwind.config.js`, `src/theme/styleVars.ts`, and `src/theme/globalStyles.ts` for easy reference.

---

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `mint` / `primary` | `#82B29A` | Primary brand color, CTAs, links |
| `cornflower` | `#4C7180` | Secondary accent |
| `salmon` | `#E17B60` | Secondary accent, important highlights |

### Supporting Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `banana` | `#F9E9B1` | Light accent |
| `butter` | `#E9C268` | Warm accent |
| `peach` | `#F5AF19` | Warm accent |
| `yoda` | `#B8D8C7` | Light mint tint |
| `evergreen` | `#4A725D` | Dark green accent |
| `gold` | `#D3991C` | Warm metallic accent |
| `blush` | `#F7BeB2` | Soft pink accent |
| `yellow` | `#EFC93D` | Bright accent |
| `scrollOrange` | `#F0960E` | Scroll indicators |

### Grays & Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| `black` | `#000000` | Pure black |
| `black05a` | `rgba(0, 0, 0, 0.05)` | Subtle overlay |
| `dark` | `#3B4448` | Dark text/backgrounds |
| `darkGrey` / `slate` | `#2F4550` | Dark gray |
| `darkGreyBlue` | `#355669` | Dark blue-gray |
| `gray` / `veryDarkGrayBlue` | `#4D5055` | Medium gray |
| `grayishBlue` | `#8A8A8A` | Light gray-blue |
| `lighterGrey` | `#C4C4C4` | Light gray |
| `lightGrey` | `#D1D1D1` | Lighter gray |
| `lightestGrey` | `#EFEFEF` | Very light gray |
| `paginationGray` | `#D4D6DF` | Pagination components |
| `white` | `#FFFFFF` | Pure white |
| `white80a` | `rgba(255, 255, 255, 0.8)` | Semi-transparent white |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `bodyBg` | `#F8F9FA` | Page background |
| `mainFont` | `#0C2028` | Primary text color |
| `secondaryFontColor` | `#2F4550` | Secondary text |
| `italicColor` | `#537C8C` | Italic text (h4) |
| `darkPrimary` | `#425B4E` | Dark variant of primary |

---

## Typography

### Font Families
| Token | Family | Usage |
|-------|--------|-------|
| `font-open-sans` / `mainFont` | "Open Sans", sans-serif | Body text, paragraphs |
| `font-lora` | "Lora", serif | Italic headings (h4), accents |
| `font-montserrat` | "Montserrat", sans-serif | Headings (h1, h2, h3, h5, h6), buttons |

### Type Scale

#### Heading 1 (h1)
```css
font-family: Montserrat, sans-serif
font-size: 48px
font-weight: 700
line-height: 56px
color: #2F4550 (secondaryFontColor)
```

#### Heading 2 (h2)
```css
font-family: Montserrat, sans-serif
font-size: 28px
font-weight: 700
line-height: 36px
color: #0C2028 (mainFont)
```

#### Heading 3 (h3)
```css
font-family: Montserrat, sans-serif
font-size: 24px
font-weight: 500
line-height: 56px
color: #0C2028 (mainFont)
```

#### Heading 4 (h4) - Italic
```css
font-family: Lora, serif
font-size: 24px
font-weight: 400
font-style: italic
line-height: 28px
letter-spacing: 0.01em
color: #537C8C (italicColor)
```

#### Heading 5 (h5)
```css
font-family: Montserrat, sans-serif
font-size: 18px
font-weight: 500
line-height: 20px
```

#### Heading 6 (h6)
```css
font-family: Montserrat, sans-serif
font-size: 16px
font-weight: 400
line-height: 24px
```

#### Body / Paragraph (p)
```css
font-family: "Open Sans", sans-serif
font-size: 16px
font-weight: 400
line-height: 24px
letter-spacing: 0.5px
```

#### Button Text (.button)
```css
font-family: Montserrat, sans-serif
font-size: 14px
font-weight: 700
line-height: 16px
letter-spacing: 0.1em
text-transform: uppercase (typically)
```

#### Caption (.caption)
```css
font-family: "Open Sans", sans-serif
font-size: 12px
font-weight: 400
line-height: 14px
letter-spacing: 0.4px
```

#### Nav Text (.nav)
```css
font-size: 12px
line-height: 15px
letter-spacing: 0.84px
color: #0C2028 (mainFont)
```

### Custom Font Sizes (Tailwind)
- `text-36`: 36px / line-height: 1
- `text-50`: 50px / line-height: 1
- `text-60`: 60px / line-height: 1
- `text-80`: 80px / line-height: 1

---

## Spacing & Layout

### Card Dimensions
- **Standard Card Height**: `350px` (exported as `cardHeight`)

### Breakpoints
| Token | Value | Description |
|-------|-------|-------------|
| `sm` | `576px` | Small devices (landscape phones) |
| `md` | `768px` | Medium devices (tablets) |
| `lg` | `992px` | Large devices (desktops) |
| `xl` | `1200px` | Extra large devices (large desktops) |

**Usage in styled-components:**
```typescript
import { breakpoints } from './theme/styleVars';

@media (min-width: ${breakpoints.md}) {
  // styles
}
```

**Usage in Tailwind:**
```html
<div class="sm:text-lg md:text-xl lg:text-2xl">...</div>
```

---

## Animations

### Keyframes
All animations use 1s duration with ease-in-out timing.

| Animation Class | Keyframes | Effect |
|----------------|-----------|--------|
| `animate-slide-right` | `slideRight` | Element slides in from left (-200% → 0) |
| `animate-slide-left` | `slideLeft` | Element slides in from right (200% → 0) |
| `animate-slide-up` | `slideUp` | Element slides up from bottom (100% → 0) |
| `animate-slide-down` | `slideDown` | Element slides down from top (-100% → 0) |

**Usage:**
```html
<div class="animate-slide-right">Content</div>
```

---

## Utility Classes

### Special Text Styles

#### Orange Text
```css
.orangeText {
  color: #E17B60 (salmon)
  font-weight: bold
  font-family: Lora, serif
}
```

---

## Implementation Guidelines

### When to Use Each Styling Method

1. **Tailwind CSS** - Preferred for:
   - Simple, static styles
   - Layout (flex, grid)
   - Spacing (margin, padding)
   - Responsive design
   ```html
   <div class="flex items-center gap-4 p-6 bg-mint text-white">
   ```

2. **Styled Components** - Use for:
   - Dynamic styles based on props
   - Component-specific complex styles
   - Theme-aware components
   ```typescript
   import { colors, fonts } from './theme/styleVars';
   const Button = styled.button`
     background: ${colors.primary};
     font-family: ${fonts.montserrat};
   `;
   ```

3. **SCSS** - Use for:
   - Complex, nested styles
   - Legacy component styles
   - Global style overrides
   ```scss
   .component {
     &__element {
       color: $mainFont;
     }
   }
   ```

### Accessing Design Tokens

#### In Tailwind Classes
```html
<div class="bg-mint text-mainFont font-montserrat">
  <h1 class="text-60">Large Heading</h1>
</div>
```

#### In Styled Components
```typescript
import { colors, fonts, breakpoints } from '../theme/styleVars';

const StyledCard = styled.div`
  background: ${colors.mint};
  font-family: ${fonts.mainFont};

  @media (min-width: ${breakpoints.md}) {
    padding: 2rem;
  }
`;
```

#### In React Components
```typescript
import { colors } from '../theme/styleVars';

<div style={{ backgroundColor: colors.primary }}>
```

---

## File Locations

- **Tailwind Config**: `/tailwind.config.js`
- **JS/TS Variables**: `/src/theme/styleVars.ts`
- **Global Styles**: `/src/theme/globalStyles.ts`
- **SCSS Variables**: `/src/styles/custom.scss`

---

## Notes for Developers

1. **React 16 Compatibility**: All JSX files must explicitly import React
2. **Consistency**: Prefer existing patterns - if a component uses Tailwind, continue with Tailwind
3. **No Mixing**: Avoid mixing styling methods within a single element
4. **Accessibility**: Always consider color contrast (WCAG AA minimum)
5. **Mobile First**: Design for mobile, enhance for desktop

---

**Last Updated**: 2025-12-16
