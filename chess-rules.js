(function (root) {
  const ChessCtor = root.ChessVendor?.Chess || (typeof require === "function" ? require("chess.js").Chess : null);
  if (!ChessCtor) throw new Error("Chess rules core is unavailable");

  function opposite(color) {
    return color === "w" ? "b" : "w";
  }

  function wrap(chess, history = [], captured = []) {
    return { chess, board: boardFromChess(chess), turn: chess.turn(), history, captured };
  }

  function boardFromChess(chess) {
    const board = {};
    for (const square of chess.SQUARES || "a1 b1 c1 d1 e1 f1 g1 h1 a2 b2 c2 d2 e2 f2 g2 h2 a3 b3 c3 d3 e3 f3 g3 h3 a4 b4 c4 d4 e4 f4 g4 h4 a5 b5 c5 d5 e5 f5 g5 h5 a6 b6 c6 d6 e6 f6 g6 h6 a7 b7 c7 d7 e7 f7 g7 h7 a8 b8 c8 d8 e8 f8 g8 h8".split(" ")) {
      const piece = chess.get(square);
      if (piece) board[square] = piece;
    }
    return board;
  }

  function createGame(source) {
    if (source && typeof source === "object" && source.fen) {
      validateCastlingRooks(source.fen);
      return wrap(new ChessCtor(source.fen), source.history || [], source.captured || []);
    }
    if (source) validateCastlingRooks(source);
    return wrap(source ? new ChessCtor(source) : new ChessCtor());
  }

  function validateCastlingRooks(fen) {
    const [placement, , castling = "-"] = fen.trim().split(/\s+/);
    const board = placementToBoard(placement);
    const required = { K: ["e1", "h1", "K", "R"], Q: ["e1", "a1", "K", "R"], k: ["e8", "h8", "k", "r"], q: ["e8", "a8", "k", "r"] };
    for (const right of castling === "-" ? [] : castling) {
      const [kingSquare, rookSquare, king, rook] = required[right] || [];
      if (!kingSquare || board[kingSquare] !== king || board[rookSquare] !== rook) throw new Error("Invalid FEN castling rights");
    }
  }

  function placementToBoard(placement) {
    const board = {};
    const rows = placement.split("/");
    rows.forEach((row, rowIndex) => {
      let file = 0;
      for (const char of row) {
        if (/\d/.test(char)) file += Number(char);
        else {
          board[coordsToSquare(file, 7 - rowIndex)] = char;
          file += 1;
        }
      }
    });
    return board;
  }

  function pieceAt(game, square) {
    return game.chess.get(square) || null;
  }

  function legalMoves(game, from) {
    return game.chess.moves({ square: from, verbose: true }).map((move) => ({
      from: move.from,
      to: move.to,
      capture: move.captured ? { color: opposite(move.color), type: move.captured } : null,
      promotion: move.flags.includes("p"),
      enPassant: move.flags.includes("e"),
      castle: move.flags.includes("k") ? "K" : move.flags.includes("q") ? "Q" : null,
      san: move.san
    }));
  }

  function makeMove(game, from, to, promotion = "q") {
    const chess = new ChessCtor(game.chess.fen());
    let move = null;
    try {
      move = chess.move({ from, to, promotion });
    } catch (error) {
      move = null;
    }
    if (!move) return { ok: false, game, reason: "Illegal move" };
    const captured = move.captured ? { color: opposite(move.color), type: move.captured } : null;
    const historyMove = {
      from: move.from,
      to: move.to,
      san: move.san,
      coordinate: `${move.from}-${move.to}`,
      fen: move.before,
      piece: { color: move.color, type: move.piece },
      captured
    };
    const next = wrap(chess, [...game.history, historyMove], captured ? [...game.captured, captured] : [...game.captured]);
    return { ok: true, game: next, move: historyMove };
  }

  function allLegalMoves(game) {
    return game.chess.moves({ verbose: true }).map((move) => ({ from: move.from, to: move.to, san: move.san }));
  }

  function outcome(game) {
    if (game.chess.isCheckmate()) return { type: "checkmate", winner: opposite(game.chess.turn()) };
    if (game.chess.isStalemate()) return { type: "stalemate", winner: null };
    if (game.chess.isCheck()) return { type: "check", winner: null };
    return { type: "playing", winner: null };
  }

  function toFEN(game) {
    return game.chess.fen();
  }

  function fromFEN(fen) {
    return createGame(fen);
  }

  function undo(game) {
    const last = game.history.at(-1);
    if (!last) return game;
    const restored = createGame(last.fen);
    restored.history = game.history.slice(0, -1);
    restored.captured = game.captured.slice(0, last.captured ? -1 : undefined);
    return restored;
  }

  function serialize(game) {
    return JSON.stringify({ fen: toFEN(game), history: game.history, captured: game.captured });
  }

  function deserialize(serialized) {
    const parsed = JSON.parse(serialized);
    if (typeof parsed === "string") return createGame(parsed);
    return createGame(parsed);
  }

  function squareToCoords(square) {
    return { file: "abcdefgh".indexOf(square[0]), rank: Number(square[1]) - 1 };
  }

  function coordsToSquare(file, rank) {
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
    return `${"abcdefgh"[file]}${rank + 1}`;
  }

  root.ChessRules = { createGame, legalMoves, makeMove, allLegalMoves, outcome, toFEN, fromFEN, undo, pieceAt, serialize, deserialize, squareToCoords, coordsToSquare };
})(typeof window === "undefined" ? globalThis : window);
