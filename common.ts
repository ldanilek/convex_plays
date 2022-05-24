import { Id } from "convex-dev/values";
import chess from "chess";

export type GameState = {
  _id: Id,
  moveCount: number,
  lastMoveTime: number,
};

export type PlayedMove = {
  _id: Id,
  gameId: Id,
  moveIndex: number,
  move: string,
};

export type MoveOption = {
  _id: Id,
  gameId: Id,
  moveIndex: number,
  move: string,
  votes: number,
};

export const constructGame = (game: GameState, moves: PlayedMove[]): chess.AlgebraicGameClient => {
  const gameClient = chess.create();
  let gameMove: chess.PlayedMove | null = null;
  for (let move of moves) {
    if (move.move === "resign") {
      break;
    }
    if (move.move === "undo" && gameMove) {
      try {
        // https://github.com/brozeph/node-chess/issues/77
        gameMove.undo();
      } catch (error) {
        console.log(error);
      }
      continue;
    }
    if (!(move.move in gameClient.notatedMoves)) {
      console.log("invalid move", move.move);
      continue;
    }
    try {
      gameMove = gameClient.move(move.move);
    } catch (error) {
      console.log(error);
      // ignore invalid moves
    }
  }
  return gameClient;
}

export const findAutomaticMove = (game: GameState, moves: PlayedMove[]): string => {
  const gameClient = constructGame(game, moves);
  for (let move in gameClient.notatedMoves) {
    return move;
  }
  return "";
};
