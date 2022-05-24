import { query } from "convex-dev/server";
import {Id} from "convex-dev/values";
import {GameState, MoveOption} from "../common";

export default query(async ({db}): Promise<MoveOption[]> => {
  const game: GameState | null = await db.table("games").order("desc").first();
  if (!game) {
    return [];
  }
  let options: MoveOption[] = await db.table("move_options").filter(
    q => q.eq(q.field("gameId"), game._id)
  ).filter(
    q => q.eq(q.field("moveIndex"), game.moveCount)
  ).collect();
  // Should order in the query, and potentially only take the top options.
  options.sort((a, b) => (a.votes < b.votes) ? 1 : -1);
  return options;
});
