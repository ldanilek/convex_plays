import { mutation } from "convex-dev/server";
import { Id } from "convex-dev/values";
import {GameState, MoveOption} from "../common";

export default mutation(async ({db}, move: string): Promise<Id> => {
  const game: GameState | null = await db.table("games").order("desc").first();
  if (!game) {
    throw Error("no game; cannot vote");
  }
  const moveOption: MoveOption | null = await db.table("move_options").filter(
    q => q.eq(q.field("gameId"), game._id)
  ).filter(
    q => q.eq(q.field("moveIndex"), game.moveCount)
  ).filter(
    q => q.eq(q.field("move"), move)
  ).first();
  if (!moveOption) {
    // No votes yet; create the option.
    console.log("casting first vote for ", move);
    return db.insert("move_options", {
      gameId: game._id,
      moveIndex: game.moveCount,
      move,
      votes: 1,
    });
  } else {
    console.log("casting vote for ", move);
    db.update(moveOption._id, {votes: moveOption.votes+1});
    return moveOption._id;
  }
});
