
### **R3Chat Settings Page Overhaul - Task Sheet**

**Overall Theme & Styling Implementation**

*   [ ] Implement **Dark Theme** color palette:
    *   [ ] Background: `#1c1a19`
    *   [ ] Component Background (Panels, Cards): `#2a2726`
    *   [ ] Primary Accent (Buttons, Highlights): `#8a6d5f`
    *   [ ] Text (Primary): `#f0e9e4`
    *   [ ] Text (Secondary/Subtle): `#a19a94`
    *   [ ] Borders/Dividers: `#3a3633`
    *   [ ] Danger/Warning (Delete actions): `#9e2a2b`
*   [ ] Implement **Light Theme** color palette:
    *   [ ] Background: `#f5f2ef`
    *   [ ] Component Background (Panels, Cards): `#ffffff`
    *   [ ] Primary Accent (Buttons, Highlights): `#6b4f41`
    *   [ ] Text (Primary): `#3a3633`
    *   [ ] Text (Secondary/Subtle): `#8d837c`
    *   [ ] Borders/Dividers: `#dcd8d3`
    *   [ ] Danger/Warning (Delete actions): `#c05758`
*   [ ] Apply general UI element styling across the page:
    *   [ ] Text Inputs: Subtle background contrast, minimal borders (`Borders/Dividers` color).
    *   [ ] Buttons (General): `Primary Accent` background, `Primary Text` color, proper hover states.
    *   [ ] Icons: Modern, minimalist, `Primary Text` or `Secondary Text` color, `Primary Accent` for interactive.
    *   [ ] Borders (Cards/Dividers): `Borders/Dividers` color.
    *   [ ] Shadows: Subtle, soft shadows for dark/light modes.

**Global Settings Page Layout**

*   [ ] Implement Top Bar:
    *   [ ] Retain "Settings" title.
    *   [ ] Add "Back to Chat" arrow (`←`) to the left of "Settings".
    *   [ ] Add Light/Dark Mode toggle (`☀️`/`🌙`) to top-right.
    *   [ ] Add "Sign out" text link to top-right.
*   [ ] Implement Main Content Area Structure (Two-Column Layout):
    *   [ ] Left Column (Fixed Width).
    *   [ ] Right Column (Fluid Width).

**Left Column (Persistent Panels)**

*   [ ] **User Profile Card (5.2.1):**
    *   [ ] Create distinct card with `Component Background`.
    *   [ ] Display large circular avatar.
    *   [ ] Display `Display Name`.
    *   [ ] Display `Email Address`.
    *   [ ] Display `Plan` status as styled tag (`Primary Accent` background, `Primary Text` color).
*   [ ] **Message Usage Card (5.2.2):**
    *   [ ] Create distinct card with `Component Background`.
    *   [ ] Add "Message Usage" header.
    *   [ ] Add "Resets [Date]" indicator.
    *   [ ] Implement Standard Usage section:
        *   [ ] "Standard" label.
        *   [ ] Progress bar (`Primary Accent` color filled portion).
        *   [ ] "Current/Total" display (e.g., "144/1500").
        *   [ ] "X messages remaining" text.
    *   [ ] Implement Premium Usage section:
        *   [ ] "Premium" label with info icon (`ⓘ`).
        *   [ ] Progress bar (`Primary Accent` color filled portion).
        *   [ ] "Current/Total" display (e.g., "98/100").
        *   [ ] "X messages remaining" text.
    *   [ ] Implement "Buy more premium credits" button:
        *   [ ] `Primary Accent` background, `Primary Text` color.
        *   [ ] Include right-arrow icon (`→`).

**Right Column (Main Settings Content)**

*   [ ] **Horizontal Navigation Tabs (5.3.1):**
    *   [ ] Place tabs at top of right column.
    *   [ ] Create tab for "Account".
    *   [ ] Create tab for "Customization" (New).
    *   [ ] Create tab for "History & Sync" (New).
    *   [ ] Create tab for "Models".
    *   [ ] Create tab for "API Keys".
    *   [ ] Create tab for "Attachments" (New).
    *   [ ] Create tab for "Contact Us" (New).
    *   [ ] Style tabs: subtle pill-shape, `Secondary Text` / transparent default, `Primary Text` / `Primary Accent` when selected.
    *   [ ] Implement hover states for tabs.

*   [ ] **Account Tab Content (5.3.2):**
    *   [ ] Display "Pro Plan Benefits" header (if applicable).
    *   [ ] Implement Pro Plan Benefits cards (three horizontal, distinct cards):
        *   [ ] "Access to All Models" card with icon and description.
        *   [ ] "Generous Limits" card with icon and description.
        *   [ ] "Priority Support" card with icon and description.
        *   [ ] Cards styled with `Component Background` and subtle `Borders/Dividers` border.
        *   [ ] Icons use `Primary Accent` or vibrant shade.
    *   [ ] Implement Subscription Section:
        *   [ ] "Manage Subscription" button (`Primary Accent` background, `Primary Text` color).
    *   [ ] Implement Danger Zone section:
        *   [ ] "Danger Zone" header.
        *   [ ] Warning text.
        *   [ ] "Delete Account" button (`Danger/Warning` color, `Primary Text` color), with distinct hover/active state.

*   [ ] **Models Tab Content (5.3.3):**
    *   [ ] Display "Available Models" header.
    *   [ ] Display descriptive text.
    *   [ ] Implement "Filter by features" button/dropdown (`Secondary Text` / subtle `Component Background`).
    *   [ ] Implement "Select Recommended Models" button (`Secondary Text` / subtle `Component Background`).
    *   [ ] Implement "Unselect All" button (`Secondary Text` / subtle `Component Background`).
    *   [ ] Implement hover states for all action buttons.
    *   [ ] Render Model List (each as distinct card/panel):
        *   [ ] Model Icon.
        *   [ ] Model Name.
        *   [ ] Concise description.
        *   [ ] Key features as styled tags (e.g., `Vision`, `PDFs`).
        *   [ ] Toggle switch for enabling/disabling model (`Primary Accent` when enabled).
        *   [ ] "Show more" link.
        *   [ ] Optional "Search URL" link/icon.
        *   [ ] Cards styled with `Component Background`, `Primary Accent` border when selected/active.

*   [ ] **API Keys Tab Content (5.3.4):**
    *   [ ] Display "API Keys" header.
    *   [ ] Display descriptive text.
    *   [ ] For each API provider (e.g., Anthropic, OpenAI, Gemini):
        *   [ ] Provider name.
        *   [ ] List of models used for (as tags).
        *   [ ] Masked Input field for API Key.
        *   [ ] Link to "Get your API key from [Provider's] Console/Dashboard" (`Primary Accent` color).
        *   [ ] "Save" button (`Primary Accent` background, `Primary Text` color).

---