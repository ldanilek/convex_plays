import { action } from "../_generated/server";
import { findAutomaticMove } from "../../chessEngine";

export default action(async ({ mutation, query }): Promise<void> => {
  console.log("computing computer move");
  const g = await query('getGame');
  if (g === null) {
    return;
  }
  const [moves, game] = g;
  if (game.moveCount % 2 === 0) {
    // only play computer moves as the black pieces.
    return;
  }
  const computerMove = await findAutomaticMove(game, moves);
  await mutation('playComputerMove', computerMove);
});
