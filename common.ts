import { Id, Document } from "./convex/_generated/dataModel";

export type GameState = Document<'games'>;

export type PlayedMove = Document<'moves'>;

export type MoveOption = Document<'move_options'>;

export const sortOptions = (options: MoveOption[]) => {
  options.sort((a, b) => ((a.votes < b.votes) || (a.votes === b.votes && a.move < b.move)) ? 1 : -1);
}

// 10 seconds per move, minimum.
export const minVotePeriod = 10 * 1000;

