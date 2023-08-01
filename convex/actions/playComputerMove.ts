"use node";

import { api } from "../_generated/api";
import { action } from "../_generated/server";
import { findAutomaticMove } from "../../chessEngine";

export default action(async (ctx): Promise<void> => {
  console.log("computing computer move");
  const g = await ctx.runQuery(api.getGame.default);
  if (g === null) {
    return;
  }
  const [moves, game] = g;
  if (game.moveCount % 2 === 0) {
    // only play computer moves as the black pieces.
    return;
  }
  const computerMove = await findAutomaticMove(game, moves);
  await ctx.runMutation(api.playComputerMove.default, {computerMove});
});
