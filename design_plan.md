### **PRD: R3Chat Settings Page Overhaul and Theming**

**1. Objective**

To redesign the `R3Chat` Settings page, transforming its layout, improving information hierarchy, and applying the established brown-based theme. The goal is to provide a more intuitive, modern, and visually consistent user experience, moving from the current tab-based layout to a more integrated and card-based approach for certain elements.

**2. Background**

The current Settings page uses a left-sidebar navigation for tabs, with distinct content areas for each. The new design aims for a more unified feel, with a persistent user profile and usage summary, and a simplified main content area for the specific settings sections.

**3. Scope**

This request covers front-end UI and UX changes only for the Settings page. All changes should adhere to the brown-based color theme defined previously. No changes to backend logic or data structures are assumed unless implied by the new UI structure (e.g., persistent usage display).

**4. Core Theme & Styling (Reference from Main PRD)**

*   **Dark Theme (Default):**
    *   **Background:** A very dark, desaturated brown. Hex: `#1c1a19`
    *   **Component Background (e.g., Panels, Cards):** A slightly lighter dark brown. Hex: `#2a2726`
    *   **Primary Accent (Buttons, Highlights):** A muted, warm, earthy brown for buttons, highlights, and selected items. Hex: `#8a6d5f`
    *   **Text (Primary):** An off-white with a hint of cream. Hex: `#f0e9e4`
    *   **Text (Secondary/Subtle):** A light gray-brown. Hex: `#a19a94`
    *   **Borders/Dividers:** A subtle, darker brown. Hex: `#3a3633`
    *   **Danger/Warning (for delete actions):** A deep, muted red/maroon. Hex: `#9e2a2b` (Adjust to be less vibrant than current pink).

*   **Light Theme:**
    *   **Background:** A very light, creamy beige. Hex: `#f5f2ef`
    *   **Component Background (e.g., Panels, Cards):** Pure white or a very light off-white. Hex: `#ffffff`
    *   **Primary Accent (Buttons, Highlights):** A rich, medium-dark coffee brown. Hex: `#6b4f41`
    *   **Text (Primary):** A very dark, almost black brown. Hex: `#3a3633`
    *   **Text (Secondary/Subtle):** A grayish-brown. Hex: `#8d837c`
    *   **Borders/Dividers:** A light, warm gray. Hex: `#dcd8d3`
    *   **Danger/Warning (for delete actions):** A slightly lighter, muted red/maroon. Hex: `#c05758`

**5. Detailed Component Requirements**

#### **5.1. Global Settings Page Layout**

1.  **Top Bar:**
    *   The "Settings" title should remain, with the "Back to Chat" arrow (`←`) to its left.
    *   The Light/Dark Mode toggle (`☀️`/`🌙`) and a "Sign out" text link should be placed to the far right. No gear icon here, as the user is already on the settings page.

2.  **Main Content Area Structure:**
    *   The page will have a `flex` or `grid` layout that effectively creates two main columns:
        *   **Left Column (Fixed Width):** Contains the User Profile, Plan Status, and Message Usage (formerly the "Usage" tab, now persistent).
        *   **Right Column (Fluid Width):** Contains the main settings content, organized by horizontal tabs.

#### **5.2. Left Column (Persistent Panels)**

This column combines user profile and usage information into distinct cards.

##### **5.2.1. User Profile Card**

*   **Placement:** Top of the left column.
*   **Content:**
    *   Large circular avatar (matching the user's initial or chosen avatar).
    *   User's `Display Name` (e.g., "Charles Mag").
    *   User's `Email Address` (e.g., `charlesmagey@gmail.com`).
    *   Current `Plan` status (e.g., "Pro Plan") displayed as a styled tag, using **Primary Accent** background and **Primary Text** color.
*   **Styling:** A distinct card with background set to **Component Background** color.

##### **5.2.2. Message Usage Card**

*   **Placement:** Directly below the User Profile Card in the left column.
*   **Content:**
    *   Header: "Message Usage".
    *   "Resets [Date]" indicating the reset date for credits/messages.
    *   **Standard Usage:** Display "Standard" followed by a progress bar and "Current/Total" (e.g., "144/1500").
        *   Progress bar: Use the **Primary Accent** color for the filled portion.
        *   Below the bar, "X messages remaining" (e.g., "1356 messages remaining").
    *   **Premium Usage:** Display "Premium" followed by an information icon (`ⓘ`). Progress bar and "Current/Total" (e.g., "98/100").
        *   Progress bar: Use the **Primary Accent** color for the filled portion.
        *   Below the bar, "X messages remaining" (e.g., "2 messages remaining").
    *   **"Buy more premium credits" Button:** A prominent button at the bottom of the card.
        *   Background: **Primary Accent** color.
        *   Text: **Primary Text** color.
        *   Include a right-arrow icon (`→`).
*   **Styling:** A distinct card with background set to **Component Background** color.

#### **5.3. Right Column (Main Settings Content)**

This area will dynamically change based on the selected horizontal tab.

##### **5.3.1. Horizontal Navigation Tabs**

*   **Placement:** At the very top of the right column, below the global header.
*   **Tabs:**
    *   "Account"
    *   "Customization" (New tab - assumes future expansion for theme choices, avatar settings, etc.)
    *   "History & Sync" (New tab - assumes future settings for chat history management, import/export)
    *   "Models"
    *   "API Keys"
    *   "Attachments" (New tab - assumes future settings for attachment defaults, storage)
    *   "Contact Us" (New tab - link to support)
*   **Styling:** Each tab should be a subtle, pill-shaped button.
    *   Default/Unselected: Text color **Secondary Text**, background **transparent** or subtle **Component Background**.
    *   Selected/Active: Text color **Primary Text**, background **Primary Accent** color.
    *   Hover: Slight increase in contrast or subtle background change.

##### **5.3.2. Account Tab Content (`AccountSettingsPanel`)**

*   **Header:** "Pro Plan Benefits" (if Pro, otherwise "Account Settings").
*   **Content (Pro Plan Benefits - if applicable):**
    *   Three visually distinct cards/boxes arranged horizontally.
    *   Each card contains:
        *   A prominent icon (e.g., `🚀`, `💰`, `🎧` - use appropriate font icons).
        *   A title (e.g., "Access to All Models", "Generous Limits", "Priority Support").
        *   A brief descriptive text.
    *   **Styling:** Each benefit card should have the **Component Background** color and a subtle border in **Borders/Dividers** color. Text as **Primary Text**. Icons could use the **Primary Accent** or a slightly more vibrant shade of it.
*   **Content (Subscription Section):**
    *   A prominent "Manage Subscription" button.
        *   Background: **Primary Accent** color.
        *   Text: **Primary Text** color.
*   **Content (Danger Zone):**
    *   Header: "Danger Zone".
    *   Warning text: "Permanently delete your account and all associated data."
    *   **"Delete Account" Button:** Critical button for account deletion.
        *   Background: **Danger/Warning** color (`#9e2a2b`).
        *   Text: **Primary Text** color.
        *   Emphasize with a distinct hover/active state to prevent accidental clicks.

##### **5.3.3. Models Tab Content (`ModelsPanel`)**

*   **Header:** "Available Models".
*   **Description:** "Choose which models appear in your model selector. This won't affect existing conversations."
*   **Action Buttons:**
    *   "Filter by features" (Dropdown/button for filtering model types)
    *   "Select Recommended Models" (Button)
    *   "Unselect All" (Button)
    *   **Styling:** These buttons should use **Secondary Text** color for text and a very subtle **Component Background** for their background, with a distinct **Primary Accent** hover state.
*   **Model List:**
    *   Each model should be presented in a distinct card/panel.
    *   **Card Content:**
        *   Model Icon (e.g., `✨` for Gemini, `🤖` for others, etc. - use relevant font icons if possible, or simple geometric shapes if not).
        *   Model Name (e.g., "Gemini 2.0 Flash").
        *   A concise description.
        *   Key features displayed as small, styled tags (e.g., `Vision`, `PDFs`, `Search`, `Fast`). These tags should use a slightly contrasting background to the card, maybe a darker tint of the **Component Background** or a very subtle shade of the **Primary Accent** for their background, and **Secondary Text** for text.
        *   A toggle switch (`Toggle`) to enable/disable the model in the main chat's model selector.
        *   A "Show more" link to expand details about the model.
        *   Optionally, a "Search URL" link/icon (e.g., `🔗`).
    *   **Styling:** Each model card should have the **Component Background** color. The border when selected/active should be the **Primary Accent** color. The toggle switch should use the **Primary Accent** color when enabled.

##### **5.3.4. API Keys Tab Content (`APIKeysPanel`)**

*   **Header:** "API Keys".
*   **Description:** "Bring your own API keys for selected models. Messages sent using your API keys will not count towards your monthly limits."
*   **API Key Sections:** For each API provider (e.g., Anthropic, OpenAI, Gemini):
    *   Provider name (e.g., "Anthropic API Key").
    *   List of models it's used for (e.g., "Claude 3.5 Sonnet", "Claude 3.7 Sonnet (Reasoning)"). These can be small tags, similar to model feature tags.
    *   Input field for the API Key (masked).
    *   Link to "Get your API key from [Provider's] Console/Dashboard".
    *   A "Save" button.
    *   **Styling:** Each API key section is within its own card with **Component Background** color. Input fields should be subtle. The "Save" button and links to external dashboards should use the **Primary Accent** color.

**6. General UI Element Styling**

*   **Text Inputs:** Backgrounds should be slightly darker or lighter than the card background to provide subtle contrast. Borders should be minimal and use the **Borders/Dividers** color.
*   **Buttons (General):** All buttons not specifically styled above should adhere to the **Primary Accent** for background and **Primary Text** for text. Hover states should provide a slight darkening or lightening effect.
*   **Icons:** Use modern, minimalist icons. Their color should generally be **Primary Text** or **Secondary Text**, with **Primary Accent** for interactive states or important elements.
*   **Borders:** All card borders and significant dividers should use the **Borders/Dividers** color.
*   **Shadows:** Employ subtle, soft shadows if desired, but keep them minimal to maintain a clean aesthetic, using darker shades for dark mode and lighter shades for light mode.
