import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {GameState, MoveOption, PlayedMove, minVotePeriod} from "../common";

export default mutation(async ({db}) => {
  const game: GameState | null = await db.query("games").order("desc").first();
  if (!game) {
    throw Error("no game; cannot move");
  }
  const currentTime = (new Date()).getTime();
  // Make sure everyone had time to vote.
  // Currently disabled because the UX is confusing in this case.
  if (game.lastMoveTime + minVotePeriod > currentTime) {
    console.log("too soon; cannot move yet");
    return;
  }
  let options: MoveOption[] = await db.query("move_options").withIndex('by_votes',
    q => q.eq('gameId', game._id).eq('moveIndex', game.moveCount)
  ).order('desc').collect();
  if (options.length === 0) {
    console.log("no options");
    return;
  }
  let move = options[0].move;
  if (move === "resign" || move === "undo" || move === "restart") {
    for (let moveOption of options) {
      if (moveOption.move !== move) {
        move = moveOption.move;
        break;
      }
    }
  }

  // Play human move.
  await db.insert("moves", {gameId: game._id, moveIndex: game.moveCount, move});
  await db.patch(game._id, {lastMoveTime: currentTime, moveCount: game.moveCount+1});

  if (move === "resign" || move === "restart") {
    // Start a new game.
    await db.insert("games", {moveCount: 0, lastMoveTime: (new Date()).getTime()});
  }
});
