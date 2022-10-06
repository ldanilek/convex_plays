import { query } from "./_generated/server";
import {Id} from "./_generated/dataModel";
import {GameState, PlayedMove} from "../common";

export default query(async ({db}): Promise<[PlayedMove[], GameState] | null> => {
  const game: GameState | null = await db.query("games").order("desc").first();
  if (!game) {
    return null;
  }
  let moves: PlayedMove[] = await db.query("moves").filter(
    q => q.eq(q.field("gameId"), game._id)
  ).collect();
  moves.sort((a, b) => (a.moveIndex > b.moveIndex) ? 1 : -1);
  return [moves, game];
});
