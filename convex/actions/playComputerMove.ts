import { action } from "../_generated/server";
import { findAutomaticMove } from "../../chess";

export default action(async ({ mutation, query }): Promise<void> => {
  console.log("computing computer move");
  const g = await query('getGame');
  if (g === null) {
    return;
  }
  const [moves, game] = g;
  const computerMove = findAutomaticMove(game, moves);
  await mutation('playComputerMove', computerMove);
});
