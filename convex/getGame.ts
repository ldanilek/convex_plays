import { query } from "./_generated/server";
import {Id} from "./_generated/dataModel";
import {GameState, PlayedMove} from "../common";

export default query(async ({db}): Promise<[PlayedMove[], GameState] | null> => {
  const game: GameState | null = await db.query("games").order("desc").first();
  if (!game) {
    return null;
  }
  let moves: PlayedMove[] = await db.query("moves").withIndex('by_index',
    q => q.eq('gameId', game._id)
  ).collect();
  return [moves, game];
});
