import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { ConvexProvider, ConvexReactClient } from "convex-dev/react";
import convexConfig from "../convex.json";
import { useQuery, useMutation, useConvex } from "../convex/_generated";
import { useState, useEffect } from 'react';
import chess from "chess";
import { GameState, minVotePeriod, PlayedMove, MoveOption, sortOptions } from '../common';
import { constructGame } from '../chess';
import { Id } from 'convex-dev/values';



const convex = new ConvexReactClient(convexConfig.origin);


const whitePieceToString = {
  pawn: "♙",
  rook: "♖",
  knight: "♘",
  bishop: "♗",
  queen: "♕",
  king: "♔",
};
const blackPieceToString = {
  pawn: "♟",
  rook: "♜",
  knight: "♞",
  bishop: "♝",
  queen: "♛",
  king: "♚",
};

enum Highlight {
  None = 1,
  Source,
  PossibleDest,
  Hover,
  LastMove,
}

type SquareProps = {
  piece: chess.Piece,
  index: number,
  onClick: (index: number) => void,
  highlight: Highlight,
};

const ChessSquare = ({piece, index, onClick, highlight}: SquareProps) => {
  const isWhite = piece && piece.side.name === "white";
  const pieceStr = piece ? (isWhite ? whitePieceToString[piece.type] : blackPieceToString[piece.type]) : "";
  const colorClass = piece ? (isWhite ? styles.whitepiece : styles.blackpiece) : undefined;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const squareColorClass = ((row + col) % 2 === 0) ? styles.whitesquare : styles.blacksquare;
  let highlightClass: string | undefined = undefined;
  switch (highlight) {
    case Highlight.Source:
      highlightClass = styles.sourcesquare;
      break;
    case Highlight.PossibleDest:
      highlightClass = styles.destsquare;
      break;
    case Highlight.Hover:
      highlightClass = styles.hoversquare;
      break;
    case Highlight.LastMove:
      highlightClass = styles.lastmovesquare;
  }
  return <div className={styles.griditem + " " + (highlightClass ?? squareColorClass)} onClick={() => onClick(index)}>
    <span className={colorClass}><span className={styles.noselect}>{pieceStr}</span></span>
  </div>;
}

const optimisticVote = (
  move: string, 
  options: MoveOption[] | undefined, 
  game: [PlayedMove[], GameState] | null | undefined,
): MoveOption[] | undefined => {
  if (options !== undefined && !!game) {
    const [moves, gameState] = game;
    let newOptions = [...options];
    const option = newOptions.find((existingOption) => existingOption.move === move);
    if (!option) {
      newOptions.push({
        _id: Id.fromString(crypto.randomUUID()),
        gameId: gameState._id,
        moveIndex: gameState.moveCount,
        move,
        votes: 1,
      })
    } else {
      option.votes++;
    }
    sortOptions(newOptions);
    return newOptions;
  }
}

type ChessBoardProps = {
  hoverMove: string | null,
}

const ChessBoard = ({hoverMove}: ChessBoardProps) => {
  const game = useQuery("getGame");
  const createGame = useMutation("createGame");
  const [srcIndex, setSrcIndex] = useState<number | null>(null);
  const voteForOption = useMutation("voteForOption").withOptimisticUpdate(
    (localQueryStore, move) => {
      const options = localQueryStore.getQuery("getOptions", []);
      const newOptions = optimisticVote(move, options, game);
      if (!!newOptions) {
        localQueryStore.setQuery("getOptions", [], newOptions);
      }
    }
  );

  useEffect(() => {
    if (game === null) {
      createGame();
    }
  })
  if (!game) {
    return null;
  }
  const [moves, gameState] = game;
  const gameClient = constructGame(gameState, moves);
  // TODO: display move history?
  const board = gameClient.game.board;
  const squares = board.squares.slice();

  // Reorder squares so rank 1 is at the bottom.
  for (let rank = 0; rank < 4; rank++) {
    const swapRank = 7 - rank;
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      const swapIndex = swapRank * 8 + file;
      const temp = squares[swapIndex];
      squares[swapIndex] = squares[index];
      squares[index] = temp;
    }
  }

  const squareIndexFromSquare = (square: chess.Square): number => {
    const swapRank = 8 - square.rank;
    const file = square.file.charCodeAt(0) - "a".charCodeAt(0);
    return swapRank * 8 + file;
  }

  let validMovesByIndex = new Map<number, chess.ValidMove>();
  for (let validMove of gameClient.validMoves) {
    validMovesByIndex.set(squareIndexFromSquare(validMove.src), validMove);
  }

  const squareMatches = (s1: chess.Square, s2: chess.Square): boolean => {
    return s1.file === s2.file && s1.rank === s2.rank;
  };

  let possibleDestMoves = new Map<number, string>();
  if (srcIndex !== null) {
    const validMoves = validMovesByIndex.get(srcIndex);
    if (!!validMoves) {
      for (let notation in gameClient.notatedMoves) {
        const move = gameClient.notatedMoves[notation];
        if (squareMatches(move.src, validMoves.src)) {
          possibleDestMoves.set(squareIndexFromSquare(move.dest), notation);
        }
      }
    }
  }
  
  let hoverSourceIndex: number | null = null;
  let hoverDestIndex: number | null = null;
  if (hoverMove) {
    const hoverNotatedMove = gameClient.notatedMoves[hoverMove];
    if (hoverNotatedMove) {
      hoverSourceIndex = squareIndexFromSquare(hoverNotatedMove.src);
      hoverDestIndex = squareIndexFromSquare(hoverNotatedMove.dest);
    }
  }

  let lastMoveSrcIndex: number | null = null;
  let lastMoveDestIndex: number | null = null;
  if (gameClient.game.moveHistory.length > 0) {
    const lastMove = gameClient.game.moveHistory[gameClient.game.moveHistory.length - 1];
    if (lastMove) {
      lastMoveSrcIndex = squareIndexFromSquare({piece: lastMove.piece, rank: lastMove.prevRank, file: lastMove.prevFile});
      lastMoveDestIndex = squareIndexFromSquare({piece: lastMove.piece, rank: lastMove.postRank, file: lastMove.postFile});
    }
  }

  const handleClick = (i: number) => {
    if (srcIndex === null) {
      setSrcIndex(i);
    } else if (srcIndex === i) {
      setSrcIndex(null);
    } else {
      const moveNotation = possibleDestMoves.get(i);
      if (moveNotation) {
        voteForOption(moveNotation);
        setSrcIndex(null);
      } else {
        setSrcIndex(i);
      }
    }
  };

  const highlightByIndex = (i: number): Highlight => {
    if (i === srcIndex) {
      return Highlight.Source;
    }
    if (possibleDestMoves.get(i)) {
      return Highlight.PossibleDest;
    }
    if (hoverSourceIndex === i || hoverDestIndex === i) {
      return Highlight.Hover;
    }
    if (lastMoveSrcIndex === i || lastMoveDestIndex === i) {
      return Highlight.LastMove;
    }
    return Highlight.None;
  };

  return (<div className={styles.gridcontainer}>
    {squares.map((square, i) => <ChessSquare
      key={i}
      piece={square.piece}
      index={i} 
      onClick={handleClick}
      highlight={highlightByIndex(i)}
    />)}
  </div>);
};

type OptionsTableProps = {
  options: MoveOption[],
  onMouseEnter: (move: string) => void,
  onMouseLeave: (move: string) => void,
};

const OptionsTable = ({options, onMouseEnter, onMouseLeave}: OptionsTableProps) => {
  if (!options || options.length === 0) {
    return null;
  }
  return (<table className={styles.optionstable}>
    <thead>
      <tr>
        <th>Move</th>
        <th>Votes</th>
      </tr>
    </thead>
    <tbody>
      {options.map(option =>
      <tr
        key={option.move}
        onMouseEnter={() => onMouseEnter(option.move)}
        onMouseLeave={() => onMouseLeave(option.move)}
      >
        <td>{option.move}</td>
        <td>{option.votes}</td>
      </tr>)}
    </tbody>
    </table>);
};

type EntryFormProps = {
  onMouseEnter: (move: string) => void,
  onMouseLeave: (move: string) => void,
};

const EntryForm = ({onMouseEnter, onMouseLeave}: EntryFormProps) => {
  const options = useQuery("getOptions") ?? [];
  const game = useQuery("getGame");
  const voteForOption = useMutation("voteForOption").withOptimisticUpdate(
    (localQueryStore, move) => {
      const options = localQueryStore.getQuery("getOptions", []);
      const newOptions = optimisticVote(move, options, game);
      if (!!newOptions) {
        localQueryStore.setQuery("getOptions", [], newOptions);
      }
    }
  );
  const [moveInput, setMoveInput] = useState("");
  const playMove = useMutation("playMove");
  const [playEnabled, setPlayEnabled] = useState(false);
  let toPlay = "White";
  let sampleMove = "Bxe5";
  let completion: string | null = null;
  if (!!game) {
    const [moves, gameState] = game;
    const gameClient = constructGame(gameState, moves);
    if (gameClient.game.board.lastMovedPiece && gameClient.game.board.lastMovedPiece.side.name === "white") {
      toPlay = "Black";
    }
    for (let possibleMove in gameClient.notatedMoves) {
      sampleMove = possibleMove;
      break;
    }
    const anyGame: any = gameClient;
    if (anyGame["isCheckmate"]) {
      completion = "Checkmate!";
      sampleMove = "restart";
    }
    if (gameClient.isStalemate) {
      completion = "Stalemate!";
      sampleMove = "restart";
    }
    if (gameClient.isRepetition) {
      completion = "Stalemate by Repetition!";
      sampleMove = "restart";
    }
  }
  if (completion) {
    console.log(completion);
  }

  const handleInputChange = (event: any) => {
    setMoveInput(event.target.value);
  };
  const submit = () => {
    if (moveInput && moveInput.length > 0) {
      voteForOption(moveInput);
      setMoveInput("");
    }
  };
  const play = () => {
    playMove();
  }
  const updatePlayEnabled = () => {
    const currentTime = (new Date()).getTime();
    const shouldPlayBeEnabled = !!game && game[1].lastMoveTime + minVotePeriod < currentTime;
    if (shouldPlayBeEnabled !== playEnabled) {
      setPlayEnabled(shouldPlayBeEnabled);
    }
    if (!shouldPlayBeEnabled && !!game) {
      // Schedule button being re-enabled.
      setTimeout(updatePlayEnabled, game[1].lastMoveTime + minVotePeriod - currentTime);
    }
  };
  updatePlayEnabled();
  const onKeyUp = (event: any) => {
    if (event.key === 'Enter') {
      submit();
    }
  };
  return (<div style={{textAlign: "center"}}>
    <input type="text" onChange={handleInputChange} value={moveInput} placeholder={sampleMove} className={styles.optioninput} onKeyUp={onKeyUp} />
    <button className={styles.button33} onClick={submit} disabled={!moveInput}>Vote</button>
    <div><button onClick={play} disabled={!playEnabled} className={styles.button33}>Play Top Move</button></div>
    <OptionsTable options={options} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
    <p className={styles.instructions}>
      {completion ? <span>{completion} </span> : <span>{toPlay} to move. </span>}<br/>
      Enter moves in algebraic notation like {sampleMove}, or click on the board.<br/>
      Only the top voted move can be played, after at least {minVotePeriod / 1000} seconds of voting.<br/>
      Invalid moves are ignored. Special instructions &quot;undo&quot; and &quot;resign&quot; must be unanimous.<br/>
      All users play both sides of a single game, in the style of Twitch Plays Pokemon. Check out the code on <a href="https://github.com/ldanilek/convex_plays">Github</a>.
    </p>
  </div>);
};

const PlayChess = () => {
  const [hoverMove, setHoverMove] = useState<string|null>(null);
  return (
    <div>
      <ChessBoard hoverMove={hoverMove} />
      <EntryForm onMouseEnter={setHoverMove} onMouseLeave={() => setHoverMove(null)} />
    </div>
  );
};


const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Convex Plays Chess</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <ConvexProvider client={convex}>
          <PlayChess />
        </ConvexProvider>

      </main>
    </div>
  )
}

export default Home
