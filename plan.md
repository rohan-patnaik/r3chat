### PRD: R3.chat UI/UX Overhaul and Theming

**1. Objective**

To transform the current `R3Chat` user interface into a more sophisticated, professional, and user-centric design. This involves restructuring the layout, enhancing key components, and implementing a new brown-based color theme for both light and dark modes across the main chat interface and the settings page.

**2. Background**

The current UI is functional but basic, with a simple layout and bright blue accent colors. The goal is to evolve the application's look and feel to be more aligned with modern, premium AI assistant applications. The new design prioritizes a calmer aesthetic, improved user guidance, and a more organized presentation of information, extending these principles to a revamped settings experience.

**3. Scope**

This request covers front-end UI and UX changes only for the main chat interface and the settings page. No changes to backend logic, API contracts, or authentication flows are required unless explicitly stated or implied by new UI structures (e.g., persistent usage display).

**4. Core Theme & Styling Guide**

Implement a new color palette. All existing blue accents (`#007bff` or similar) should be replaced.

*   **Dark Theme (Default):**
    *   **Background:** A very dark, desaturated brown. Hex: `#1c1a19`
    *   **Component Background (e.g., Sidebar, Panels, Cards):** A slightly lighter dark brown. Hex: `#2a2726`
    *   **Primary Accent:** A muted, warm, earthy brown for buttons, highlights, and selected items. Hex: `#8a6d5f`
    *   **Text (Primary):** An off-white with a hint of cream. Hex: `#f0e9e4`
    *   **Text (Secondary/Subtle):** A light gray-brown. Hex: `#a19a94`
    *   **Borders/Dividers:** A subtle, darker brown. Hex: `#3a3633`
    *   **Danger/Warning (for delete actions):** A deep, muted red/maroon. Hex: `#9e2a2b`

*   **Light Theme:**
    *   **Background:** A very light, creamy beige. Hex: `#f5f2ef`
    *   **Component Background (e.g., Sidebar, Panels, Cards):** Pure white or a very light off-white. Hex: `#ffffff`
    *   **Primary Accent:** A rich, medium-dark coffee brown. Hex: `#6b4f41`
    *   **Text (Primary):** A very dark, almost black brown. Hex: `#3a3633`
    *   **Text (Secondary/Subtle):** A grayish-brown. Hex: `#8d837c`
    *   **Borders/Dividers:** A light, warm gray. Hex: `#dcd8d3`
    *   **Danger/Warning (for delete actions):** A slightly lighter, muted red/maroon. Hex: `#c05758`

**5. Detailed Component Requirements - Main Chat Interface**

#### **5.1. Main Layout**

The two-column layout (Sidebar and Main Content) is retained. The sidebar should be collapsible.

#### **5.2. Sidebar (`ChatHistoryPanel`)**

1.  **Header:**
    *   The hamburger menu icon (`☰`) should be replaced with a "Collapse Sidebar" icon (e.g., an arrow pointing into a bracket `[<-` or `->]`).
    *   The "pop-out" icon should be removed.

2.  **New Chat Button:**
    *   The button's background color should be the **Primary Accent** color from the theme.
    *   The text should be the **Primary Text** color.
    *   The button should have slightly more rounded corners than the current design.

3.  **Search Bar:**
    *   The placeholder text should change from "Search Chats" to "Search your threads...".
    *   Styling should match the new theme, using **Component Background** for the input field, **Secondary Text** for placeholder, and **Primary Text** for input.

4.  **Chat History List:**
    *   The overall structure (grouping by "Today", "Yesterday", etc.) is good.
    *   **New Feature:** Add the capability to display an icon to the left of a chat title. For example, a code icon (`</>`) could appear for chats related to programming. This should be a prop passed to the chat list item component. Selected chat items should use the **Primary Accent** color for their background.

5.  **User Profile Section (Bottom):**
    *   Retain the circular avatar, name, and status.
    *   Ensure all colors and fonts conform to the new theme. This section should use **Component Background** color.

#### **5.3. Main Content Area (`ChatView`) - Empty State**

This is a significant change. The current "Welcome" screen will be replaced with a more interactive and helpful starting point.

1.  **Greeting:**
    *   Display a personalized, centered greeting: "How can I help you, [UserName]?". `[UserName]` should be dynamically inserted based on the logged-in user, using **Primary Text** color.

2.  **Action Buttons:**
    *   Below the greeting, display a row of four pill-shaped, clickable buttons.
    *   Each button should contain an icon and a label.
    *   The buttons should be styled subtly, using the **Component Background** color and **Secondary Text** color for default state, with a hover state that uses the **Primary Accent** background and **Primary Text** color.
    *   Buttons (Icon placeholders are descriptive, use appropriate actual icons):
        *   `⚡ Create` (e.g., a "spark" icon)
        *   `🗺️ Explore` (e.g., a "map" or "compass" icon)
        *   `</> Code` (e.g., "code brackets" icon)
        *   `📚 Learn` (e.g., "book" or "graduation cap" icon)

3.  **Suggested Prompts:**
    *   Below the action buttons, display a list of 4-5 suggested prompts as plain text links.
    *   Examples:
        *   "How does AI work?"
        *   "Are black holes real?"
        *   "How many Rs are in the word "strawberry"?"
        *   "What is the meaning of life?"
    *   Clicking a prompt should populate the chat input with that text. These links should use the **Primary Accent** color for text and hover states.

#### **5.4. Chat Input Area (`MessageInput`)**

1.  **Model Selector:**
    *   Retain the dropdown for model selection (e.g., "GPT-4o Mini", "Gemini 2.5 Flash").
    *   Restyle the dropdown to match the new theme's muted aesthetic, using **Component Background** for the dropdown body and **Primary Text** for selected value. Options should use **Primary Text** with **Primary Accent** on hover/selection.

2.  **Action Icons:**
    *   Remove the single paperclip icon.
    *   Replace it with two distinct, subtle icons or buttons to the left of the text input area. These icons should be subtle, using **Secondary Text** color, and have a clear hover state using **Primary Accent** color.
        *   **Search:** A magnifying glass icon (`🔍`). When active, it might indicate web search is enabled (e.g., by changing its color to **Primary Accent**).
        *   **Attach:** A paperclip or file icon (`📎` or `📁`).

3.  **Text Input Field:**
    *   The main text input area for messages should use the **Component Background** color, with **Primary Text** for input and **Secondary Text** for placeholder.

4.  **Send Button:**
    *   Replace the current simple send icon.
    *   The new button should be a square with moderately rounded corners, filled with the **Primary Accent** color.
    *   Inside the square, place an upward-pointing arrow icon (`↑`) in **Primary Text** color.

#### **5.5. Top-Right Header Icons**

*   Add two new icons to the top-right corner of the entire application window (outside the main chat area):
    *   A **Light/Dark Mode Toggle** icon (e.g., a sun `☀️` for light mode, moon `🌙` for dark mode). This icon should use **Primary Text** color and switch appropriately based on the current theme.
    *   A **Settings** icon (e.g., a gear `⚙️`). This icon should use **Primary Text** color.

---

**6. Detailed Component Requirements - Settings Page**

**1. Objective**

To redesign the `R3Chat` Settings page, transforming its layout, improving information hierarchy, and applying the established brown-based theme. The goal is to provide a more intuitive, modern, and visually consistent user experience, moving from the current tab-based layout to a more integrated and card-based approach for certain elements.

**2. Background**

The current Settings page uses a left-sidebar navigation for tabs, with distinct content areas for each. The new design aims for a more unified feel, with a persistent user profile and usage summary, and a simplified main content area for the specific settings sections.

**3. Scope**

This request covers front-end UI and UX changes only for the Settings page. All changes should adhere to the brown-based color theme defined previously. No changes to backend logic or data structures are assumed unless implied by the new UI structure (e.g., persistent usage display).

**4. Core Theme & Styling (Reference from Main PRD)**

*(Refer to Section 4 above for comprehensive color palette details.)*

**5. Detailed Component Requirements**

#### **5.1. Global Settings Page Layout**

1.  **Top Bar:**
    *   The "Settings" title should remain, with the "Back to Chat" arrow (`←`) to its left. Both should use **Primary Text** color.
    *   The Light/Dark Mode toggle (`☀️`/`🌙`) and a "Sign out" text link should be placed to the far right. No gear icon here, as the user is already on the settings page. Both the toggle icon and "Sign out" text should use **Primary Text** color.

2.  **Main Content Area Structure:**
    *   The page will have a `flex` or `grid` layout that effectively creates two main columns:
        *   **Left Column (Fixed Width):** Contains the User Profile, Plan Status, and Message Usage (formerly the "Usage" tab, now persistent).
        *   **Right Column (Fluid Width):** Contains the main settings content, organized by horizontal tabs.

#### **5.2. Left Column (Persistent Panels)**

This column combines user profile and usage information into distinct cards. Each card should use the **Component Background** color for its background.

##### **5.2.1. User Profile Card**

*   **Placement:** Top of the left column.
*   **Content:**
    *   Large circular avatar (matching the user's initial or chosen avatar).
    *   User's `Display Name` (e.g., "Charles Mag") in **Primary Text** color.
    *   User's `Email Address` (e.g., `charlesmagey@gmail.com`) in **Secondary Text** color.
    *   Current `Plan` status (e.g., "Pro Plan") displayed as a styled tag, using **Primary Accent** background and **Primary Text** color for the text.
*   **Styling:** A distinct card with subtle borders using **Borders/Dividers** color.

##### **5.2.2. Message Usage Card**

*   **Placement:** Directly below the User Profile Card in the left column.
*   **Content:**
    *   Header: "Message Usage" in **Primary Text** color.
    *   "Resets [Date]" indicating the reset date for credits/messages, in **Secondary Text** color.
    *   **Standard Usage:** Display "Standard" in **Primary Text** followed by a progress bar and "Current/Total" (e.g., "144/1500") in **Primary Text**.
        *   Progress bar: Uses the **Primary Accent** color for the filled portion, and **Borders/Dividers** color for the unfilled track.
        *   Below the bar, "X messages remaining" (e.g., "1356 messages remaining") in **Secondary Text** color.
    *   **Premium Usage:** Display "Premium" in **Primary Text** followed by an information icon (`ⓘ`) in **Secondary Text**. Progress bar and "Current/Total" (e.g., "98/100") in **Primary Text**.
        *   Progress bar: Uses the **Primary Accent** color for the filled portion, and **Borders/Dividers** color for the unfilled track.
        *   Below the bar, "X messages remaining" (e.g., "2 messages remaining") in **Secondary Text** color.
    *   **"Buy more premium credits" Button:** A prominent button at the bottom of the card.
        *   Background: **Primary Accent** color.
        *   Text: **Primary Text** color.
        *   Include a right-arrow icon (`→`) in **Primary Text** color.
*   **Styling:** A distinct card with subtle borders using **Borders/Dividers** color.

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
    *   Hover: Slight increase in contrast or subtle background change (e.g., a slight tint of **Primary Accent**).

##### **5.3.2. Account Tab Content (`AccountSettingsPanel`)**

*   **Header:** "Pro Plan Benefits" (if Pro, otherwise "Account Settings") in **Primary Text** color.
*   **Content (Pro Plan Benefits - if applicable):**
    *   Three visually distinct cards/boxes arranged horizontally.
    *   Each card contains:
        *   A prominent icon (e.g., `🚀`, `💰`, `🎧` - use appropriate font icons) in **Primary Accent** or a slightly more vibrant shade.
        *   A title (e.g., "Access to All Models", "Generous Limits", "Priority Support") in **Primary Text** color.
        *   A brief descriptive text in **Secondary Text** color.
    *   **Styling:** Each benefit card should have the **Component Background** color and a subtle border in **Borders/Dividers** color.

*   **Content (Subscription Section):**
    *   A prominent "Manage Subscription" button.
        *   Background: **Primary Accent** color.
        *   Text: **Primary Text** color.
*   **Content (Danger Zone):**
    *   Header: "Danger Zone" in **Primary Text** color.
    *   Warning text: "Permanently delete your account and all associated data." in **Secondary Text** color.
    *   **"Delete Account" Button:** Critical button for account deletion.
        *   Background: **Danger/Warning** color (`#9e2a2b` for dark, `#c05758` for light).
        *   Text: **Primary Text** color.
        *   Emphasize with a distinct hover/active state (e.g., slightly darker shade of danger color) to prevent accidental clicks.

##### **5.3.3. Models Tab Content (`ModelsPanel`)**

*   **Header:** "Available Models" in **Primary Text** color.
*   **Description:** "Choose which models appear in your model selector. This won't affect existing conversations." in **Secondary Text** color.
*   **Action Buttons:**
    *   "Filter by features" (Dropdown/button for filtering model types)
    *   "Select Recommended Models" (Button)
    *   "Unselect All" (Button)
    *   **Styling:** These buttons should use **Secondary Text** color for text and a very subtle **Component Background** for their background, with a distinct **Primary Accent** hover state (text color becoming **Primary Text**).
*   **Model List:**
    *   Each model should be presented in a distinct card/panel.
    *   **Card Content:**
        *   Model Icon (e.g., `✨` for Gemini, `🤖` for others, etc. - use relevant font icons if possible, or simple geometric shapes if not) in **Primary Accent** color.
        *   Model Name (e.g., "Gemini 2.0 Flash") in **Primary Text** color.
        *   A concise description in **Secondary Text** color.
        *   Key features displayed as small, styled tags (e.g., `Vision`, `PDFs`, `Search`, `Fast`). These tags should use a slightly contrasting background to the card (e.g., a darker tint of the **Component Background** or a very subtle shade of the **Primary Accent** for their background) and **Secondary Text** for text.
        *   A toggle switch (`Toggle`) to enable/disable the model in the main chat's model selector. The toggle switch should use the **Primary Accent** color when enabled.
        *   A "Show more" link in **Primary Accent** color to expand details about the model.
        *   Optionally, a "Search URL" link/icon (e.g., `🔗`) in **Primary Accent** color.
    *   **Styling:** Each model card should have the **Component Background** color and a subtle border in **Borders/Dividers** color. The border when selected/active should be the **Primary Accent** color.

##### **5.3.4. API Keys Tab Content (`APIKeysPanel`)**

*   **Header:** "API Keys" in **Primary Text** color.
*   **Description:** "Bring your own API keys for selected models. Messages sent using your API keys will not count towards your monthly limits." in **Secondary Text** color.
*   **API Key Sections:** For each API provider (e.g., Anthropic, OpenAI, Gemini):
    *   Provider name (e.g., "Anthropic API Key") in **Primary Text** color.
    *   List of models it's used for (e.g., "Claude 3.5 Sonnet", "Claude 3.7 Sonnet (Reasoning)") as small tags in **Secondary Text** color with a subtle **Component Background** background.
    *   Input field for the API Key (masked) in **Primary Text** color, with a background slightly darker or lighter than the card background, and borders in **Borders/Dividers** color.
    *   Link to "Get your API key from [Provider's] Console/Dashboard" in **Primary Accent** color.
    *   A "Save" button with **Primary Accent** background and **Primary Text** color.
    *   **Styling:** Each API key section is within its own card with **Component Background** color and a subtle border in **Borders/Dividers** color.

**7. General UI Element Styling**

*   **Text Inputs:** Backgrounds should be slightly darker or lighter than the containing card background to provide subtle contrast (e.g., for dark mode, use a slightly darker shade of **Component Background**; for light mode, use a very subtle off-white if **Component Background** is pure white). Borders should be minimal and use the **Borders/Dividers** color. Text color should be **Primary Text**, placeholder text **Secondary Text**.
*   **Buttons (General):** All buttons not specifically styled above should adhere to the **Primary Accent** for background and **Primary Text** for text. Hover states should provide a slight darkening (dark theme) or lightening (light theme) effect of the background, and text remains **Primary Text**.
*   **Icons:** Use modern, minimalist icons. Their color should generally be **Primary Text** or **Secondary Text**, with **Primary Accent** for interactive states or important elements.
*   **Borders:** All card borders and significant dividers should use the **Borders/Dividers** color.
*   **Shadows:** Employ subtle, soft shadows if desired, but keep them minimal to maintain a clean aesthetic. For dark mode, use very dark, desaturated shadows. For light mode, use very light, subtle shadows.
*   **Typography:** Maintain a consistent, modern sans-serif font family throughout the application for readability and a professional feel. Font sizes should be carefully considered for hierarchy and legibility.
*   **Spacing and Layout:** Ensure consistent padding, margins, and spacing between elements to create a clean, organized, and uncrowded appearance. Use a modular grid system where appropriate.
