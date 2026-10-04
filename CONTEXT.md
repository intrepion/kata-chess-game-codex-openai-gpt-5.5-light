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

**Piece Set**:
The visual design used to represent chess pieces on the board.
_Avoid_: Font, sprites

**Standard Algebraic Notation**:
The chess-literate move notation used as the primary move history display, such as `e4`, `Nf3`, or `O-O`.
_Avoid_: Simple notation, coordinate-only notation

**Coordinate Detail**:
Supplemental origin-and-destination move detail, such as `e2-e4`, used to clarify a move without replacing Standard Algebraic Notation.
_Avoid_: Primary notation, debug notation

**Current Game Persistence**:
Saving the unfinished local game so it can continue after a refresh or reopened browser tab.
_Avoid_: Game archive, account save

**FEN**:
Forsyth-Edwards Notation, a compact text representation of a chess position used for import, export, sharing, and testing.
_Avoid_: Position editor, save file

**Rules Smoke**:
Focused verification that exercises important chess rule edge cases and outcomes before the game is considered playable.
_Avoid_: Render smoke, unit coverage

**Playable Slice**:
A staged increment that can be opened in the browser and exercised by a player, even before the complete game is done.
_Avoid_: Phase, milestone

**Board Slice**:
The first playable slice that renders the board and pieces, supports piece selection, and highlights legal moves.
_Avoid_: Static mockup, render-only slice

**Ordinary Move Loop**:
The core turn cycle for non-special moves and captures, including move history updates.
_Avoid_: Basic movement, partial chess

**Special Rule Slice**:
The playable slice that adds castling, en passant, and promotion choice.
_Avoid_: Edge-case pass, rare rules

**Complete Game Slice**:
The closing slice that combines endgame outcomes, outcome explanations, current game persistence, FEN import/export, and verification.
_Avoid_: Polish pass, final cleanup
