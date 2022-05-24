// Like common.ts but contains everything with a dependency on chess,
// because Convex can't import it.

import { GameState, PlayedMove } from "./common";
import chess from "chess";



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