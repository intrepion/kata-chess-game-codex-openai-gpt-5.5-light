# Chess Game

This context defines the shared language for an orthodox browser chess game with a readable local-play experience and light teaching support.

## Language

**Orthodox Chess**:
The standard two-player chess ruleset played on an 8-by-8 board with legal movement, check, checkmate, stalemate, castling, en passant, and promotion.
_Avoid_: Chess-inspired game, variant chess, arcade chess

**Local Game**:
A chess match played by two human players on the same device.
_Avoid_: Online match, engine match, multiplayer session

**Legal Move**:
A move allowed by orthodox chess from the current position, including restrictions caused by check and pinned pieces.
_Avoid_: Possible move, suggested move

**Teaching Cue**:
A lightweight explanation or visual hint that helps a player understand the current chess position without changing the rules of play.
_Avoid_: Tutorial mode, coach engine

**Move History**:
The ordered record of completed moves in the current game.
_Avoid_: Log, transcript

**Captured Pieces**:
The pieces removed from the board by completed captures during the current game.
_Avoid_: Graveyard, taken pieces

**Move Interaction**:
The player's act of selecting a piece and choosing its destination by either click/tap selection or drag-and-drop.
_Avoid_: Mouse controls, drag controls

**Board Orientation**:
The visual direction of the board, including which side appears at the bottom of the screen.
_Avoid_: Camera, viewpoint

**Manual Flip**:
A player-controlled change to board orientation, usually used when passing the device between local players.
_Avoid_: Auto-flip, rotate turn

**Promotion Choice**:
The explicit selection of queen, rook, bishop, or knight when a pawn promotes.
_Avoid_: Auto-queen, promotion prompt

**Outcome Explanation**:
A short teaching cue that explains check, checkmate, stalemate, or another game-ending state.
_Avoid_: Coach analysis, engine commentary

**Half-Move Undo**:
An undo action that reverses the single most recent move by one player.
_Avoid_: Turn undo, rewind
