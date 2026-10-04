const test = require("node:test");
const assert = require("node:assert/strict");
require("../chess-rules.js");

const { ChessRules } = globalThis;

test("MVP 1 legal moves highlight normal pawn destinations", () => {
  const game = ChessRules.createGame();
  assert.deepEqual(ChessRules.legalMoves(game, "e2").map((move) => move.to).sort(), ["e3", "e4"]);
});

test("MVP 1 blocks moving an opponent piece on the current turn", () => {
  const game = ChessRules.createGame();
  assert.deepEqual(ChessRules.legalMoves(game, "e7"), []);
});

test("MVP 1 rejects illegal moves", () => {
  const game = ChessRules.createGame();
  const result = ChessRules.makeMove(game, "e2", "e5");
  assert.equal(result.ok, false);
  assert.equal(ChessRules.toFEN(result.game), ChessRules.toFEN(game));
});

test("MVP 2 records ordinary moves, captures, and captured pieces", () => {
  let game = ChessRules.createGame();
  game = ChessRules.makeMove(game, "e2", "e4").game;
  game = ChessRules.makeMove(game, "d7", "d5").game;
  const result = ChessRules.makeMove(game, "e4", "d5");
  assert.equal(result.ok, true);
  assert.equal(result.move.san, "exd5");
  assert.equal(result.game.history.map((move) => move.coordinate).join(","), "e2-e4,d7-d5,e4-d5");
  assert.deepEqual(result.game.captured, [{ color: "b", type: "p" }]);
});

test("MVP 2 undo reverses one half-move", () => {
  let game = ChessRules.createGame();
  game = ChessRules.makeMove(game, "e2", "e4").game;
  const undone = ChessRules.undo(game);
  assert.equal(undone.turn, "w");
  assert.ok(ChessRules.pieceAt(undone, "e2"));
  assert.equal(ChessRules.pieceAt(undone, "e4"), null);
});

test("MVP 3 supports castling", () => {
  const game = ChessRules.createGame("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
  const result = ChessRules.makeMove(game, "e1", "g1");
  assert.equal(result.ok, true);
  assert.equal(ChessRules.pieceAt(result.game, "g1").type, "k");
  assert.equal(ChessRules.pieceAt(result.game, "f1").type, "r");
  assert.equal(result.move.san, "O-O");
});

test("MVP 3 supports en passant", () => {
  let game = ChessRules.createGame();
  game = ChessRules.makeMove(game, "e2", "e4").game;
  game = ChessRules.makeMove(game, "a7", "a6").game;
  game = ChessRules.makeMove(game, "e4", "e5").game;
  game = ChessRules.makeMove(game, "d7", "d5").game;
  const result = ChessRules.makeMove(game, "e5", "d6");
  assert.equal(result.ok, true);
  assert.equal(ChessRules.pieceAt(result.game, "d6").type, "p");
  assert.equal(ChessRules.pieceAt(result.game, "d5"), null);
  assert.deepEqual(result.game.captured.at(-1), { color: "b", type: "p" });
});

test("MVP 3 supports explicit promotion choice", () => {
  const game = ChessRules.createGame("8/P7/8/8/8/8/8/4k2K w - - 0 1");
  const result = ChessRules.makeMove(game, "a7", "a8", "n");
  assert.equal(result.ok, true);
  assert.equal(ChessRules.pieceAt(result.game, "a8").type, "n");
  assert.equal(result.move.san, "a8=N");
});
