<div align="center">
    <img src="/src-tauri/icons/128x128.png" alt="Tracer logo" width="120" />
    <h1>Tracer</h1>
</div>

## What is Tracer?
**Tracer** is a free flashcard app to help you study. It strives to provide many of the features of proprietary flashcard software such as Quizlet or Knowt, while being easier to use than Anki.

Its main features are:
- 3 modes for flashcard creation: basic (manual creation), synthesis (combining existing sets), and generate (using AI to generate sets from provided PDFs and images)
- 3 study modes: flashcards, learn (multiple choice and true or false questions), and match
- Integrated AI chat that supports OpenAI, Anthropic, Google, and OpenAI Compatible (OAuth providers such as GitHub Copilot is not supported yet)

## Installation
Go to the latest [release](https://github.com/3icecreamsandwich/Tracer/releases) to install. Windows, macOS, and Linux are the only supported platforms.

## How to Use
On first startup, provide a username, email, and password. Don't worry---everything stays local (for now), including your login details. These details are required for future features to be implemented, such as flashcard set sharing.

Once you signed up, you'll see the homepage. Your future flashcards are on the left and the create modes are on the right.

Tracer may require your password to unlock for subsequent sessions. You can disable this with the "Require password on startup" toggle in Settings. The Settings is also where you provide your API keys for AI features, toggling Dark mode, etc.

## Credits
- **Tauri**, as the app framework Tracer uses
- **Nuxt/Vue** for frontend
- **TailwindCSS** for UI styling
- And other open source projects...

## License
Tracer is licensed under [GPL-3.0](LICENSE).