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
  moves.forEach(move => {
    try {
      gameClient.move(move.move);
    } catch (error) {
      console.log(error);
      // ignore invalid moves
    }
  });
  return gameClient;
}

export const findAutomaticMove = (game: GameState, moves: PlayedMove[]): string => {
  const gameClient = constructGame(game, moves);
  for (let move in gameClient.notatedMoves) {
    return move;
  }
  return "";
};
