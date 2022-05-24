import { query } from "convex-dev/server";
import {Id} from "convex-dev/values";
import {GameState, PlayedMove} from "../common";

export default query(async ({db}): Promise<[PlayedMove[], GameState] | null> => {
  const game: GameState | null = await db.table("games").order("desc").first();
  if (!game) {
    return null;
  }
  let moves: PlayedMove[] = await db.table("moves").filter(
    q => q.eq(q.field("gameId"), game._id)
  ).collect();
  // Should order in the query, and potentially only take the top options.
  moves.sort((a, b) => (a.moveIndex > b.moveIndex) ? 1 : -1);
  return [moves, game];
});
