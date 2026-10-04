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
