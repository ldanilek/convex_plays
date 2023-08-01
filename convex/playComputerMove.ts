import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {GameState, MoveOption, PlayedMove} from "../common";
import { v } from "convex/values";

export default mutation({
  args: {computerMove: v.string()},
  handler: async ({ db }, {computerMove}) => {
    const game: GameState | null = await db.query("games").order("desc").first();
    if (!game) {
      throw Error("no game; cannot move");
    }
    // Now play computer move.
    await db.insert("moves", {gameId: game._id, moveIndex: game.moveCount, move: computerMove});
    const currentTime = (new Date()).getTime();
    await db.patch(game._id, {lastMoveTime: currentTime, moveCount: game.moveCount+1});
  },
});
