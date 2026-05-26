# Initial Instructions for Tracer Development
## Introduction

**Tracer** is a flashcard app that integrates AI features. The user can BYOK and create flashcard sets or study guides from provided PDFs or pictures. They can also link with multiple AI providers using the Vercel AI SDK. Write concise, easy to understand code and remember to double-check for bugs. When you're done (with the prototype), write documentation detailing each program file's purpose.

## Tech Stack

- Use Tauri with Nuxt (consider using TailwindCSS in Nuxt)
- Use SQLite for flashcard set storage (use the plugin: "tauri-plugin-sql" connected with sqlx for Tauri's rust backend)
- Vercel AI SDK for connecting to providers
- Models.dev for a list of providers
- Bun for the package manager
- Use more libraries if needed by your choice

Read the respective documentation thoroughly if needed, especially for Tauri and Nuxt/Vue.

## Frontend

### First Startup

On the first startup, open up a form asking for the user's name, email, and password. Save this information locally.

The app opens with the home page with a list of the flashcard sets and study guides the user has created under the heading "Sets" (if none, write a placeholder element). Below this sets list, there is a "Create" list with items "Basic" for the user manually adding flashcard items, "Synthesize" for merging multiple sets into one with a common theme, or "Generate" to create a study guide and flashcard set from provided PDFs and/or images using AI. The below three sections are detailed descriptions of how each "Create" mode should act.

### Basic

This opens up a new page with a top bar with text spaces "Title" and "Description" to create a title and description for the new flashcard set. Below this, there is an element (bar/rectangle shaped) which has text space "Term" and text space "Definition" right below for a flashcard's term and definition. The user can jump to the next text space using tab. To create a new card, the user can press ctrl/cmd + enter or by pressing a  "+" button below the flashcard form element. The "+" button creates a new flashcard form element with blank "Term" and "Definition". When the user is done entering all flashcards, they can press the "Create" button at the bottom to write the new flashcard set to SQLite. Finally, the user should be redirected to their new flashcard set's page (see section "Flashcard Set Page").

### Synthesize

This mode opens up a new page with a search bar to search for existing flashcard sets. The flashcard sets chosen (by pressing return/enter or the "Add" button to the right of the search bar) display below the search bar. When the user is done, they can press the "Create button" which will:

1. Prompt the **default AI** to generate the set with the provided sets (ask it to **NOT respond with anything that is in the new set (i.e., no "Sure! Here's your formatted set:" or similar dialogue**). Both provided and generated sets should be in the following format:
  ```
  term1, definition1
  term2, definition2
  ...
  ```
2. Take the generated set and and transfer it to the SQLite database.
3. Redirect to the new flashcard set's page.

### Generate

This mode opens up a new page and prompts the user to add files with the button "Open Files". When the user is done, the app will:

1. Prompt the **default AI** to generate the set with the files (PDFs and images) (ask it to **NOT respond with anything that is in the new set (i.e., no "Sure! Here's your formatted set:" or similar dialogue**). Both provided and generated sets should be in the following format:
  ```
  term1, definition1
  term2, definition2
  ...
  ```
2. Take the generated set and and transfer it to the SQLite database.
3. Redirect to the new flashcard set's page.

Below are descriptions for the app's other pages:

### Flashcard Set Page

At the top of this page is the flashcard set's title and below that the description. Below is the (flashcard viewer) first term of the flashcard set in a flashcard-like division/element, below that are the navigation buttons "←" and "→" to move to the next term-definition pair (the user can also use the arrow keys to navigate between cards and space to flip the cards), as well as the ratio number of cards viewed to the total number of cards in between the navigation buttons (in form "a/b"). Right of this flashcard viewer are the buttons (arranged in a grid): "Flashcards", "Learn", "Match", and "Chat".

Also include a button to export the flashcard set, which opens up a modal that lets the user copy the set. A tab ("    ") separates a term from its definition, and each pair is separated by a newline.

Below the flashcard viewer and the button grid is the list of of the term-definition pairs. See the below four sections for extra details about the four modes.

#### Flashcards

This mode is similar to the flashcard viewer described above, but with buttons "Shuffle", "Restart", and "Star". "Shuffle" shuffles the order of the flashcards; "Restart" restarts to the first card and sets the view ratio to 0 and the total number of cards. "Star" saves the card to study for later. When the user finishes the entire deck, open a new page showing their accuracy and whether if they want to use the other modes or restart "Flashcards".

#### Learn

This mode adds multiple choice, true or false, and potentially written questions. Similar to the "Flashcards" mode, when the user finishes the entire deck, open a new page showing their accuracy and whether if they want to use the other modes or restart "Learn".

#### Match

This mode starts with a "Start" button. If the user presses this button, open up a grid of randomly chosen term-definition pairs and scramble them in random grid boxes and there's a timer above. Similarly, when the user finishes the entire deck, open a new page showing their accuracy and whether if they want to use the other modes or restart "Match".

#### Chat

This mode opens up a AI chat interface with an input bar below and the texts of the user on the right and the AI responses on the left.

### Navigation

Every page besides the flashcard modes above has a navigation bar with a button leading to the homepage, a searchbar, and a profile picture of the user, which leads to the "Settings" page (see "Settings" section). Moreover, every page (including the flashcard modes) has a "←" button to go back to the previous page.

### Settings

This opens up a new page with the user's avatar and name on the top. There are options below such as "Dark Mode" (toggle on/off) and "Default AI Model", which by default is none, but the user can press the button "Set" or "Change" (depending on if they have a default model already), which opens up a modal (with buttons "Cancel" and "Enter") with a search bar and list of providers they can choose from. If they click a provider, lead them to the models provided by that provider, and by that point, they can click enter.

#### Provider Authentication

Most providers use API keys, however some use OAuth, such as Github Copilot or Gemini CLI. Therefore, if any of these providers are chosen in settings, use OAuth by opening a modal and providing the user with a URL and code to authenticate for these providers. If needed, research OAuth for proper use.

## Styling

Aim for a clean, consistent, and modern look in the application. Use neutralish colors and include dark/light mode. Don't use too many separators (such as between the navbar and page) as it will make the UI look too busy-looking. If needed, research for clean UI concepts to make the app look professional.

## Backend

Create your own SQLite schema that suits best to the instructions above. However, for the flashcards' table, consider using type JSON in the "terms" column as there may be more complex flashcards in the future (as described below in Future Plans).

## Future Plans

- Interactive flashcards (movable pieces, draggable elements, etc.): read the JSON of the "terms" column to generate these interactive elements accordingly. For now, just keep this in mind but don't implement it.
- Flashcard sharing between users: I'm considering using the AT Protocol to transfer flashcard decks between users. Again, just keep this in mind; don't implement it yet.