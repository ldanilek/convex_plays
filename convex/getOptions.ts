import { query } from "./_generated/server";
import {Id} from "./_generated/dataModel";
import {GameState, MoveOption, sortOptions} from "../common";

export default query(async ({db}): Promise<MoveOption[]> => {
  const game: GameState | null = await db.query("games").order("desc").first();
  if (!game) {
    return [];
  }
  let options: MoveOption[] = await db.query("move_options").filter(
    q => q.eq(q.field("gameId"), game._id)
  ).filter(
    q => q.eq(q.field("moveIndex"), game.moveCount)
  ).collect();
  // Should order in the query, and potentially only take the top options.
  sortOptions(options);
  return options;
});
