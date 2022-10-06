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
  let options: MoveOption[] = await db.query("move_options").filter(
    q => q.eq(q.field("gameId"), game._id)
  ).filter(
    q => q.eq(q.field("moveIndex"), game.moveCount)
  ).collect();
  if (options.length === 0) {
    console.log("no options");
    return;
  }
  options.sort((a, b) => (a.votes < b.votes) ? 1 : -1);
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
  db.insert("moves", {gameId: game._id, moveIndex: game.moveCount, move});
  db.patch(game._id, {lastMoveTime: currentTime, moveCount: game.moveCount+1});

  if (move === "resign" || move === "restart") {
    // Start a new game.
    db.insert("games", {moveCount: 0, lastMoveTime: (new Date()).getTime()});
  }

  // We can't play computer moves because Convex doesn't like the "events" and "crypto" imports.
  /*
  const newGame: GameState = await db.table("games").order("desc").first();
  let moves: PlayedMove[] = await db.table("moves").filter(
    q => q.eq(q.field("gameId"), game._id)
  ).collect();
  moves.sort((a, b) => (a.moveIndex > b.moveIndex) ? 1 : -1);

  // Now play computer move.
  const computerMove = findAutomaticMove(newGame, moves);
  db.insert("moves", {gameId: newGame._id, moveIndex: newGame.moveCount, move: computerMove});
  db.update(game._id, {lastMoveTime: currentTime, moveCount: newGame.moveCount+1});
  */
});
