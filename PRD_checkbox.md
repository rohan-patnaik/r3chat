# R3Chat UI Update Checklist

This document tracks the implementation status of the UI updates requested in the random.txt file.

## 1. Chat Layout

### A. Header & Global Icons
- [x] Keep the sidebar toggle icon in the top-left corner
- [x] Change the brand text to "R3.chat", font-size 16px, font-weight bold, color primary-text
- [x] On the top-right, display 3 icon buttons only:
  - [x] "Sign out" link
  - [x] Theme toggle (sun/moon icon)
  - [x] Settings (slider icon)
  - [x] Apply subtle translucent shadow on hover

### B. Sidebar
1. New Chat Button  
   - [x] Convert to a pill shape, text primary-text, border-radius 0px, height 32px, width same as the "R3Chat" text above it
2. Search Input  
   - [x] Positioned immediately below the button
   - [x] Background: semi-transparent dark; placeholder text in secondary-text; input text in primary-text; border-radius 6px
3. Pinned Section  
   - [x] Add label "Pinned" (10px, uppercase, secondary-text), left-aligned with 4px top margin
   - [x] List pinned threads below this label (placeholder added)
4. Date Groups  
   - [x] Headings: "Today", "Yesterday", "Last 7 Days"
   - [x] Update style: 10px, 500 weight, uppercase, letter-spacing 0.05em, secondary-text, left-aligned, 8px margin above
5. Thread Rows  
   - [x] Show only title (truncate after 4 words), no subtitle
   - [x] Height 32px; padding 0 12px; prepend a small chat icon
   - [x] On hover: background 15% opaque magenta; active thread: 100% opaque magenta with white text
6. Profile Section  
   - [x] Fixed at bottom: circular user photo (40px), user first name (14px bold) and plan badge (pill, 12px)
   - [x] Make badge clickable to open account menu

### C. Main Content – Empty State
1. Greeting  
   - [x] Left-aligned: "How can I help you, [FirstName]?"
   - [x] Update font-size to 28px, weight 600, color primary-text, margin-bottom 16px
2. Action Buttons  
   - [x] Four ghost cards (Create, Explore, Code, Learn)
   - [x] Update styling: 128x96px, 8px radius, 1px border #3A3633, background transparent
   - [x] On hover: fill with mid-dark background (#2A2726), border & icon in magenta (#C01976), text white
3. Suggested Prompts  
   - [x] Four links below buttons
   - [x] Update styling: text-muted (secondary-text), left-aligned, line-height 1.5; on hover: magenta

### D. Chat Input Area
- [x] Container height 96px; background rgba(42,39,38,0.8); radius 12px; padding 12px
- [x] Controls arranged in one row at bottom:
  - [x] Model selector dropdown (bold, primary-text)
  - [x] Quality indicator button (ghost style)
  - [x] Attach icon button
  - [x] Send arrow on far right: up-arrow icon, color secondary-text; on hover: primary-text
- [x] Space controls 12px apart; ensure text entry never overlaps these controls
- [x] Show scrollbar only if input ≥ 2 lines
- [x] Make Chat Input Area position fixed (does not move on scroll)
- [x] Make Chat Input Area background translucent with 0.7 opacity
- [x] Create 2 concentric rectangles with smooth border radii, both translucent
- [x] Add proper padding between text and Chat Input Area boundaries

## 2. Settings Page

### A. Top Bar
- [x] Left: back arrow + "Settings" (16px bold, primary-text)
- [x] Right: theme toggle + sign-out icon button (primary-text)

### B. Two-Column Layout
- [x] Left column (fixed width 296px): profile + usage + shortcuts
- [x] Right column (fluid): horizontal tabs + panel content

### C. Left Column Panels
1. Profile Card  
   - [x] Background: component-bg; padding 24px; radius 12px
   - [x] Circular photo (80px), name (20px bold), email (14px secondary-text), plan badge (magenta pill)
2. Message Usage Card (margin-top 16px)  
   - [x] Header "Message Usage" (primary-text) + reset date (secondary-text)
   - [x] Standard bar: label primary-text, track border-color, fill magenta, numbers on right, "X messages remaining" below in secondary-text
   - [x] Premium bar: label primary-text + info icon, same styling
   - [x] "Buy more premium credits" full-width magenta button, margin-top 12px
3. Shortcuts Card (margin-top 16px)  
   - [x] List keybindings (e.g. "Search – Ctrl K") with styled keycaps

### D. Right Column – Tabs
- [x] Tabs: Account | Customization | History & Sync | Models | API Keys | Attachments | Contact Us
- [x] Update tab styling: pill-shaped 32px height, padding 0 12px; text secondary-text on transparent; active tab background light brown, text primary-text; hover: slight beige overlay
- [x] Adjust tab width to ensure all tabs are visible without scrolling

### E. Account Tab Content
1. [x] Heading "Pro Plan Benefits" (20px primary-text)
2. [x] Three benefit cards in a row (padding 16px; border 1px #3A3633; radius 8px; background component-bg)
   - [x] Accent icon (magenta), title (16px bold primary-text), description (14px secondary-text)
3. [x] "Manage Subscription" magenta button (48px height, full width, margin-top 24px)
4. [x] Danger Zone (margin-top 32px):
   - [x] Title primary-text; warning text secondary-text; "Delete Account" button in deep maroon (#9E2A2B) with primary-text, margin-top 16px; hover darker

### F. Models & API Keys Tabs
- [x] Models: filter/selection buttons ghost style; list model cards like benefit cards but include toggles and "Show more" links
- [x] Fix toggle on background to be visible when turned on
- [x] API Keys: one card per provider with masked input, console link in magenta, "Save" button magenta