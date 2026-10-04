(function (root) {
  const FILES = "abcdefgh";
  const BACK = ["r", "n", "b", "q", "k", "b", "n", "r"];

  function opposite(color) {
    return color === "w" ? "b" : "w";
  }

  function squareToCoords(square) {
    return { file: FILES.indexOf(square[0]), rank: Number(square[1]) - 1 };
  }

  function coordsToSquare(file, rank) {
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
    return `${FILES[file]}${rank + 1}`;
  }

  function cloneBoard(board) {
    return Object.fromEntries(Object.entries(board).map(([square, piece]) => [square, { ...piece }]));
  }

  function startingBoard() {
    const board = {};
    for (let file = 0; file < 8; file += 1) {
      board[`${FILES[file]}2`] = { color: "w", type: "p" };
      board[`${FILES[file]}7`] = { color: "b", type: "p" };
      board[`${FILES[file]}1`] = { color: "w", type: BACK[file] };
      board[`${FILES[file]}8`] = { color: "b", type: BACK[file] };
    }
    return board;
  }

  function createGame(fen) {
    if (fen) return fromFEN(fen);
    return {
      board: startingBoard(),
      turn: "w",
      castling: { K: true, Q: true, k: true, q: true },
      enPassant: "-",
      halfmove: 0,
      fullmove: 1,
      history: [],
      captured: []
    };
  }

  function pieceAt(game, square) {
    return game.board[square] || null;
  }

  function slideMoves(game, from, piece, directions, attacksOnly) {
    const moves = [];
    const { file, rank } = squareToCoords(from);
    for (const [df, dr] of directions) {
      let f = file + df;
      let r = rank + dr;
      while (coordsToSquare(f, r)) {
        const to = coordsToSquare(f, r);
        const target = pieceAt(game, to);
        if (!target) {
          if (!attacksOnly) moves.push({ from, to });
        } else {
          if (target.color !== piece.color) moves.push({ from, to, capture: target });
          break;
        }
        f += df;
        r += dr;
      }
    }
    return moves;
  }

  function pseudoMoves(game, from, attacksOnly = false) {
    const piece = pieceAt(game, from);
    if (!piece) return [];
    const moves = [];
    const { file, rank } = squareToCoords(from);
    const add = (f, r, extra = {}) => {
      const to = coordsToSquare(f, r);
      if (!to) return;
      const target = pieceAt(game, to);
      if (target && target.color === piece.color) return;
      if (!attacksOnly || piece.type !== "p") moves.push({ from, to, capture: target || null, ...extra });
    };

    if (piece.type === "p") {
      const dir = piece.color === "w" ? 1 : -1;
      const startRank = piece.color === "w" ? 1 : 6;
      const promotionRank = piece.color === "w" ? 7 : 0;
      for (const df of [-1, 1]) {
        const to = coordsToSquare(file + df, rank + dir);
        if (!to) continue;
        const target = pieceAt(game, to);
        if (attacksOnly) {
          moves.push({ from, to });
        } else if (target && target.color !== piece.color) {
          moves.push({ from, to, capture: target, promotion: rank + dir === promotionRank });
        } else if (to === game.enPassant) {
          moves.push({ from, to, enPassant: true, capture: { color: opposite(piece.color), type: "p" } });
        }
      }
      if (!attacksOnly) {
        const one = coordsToSquare(file, rank + dir);
        const two = coordsToSquare(file, rank + dir * 2);
        if (one && !pieceAt(game, one)) {
          moves.push({ from, to: one, promotion: rank + dir === promotionRank });
          if (rank === startRank && two && !pieceAt(game, two)) moves.push({ from, to: two, doublePawn: true });
        }
      }
      return moves;
    }

    if (piece.type === "n") {
      for (const [df, dr] of [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]) add(file + df, rank + dr);
      return moves;
    }

    if (piece.type === "b") return slideMoves(game, from, piece, [[1, 1], [1, -1], [-1, 1], [-1, -1]], attacksOnly);
    if (piece.type === "r") return slideMoves(game, from, piece, [[1, 0], [-1, 0], [0, 1], [0, -1]], attacksOnly);
    if (piece.type === "q") return slideMoves(game, from, piece, [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]], attacksOnly);

    if (piece.type === "k") {
      for (const df of [-1, 0, 1]) {
        for (const dr of [-1, 0, 1]) {
          if (df || dr) add(file + df, rank + dr);
        }
      }
      if (!attacksOnly && !isInCheck(game, piece.color)) {
        if (piece.color === "w" && from === "e1") {
          if (game.castling.K && !pieceAt(game, "f1") && !pieceAt(game, "g1") && !isSquareAttacked(game, "f1", "b") && !isSquareAttacked(game, "g1", "b")) moves.push({ from, to: "g1", castle: "K" });
          if (game.castling.Q && !pieceAt(game, "d1") && !pieceAt(game, "c1") && !pieceAt(game, "b1") && !isSquareAttacked(game, "d1", "b") && !isSquareAttacked(game, "c1", "b")) moves.push({ from, to: "c1", castle: "Q" });
        }
        if (piece.color === "b" && from === "e8") {
          if (game.castling.k && !pieceAt(game, "f8") && !pieceAt(game, "g8") && !isSquareAttacked(game, "f8", "w") && !isSquareAttacked(game, "g8", "w")) moves.push({ from, to: "g8", castle: "k" });
          if (game.castling.q && !pieceAt(game, "d8") && !pieceAt(game, "c8") && !pieceAt(game, "b8") && !isSquareAttacked(game, "d8", "w") && !isSquareAttacked(game, "c8", "w")) moves.push({ from, to: "c8", castle: "q" });
        }
      }
    }
    return moves;
  }

  function isSquareAttacked(game, square, byColor) {
    return Object.entries(game.board).some(([from, piece]) => piece.color === byColor && pseudoMoves(game, from, true).some((move) => move.to === square));
  }

  function kingSquare(game, color) {
    return Object.entries(game.board).find(([, piece]) => piece.color === color && piece.type === "k")?.[0] || null;
  }

  function isInCheck(game, color) {
    const king = kingSquare(game, color);
    return king ? isSquareAttacked(game, king, opposite(color)) : false;
  }

  function applyMoveToClone(game, move, promotion = "q") {
    const next = { ...game, board: cloneBoard(game.board), castling: { ...game.castling }, history: [...game.history], captured: [...game.captured] };
    const piece = next.board[move.from];
    const target = next.board[move.to];
    delete next.board[move.from];
    if (move.enPassant) {
      const { file, rank } = squareToCoords(move.to);
      delete next.board[coordsToSquare(file, rank + (piece.color === "w" ? -1 : 1))];
    }
    next.board[move.to] = { color: piece.color, type: move.promotion ? promotion : piece.type };
    if (move.castle) {
      const rookMove = { K: ["h1", "f1"], Q: ["a1", "d1"], k: ["h8", "f8"], q: ["a8", "d8"] }[move.castle];
      next.board[rookMove[1]] = next.board[rookMove[0]];
      delete next.board[rookMove[0]];
    }
    if (piece.type === "k") {
      if (piece.color === "w") next.castling.K = next.castling.Q = false;
      else next.castling.k = next.castling.q = false;
    }
    if (piece.type === "r") {
      if (move.from === "h1") next.castling.K = false;
      if (move.from === "a1") next.castling.Q = false;
      if (move.from === "h8") next.castling.k = false;
      if (move.from === "a8") next.castling.q = false;
    }
    if (target?.type === "r") {
      if (move.to === "h1") next.castling.K = false;
      if (move.to === "a1") next.castling.Q = false;
      if (move.to === "h8") next.castling.k = false;
      if (move.to === "a8") next.castling.q = false;
    }
    next.enPassant = "-";
    if (move.doublePawn) {
      const { file, rank } = squareToCoords(move.from);
      next.enPassant = coordsToSquare(file, rank + (piece.color === "w" ? 1 : -1));
    }
    next.turn = opposite(game.turn);
    if (game.turn === "b") next.fullmove += 1;
    next.halfmove = piece.type === "p" || target || move.enPassant ? 0 : next.halfmove + 1;
    return next;
  }

  function legalMoves(game, from) {
    const piece = pieceAt(game, from);
    if (!piece || piece.color !== game.turn) return [];
    return pseudoMoves(game, from).filter((move) => !isInCheck(applyMoveToClone(game, move), piece.color));
  }

  function makeMove(game, from, to, promotion = "q") {
    const move = legalMoves(game, from).find((candidate) => candidate.to === to);
    if (!move) return { ok: false, game, reason: "Illegal move" };
    const before = toFEN(game);
    const movingPiece = pieceAt(game, from);
    const captured = move.enPassant ? { color: opposite(movingPiece.color), type: "p" } : pieceAt(game, to);
    const next = applyMoveToClone(game, move, promotion);
    const notation = san(game, move, promotion);
    next.history.push({ from, to, san: notation, coordinate: `${from}-${to}`, fen: before, piece: movingPiece, captured: captured || null });
    if (captured) next.captured.push(captured);
    return { ok: true, game: next, move: next.history[next.history.length - 1] };
  }

  function san(game, move, promotion) {
    const piece = pieceAt(game, move.from);
    if (move.castle) return move.castle === "K" || move.castle === "k" ? "O-O" : "O-O-O";
    const target = pieceAt(game, move.to);
    const capture = target || move.enPassant;
    const name = piece.type === "p" ? "" : piece.type.toUpperCase();
    const pawnFile = piece.type === "p" && capture ? move.from[0] : "";
    const promo = move.promotion ? `=${promotion.toUpperCase()}` : "";
    const after = applyMoveToClone(game, move, promotion);
    const check = isInCheck(after, after.turn);
    const mate = check && allLegalMoves(after).length === 0;
    return `${name}${pawnFile}${capture ? "x" : ""}${move.to}${promo}${mate ? "#" : check ? "+" : ""}`;
  }

  function allLegalMoves(game) {
    return Object.keys(game.board).flatMap((square) => legalMoves(game, square));
  }

  function outcome(game) {
    const moves = allLegalMoves(game);
    const check = isInCheck(game, game.turn);
    if (moves.length === 0 && check) return { type: "checkmate", winner: opposite(game.turn) };
    if (moves.length === 0) return { type: "stalemate", winner: null };
    if (check) return { type: "check", winner: null };
    return { type: "playing", winner: null };
  }

  function toFEN(game) {
    const rows = [];
    for (let rank = 7; rank >= 0; rank -= 1) {
      let row = "";
      let empty = 0;
      for (let file = 0; file < 8; file += 1) {
        const piece = pieceAt(game, coordsToSquare(file, rank));
        if (!piece) empty += 1;
        else {
          if (empty) row += empty;
          empty = 0;
          row += piece.color === "w" ? piece.type.toUpperCase() : piece.type;
        }
      }
      if (empty) row += empty;
      rows.push(row);
    }
    const castle = ["K", "Q", "k", "q"].filter((key) => game.castling[key]).join("") || "-";
    return `${rows.join("/")} ${game.turn} ${castle} ${game.enPassant} ${game.halfmove} ${game.fullmove}`;
  }

  function fromFEN(fen) {
    const [placement, turn, castle = "-", enPassant = "-", halfmove = "0", fullmove = "1"] = fen.trim().split(/\s+/);
    const board = {};
    const rows = placement.split("/");
    if (rows.length !== 8) throw new Error("Invalid FEN placement");
    rows.forEach((row, rowIndex) => {
      let file = 0;
      for (const char of row) {
        if (/\d/.test(char)) file += Number(char);
        else {
          const color = char === char.toUpperCase() ? "w" : "b";
          board[coordsToSquare(file, 7 - rowIndex)] = { color, type: char.toLowerCase() };
          file += 1;
        }
      }
      if (file !== 8) throw new Error("Invalid FEN row");
    });
    return {
      board,
      turn,
      castling: { K: castle.includes("K"), Q: castle.includes("Q"), k: castle.includes("k"), q: castle.includes("q") },
      enPassant,
      halfmove: Number(halfmove),
      fullmove: Number(fullmove),
      history: [],
      captured: []
    };
  }

  function undo(game) {
    const last = game.history.at(-1);
    if (!last) return game;
    const restored = fromFEN(last.fen);
    restored.history = game.history.slice(0, -1);
    restored.captured = game.captured.slice(0, last.captured ? -1 : undefined);
    return restored;
  }

  root.ChessRules = { createGame, legalMoves, makeMove, allLegalMoves, outcome, toFEN, fromFEN, undo, pieceAt, squareToCoords, coordsToSquare };
})(typeof window === "undefined" ? globalThis : window);
