import { Id } from "convex-dev/values";

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

// 10 seconds per move, minimum.
export const minVotePeriod = 10 * 1000;

