// this file is node-only

import { GameState, PlayedMove } from "./common";
import chess from "chess";
import { constructGame } from "./chess";
// @ts-ignore
var INIT_ENGINE = require("stockfish");


export const findAutomaticMove = async (game: GameState, moves: PlayedMove[]): Promise<string> => {
  const gameClient = constructGame(game, moves);
  const notatedMoves = gameClient.notatedMoves;
  // https://github.com/brozeph/node-chess/pull/89
  const fen = (gameClient as any)['getFen']();
  console.log('fen is ', fen);
  const Stockfish = INIT_ENGINE();
  const mod = {
    locateFile: function(path: string) {
        console.log('trying to locate file ', path);
        return path;
    },
  };
  const myEngine = Stockfish(mod);
  console.log(Object.keys(myEngine));
  const possibleMoves = Object.keys(notatedMoves);
  if (possibleMoves.length === 0) {
    return "";
  }
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
};
