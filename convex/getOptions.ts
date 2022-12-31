import { query } from "./_generated/server";
import {Id} from "./_generated/dataModel";
import {GameState, MoveOption, sortOptions} from "../common";

export default query(async ({db}): Promise<MoveOption[]> => {
  const game: GameState | null = await db.query("games").order("desc").first();
  if (!game) {
    return [];
  }
  let options: MoveOption[] = await db.query("move_options").withIndex('by_votes',
    q => q.eq('gameId', game._id).eq('moveIndex', game.moveCount)
  ).order('desc').collect();
  // Should be ordered in the query,
  // and potentially only take the top options.
  sortOptions(options);
  return options;
});
