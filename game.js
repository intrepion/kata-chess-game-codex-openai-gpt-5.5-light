(function () {
  const { ChessRules } = window;
  const STORAGE_KEY = "quiet-chess-current";
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("turn-status");
  const historyEl = document.getElementById("move-history");
  const capturedEl = document.getElementById("captured-pieces");
  const fenBox = document.getElementById("fen-box");
  const ariaStatus = document.getElementById("aria-status");
  const debugState = document.getElementById("debug-state");
  const promotionModal = document.getElementById("promotion-modal");
  const promotionChoices = document.getElementById("promotion-choices");
  const pieceNames = { k: "King", q: "Queen", r: "Rook", b: "Bishop", n: "Knight", p: "Pawn" };
  const pieceLetters = { k: "K", q: "Q", r: "R", b: "B", n: "N", p: "" };
  let game = loadGame();
  let selected = null;
  let legalTargets = [];
  let flipped = false;
  let muted = false;
  let pendingPromotion = null;
  let pointerFrom = null;

  function loadGame() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) return ChessRules.deserialize(serialized);
    } catch (error) {}
    return ChessRules.createGame();
  }

  function saveGame() {
    try {
      localStorage.setItem(STORAGE_KEY, ChessRules.serialize(game));
    } catch (error) {}
  }

  function squareOrder() {
    const files = flipped ? "hgfedcba" : "abcdefgh";
    const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    return ranks.flatMap((rank) => [...files].map((file) => `${file}${rank}`));
  }

  function pieceSvg(piece) {
    const fill = piece.color === "w" ? "#f8fbff" : "#17202a";
    const stroke = piece.color === "w" ? "#17202a" : "#f8fbff";
    const label = pieceLetters[piece.type] || "P";
    return `<svg class="piece" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="29" r="15" fill="${fill}" stroke="${stroke}" stroke-width="5"></circle>
      <path d="M25 82h50l-8-31H33z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"></path>
      <path d="M32 90h36" stroke="${stroke}" stroke-width="7" stroke-linecap="round"></path>
      <text x="50" y="61" text-anchor="middle" font-size="28" font-weight="800" fill="${stroke}" font-family="Arial">${label}</text>
    </svg>`;
  }

  function render() {
    boardEl.innerHTML = "";
    const outcome = ChessRules.outcome(game);
    const checkSquare = outcome.type === "check" || outcome.type === "checkmate" ? Object.entries(game.board).find(([, piece]) => piece.type === "k" && piece.color === game.turn)?.[0] : null;
    for (const square of squareOrder()) {
      const { file, rank } = ChessRules.squareToCoords(square);
      const piece = ChessRules.pieceAt(game, square);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `square ${(file + rank) % 2 ? "dark" : "light"}`;
      button.dataset.square = square;
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", `${square}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${pieceNames[piece.type]}` : " empty"}`);
      button.draggable = Boolean(piece && piece.color === game.turn);
      if (square === selected) button.classList.add("selected");
      if (legalTargets.some((move) => move.to === square)) button.classList.add(piece ? "capture" : "legal");
      if (square === checkSquare) button.classList.add("check");
      if (piece) button.innerHTML = pieceSvg(piece);
      button.addEventListener("click", () => onSquareClick(square));
      button.addEventListener("dragstart", (event) => onDragStart(event, square));
      button.addEventListener("dragover", (event) => event.preventDefault());
      button.addEventListener("drop", (event) => onDrop(event, square));
      button.addEventListener("pointerdown", () => onPointerDown(square));
      button.addEventListener("pointerup", () => onPointerUp(square));
      button.addEventListener("keydown", (event) => onSquareKey(event, square));
      boardEl.appendChild(button);
    }
    const label = outcomeLabel(outcome);
    statusEl.textContent = label;
    ariaStatus.textContent = label;
    fenBox.value = ChessRules.toFEN(game);
    renderHistory();
    renderCaptured();
    exposeDebug();
    saveGame();
  }

  function outcomeLabel(outcome) {
    if (outcome.type === "checkmate") return `${outcome.winner === "w" ? "White" : "Black"} wins by checkmate.`;
    if (outcome.type === "stalemate") return "Draw by stalemate.";
    if (outcome.type === "check") return `${game.turn === "w" ? "White" : "Black"} to move, in check.`;
    return `${game.turn === "w" ? "White" : "Black"} to move.`;
  }

  function renderHistory() {
    historyEl.innerHTML = "";
    game.history.forEach((move, index) => {
      const item = document.createElement("li");
      item.textContent = `${move.san} (${move.coordinate})`;
      item.title = move.coordinate;
      historyEl.appendChild(item);
    });
  }

  function renderCaptured() {
    capturedEl.textContent = game.captured.length
      ? game.captured.map((piece) => `${piece.color === "w" ? "White" : "Black"} ${pieceNames[piece.type]}`).join(", ")
      : "None";
  }

  function onSquareClick(square) {
    if (pendingPromotion) return;
    const piece = ChessRules.pieceAt(game, square);
    if (selected && legalTargets.some((move) => move.to === square)) {
      attemptMove(selected, square);
      return;
    }
    if (piece && piece.color === game.turn) selectSquare(square);
    else clearSelection();
  }

  function selectSquare(square) {
    selected = square;
    legalTargets = ChessRules.legalMoves(game, square);
    render();
  }

  function clearSelection() {
    selected = null;
    legalTargets = [];
    render();
  }

  function attemptMove(from, to, promotion) {
    const move = ChessRules.legalMoves(game, from).find((candidate) => candidate.to === to);
    if (move?.promotion && !promotion) {
      pendingPromotion = { from, to };
      showPromotion();
      return;
    }
    const result = ChessRules.makeMove(game, from, to, promotion || "q");
    if (!result.ok) {
      announce(result.reason);
      clearSelection();
      return;
    }
    game = result.game;
    clearSelectionState();
    const postMoveOutcome = ChessRules.outcome(game);
    if (postMoveOutcome.type === "checkmate" || postMoveOutcome.type === "stalemate") playTone(180);
    else if (postMoveOutcome.type === "check") playTone(620);
    else playTone(result.move.captured ? 260 : 420);
    render();
  }

  function clearSelectionState() {
    selected = null;
    legalTargets = [];
    pendingPromotion = null;
  }

  function showPromotion() {
    promotionChoices.innerHTML = "";
    for (const type of ["q", "r", "b", "n"]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = pieceNames[type];
      button.addEventListener("click", () => {
        const pending = pendingPromotion;
        promotionModal.hidden = true;
        attemptMove(pending.from, pending.to, type);
      });
      promotionChoices.appendChild(button);
    }
    promotionModal.hidden = false;
  }

  function onDragStart(event, square) {
    const piece = ChessRules.pieceAt(game, square);
    if (!piece || piece.color !== game.turn) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", square);
    selectSquare(square);
  }

  function onDrop(event, square) {
    event.preventDefault();
    const from = event.dataTransfer.getData("text/plain");
    if (from) attemptMove(from, square);
  }

  function onPointerDown(square) {
    const piece = ChessRules.pieceAt(game, square);
    pointerFrom = piece && piece.color === game.turn ? square : null;
    if (pointerFrom) selectSquare(pointerFrom);
  }

  function onPointerUp(square) {
    if (!pointerFrom || pointerFrom === square) return;
    const from = pointerFrom;
    pointerFrom = null;
    attemptMove(from, square);
  }

  function onSquareKey(event, square) {
    const current = squareOrder().indexOf(square);
    const moveFocus = (offset) => {
      const next = boardEl.querySelectorAll(".square")[Math.max(0, Math.min(63, current + offset))];
      next?.focus();
    };
    if (event.key === "ArrowRight") { event.preventDefault(); moveFocus(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); moveFocus(-1); }
    if (event.key === "ArrowDown") { event.preventDefault(); moveFocus(8); }
    if (event.key === "ArrowUp") { event.preventDefault(); moveFocus(-8); }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSquareClick(square);
    }
  }

  function announce(message) {
    ariaStatus.textContent = message;
  }

  function playTone(frequency) {
    if (muted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.045;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.08);
  }

  function exposeDebug() {
    const state = {
      fen: ChessRules.toFEN(game),
      turn: game.turn,
      selected,
      legalTargets: legalTargets.map((move) => move.to),
      history: game.history.map((move) => move.san),
      outcome: ChessRules.outcome(game)
    };
    debugState.textContent = JSON.stringify(state);
    window.__quietChessDebug = {
      state,
      setFen(fen) {
        game = ChessRules.createGame(fen);
        clearSelectionState();
        render();
      },
      move(from, to, promotion) {
        attemptMove(from, to, promotion);
      }
    };
  }

  document.getElementById("new-game").addEventListener("click", () => {
    game = ChessRules.createGame();
    clearSelectionState();
    render();
  });
  document.getElementById("flip-board").addEventListener("click", () => {
    flipped = !flipped;
    render();
  });
  document.getElementById("undo-move").addEventListener("click", () => {
    game = ChessRules.undo(game);
    clearSelectionState();
    render();
  });
  document.getElementById("mute-sound").addEventListener("click", (event) => {
    muted = !muted;
    event.currentTarget.setAttribute("aria-pressed", String(muted));
    event.currentTarget.textContent = muted ? "Unmute" : "Mute";
  });
  document.getElementById("copy-fen").addEventListener("click", async () => {
    fenBox.select();
    try { await navigator.clipboard.writeText(fenBox.value); } catch (error) {}
  });
  document.getElementById("load-fen").addEventListener("click", () => {
    try {
      game = ChessRules.createGame(fenBox.value);
      clearSelectionState();
      render();
    } catch (error) {
      announce("Invalid FEN.");
    }
  });

  render();
})();
