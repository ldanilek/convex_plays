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

export const findAutomaticMove = (game: GameState, moves: PlayedMove[]): string => {
  const gameClient = chess.create();
  for (let move of moves) {
    gameClient.move(move.move);
  }
  for (let move in gameClient.notatedMoves) {
    return move;
  }
  return "";
};
