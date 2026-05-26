# Fix Wave 1
The following sections are improvements for you (the AI agent) to implement for this project. Each section (starting with "##") includes a title describing vaguely the fix to be made, as well as parenthesis containing the recommended path to the file in which to implement the fix; however, if you find that the provided path is not right to implement the fix, that there is definitely a better path in which to implement the feature, and/or that implementing the fix in this provided path can cause significant bugs, then please implement the fix in another path. Please scrutinize the more detailed instructions instead of just reading the title. Moreover, each section contains more detailed descriptions and instructions to implement the fix said in the title of the section.

Unless a code alteration is necessary to solve the following fixes, do not implement any other features or programs not stated in this instruction file; follow this file's instructions as closely as possible unless the instructions will cause an even worse bug than in this project right now.

Unless the instructions state otherwise, follow the existing UI principles, patterns, and looks of this project (e.g., minimalist & mostly neutral colors). Ignore the orange colors as part of the UI patterns (as they are experimental). For now, buttons and most other UI elements should be in neutral colors.

The implementations for the fixes should not introduce security bugs to this project. Please double check that your implementations do not do so. Moreover, you (the AI agent) should solve the problems as described below to the best of your ability as implied.


## Animation for Flashcard Flipping (./pages/set/[id].vue)
  ### Description of Problem
    In a flashcard set with the Flashcard mode selected, "flipping" a card (i.e., by clicking on the card or pressing the Space key) displays the other side of the card immediately (i.e., if the "Term" side is showing, "Definition" shows immediately after flipping and vice versa with no animation).

  ### Method to Fix
    Add an animation when flipping the card. The recommended place of the fix is at around lines 246-266 in ./pages/set/[id].vue (around where there is the <p> tag containing `{{ isFlipped ? "Definition" : "Term" }}`). Your fix should create an animation that seems like a natural flip, where the card's height gets smaller until the card almost seems like it disappeared, and then the card's height will increase back to its original height value. The span of this animation should take about 500 milliseconds, with it not taking over 1 second. Adjust the animation speed if necessary.

## Animation for Moving to Previous/Next Flashcard (./pages/set/[id].vue)
  ### Description of Problem
    In a flashcard set with the Flashcards mode selected, moving to the previous or next card (i.e., by pressing the "← Prev" or "Next →" buttons or pressing the left or right arrow keys) displays the previous/next card immediately (i.e., no animation for moving to the previous or next card).

  ### Method to Fix
    Add an animation when moving to the previous or next card. The recommended place of the fix is between lines 270-298 in ./pages/set/[id].vue (i.e, the location of the "← Prev" and "Next →" buttons). Your fix should create an animation that seems like a natural swipe. When "← Prev" is pressed, the card right now should look like it is moving to the right and fades to nothing, then revealing/moving onto the previous card in the set. When "Next →" is pressed, the card right now should look like it is moving to the left and fades to nothing, then revealing/moving onto the next card in the set. Both of these transitions/animations should take around 500 milliseconds.

## Fix Back Button Behavior (./components/BackButton.vue)
  ### Description of Problem
    This app seems to save the total pages visited in a session, even with repeats (i.e., going back to the same page). The "← Back" button always goes to the previous page visited, and when in Flashcards mode in a flashcard set, the "← Back" button goes to the previous flashcard viewed in the set.
    
  ### Method to Fix
    The "← Back" button should instead have the following behavior:
    1. When in a flashcard set, clicking the "← Back" button would go back to the homepage
    2. When in the Settings page, clicking the "← Back" button would go back to the previous page
    3. When in the homepage, disable the back button

    As described in the title, the fix should probably be implemented at ./components/BackButton.vue, but other files may have contributed to the bug. If this is true, also implement a fix in other files causing this bug, or if BackButton.vue actually doesn't cause this bug, then just implement fixes in those files.

## Make Star Feature More Prominent (./pages/set/[id].vue)
  ### Description of Problem
    While starring a card does persist its starred state, it is not very obvious whether it is starred. Only the "Star" button indicates a card's starred state with its text changing to "Unstar", which isn't very obvious.

  ### Method to Fix
    In the "Terms" section of a flashcard set page, add a small star button to the top right hand corner of each term-definition pair. When that term-definition pair (flashcard) is unstarred, the star button is a star icon with a transparent fill and a black border color (or white border color in dark mode). When it is starred, the star is fully yellow with a yellow color and its color stays constant across light and dark mode. By clicking the star, it toggles the star state of that term-definition pair/flashcard (as implied, this star state is the same state as the one used in the "Star" button in Flashcards mode) and, as implied, changes the star's appearance from transparent fill to yellow, or vice versa.

## Add a Download Option for Export (./pages/set/[id].vue)
  ### Description of Problem
    When the "Export" button is pressed from a flashcard set, there is only a "Copy" option.

  ### Method to Fix
    Add a "Download" button right of the "Copy" button in the Export modal. When "Download" is pressed, a .txt file containing the set. A tab ("    ") separates a term from its definition, and each pair is separated by a newline. The fix should probably be made at around lines 959-960 in ./pages/set/[id].vue.

## Match Mode Shouldn't Be a Memory Game by Default (./pages/set/[id].vue)
  ### Description of Problem
    In Match Mode, the cards need to be flipped (by clicking) to view the content (term or definition), like a memory game.
    
  ### Method to Fix
    Add a toggle above the grid of cards while in Match Mode titled "Memory" that is off by default. When it is off, the content is visible without clicking the cards. Otherwise, when Memory mode is off, it is the same as the Match Mode right now: clicking the card selects it, clicking again deselects it, etc. When Memory mode is on, it is exactly the same as Match Mode right now. "exactly the same" excludes the following fix proposal below.

## Match Mode Should Count the Time Played (i.e., counting from 0) (./pages/set/[id].vue)
  ### Description of Problem
    In Match Mode, the timer counts down from one minute.

  ### Method to Fix
    Change the timer to a stopwatch, counting up from 0 seconds. If the time reaches 10 minutes, go to the results.

## Add Separate and Dedicated Pages for Flashcards, Learn, and Match modes (./pages/set/[id].vue)
  ### Description of Problem
    The modes switches below the four mode buttons, without offering full page views.

  ### Method to Fix
    For each of the mode buttons (lines 65-141 in ./pages/set/[id].vue), add a button with an export-like icon (a square with an arrow starting in its center and moving diagonally up & right; feel free to import it); only Chat Mode doesn't get this new open in new page button. When clicked, the app opens up the respective mode (as described in the following sections) in a new page.
    
  #### For Flashcards Mode
    This looks extremely similar to the existing Flashcards mode in the sets page, except it takes up the whole screen. The card takes up nearly the full width of the viewport (with some margin on each side, of course), and leaves some space on the top and bottom for the "Flashcards" text, "Space to flip · ←/→ to browse · Mark correct/incorrect to progress" text, progress ("# viewed/total"), "Shuffle", "Restart", "← Prev" and "Next →", "Star", "Missed it", and "Got it" buttons, also in their same relative places as the existing flashcard mode; however, these elements are closer to the sides of the page, with most blankspace between them, which is like how it is in this existing mode. When the flashcards are all went through, the Results page should take up more space by increasing the text and button sizes. The "← Back" button is also present in this page, and leads back to the sets page.
    
  #### For Learn Mode
    This looks similar to the existing Learn Mode, except it takes up the whole screen. Similar to the fullscreen Flashcards Mode, the content, which is the questions in this case, takes up whole page except for some margin on the sides as well as some space at the top for "Learn" text, "Answer questions · Results tracked per run" text, progress, and "Restart" button. When all questions are answered, the Results page should take up more space by increasing the text and button sizes. The "← Back" button is also present in this page, and leads back to the sets page.
    
  #### For Match Mode
    This looks similar to the existing Match Mode, except it takes up the whole screen. Similar to the other fullscreen modes, the content, which is the card grid in this case, should scale up to the whole page except for some margin space on the sides and some space to make room for "Match" text, "Match the pairs · Click "Memory" to toggle memory mode" text, time, progress, "Restart" button, etc. When all cards are matched, the Results page should take up more space by increasing the text and button sizes. The "← Back" button is also present in this page, and leads back to the sets page.
    

## Future Implementations
  This section is not for you (the AI agent) to concern/implement right now. This is only for me (the human/user) to remember the following improvements
  
  - Give Some Suggestions and/or Second Tries for Missed Cards at the End (results)
  - Add AI correctness checking feature when creating a card in Basic Mode
  - Implement Other Options for Learn Mode