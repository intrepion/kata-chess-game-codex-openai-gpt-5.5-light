# Keep Direct File Packaging Committed

The static app will use committed files such as `index.html`, `styles.css`, `game.js`, and `chess-rules.js` instead of requiring generated build output for the first slice. This keeps the double-click launch path honest and avoids adding a build step before the game needs one.
