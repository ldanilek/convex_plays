import { mutation } from "convex-dev/server";
import { Id } from "convex-dev/values";
import {findAutomaticMove, GameState, MoveOption, PlayedMove} from "../common";

// 10 seconds per move, minimum.
const minVotePeriod = 10 * 1000;

export default mutation(async ({db}) => {
  const game: GameState | null = await db.table("games").order("desc").first();
  if (!game) {
    throw Error("no game; cannot move");
  }
  const currentTime = (new Date()).getTime();
  if (game.lastMoveTime + minVotePeriod > currentTime) {
    console.log("too soon; cannot move yet");
    return;
  }
  let options: MoveOption[] = await db.table("move_options").filter(
    q => q.eq(q.field("gameId"), game._id)
  ).filter(
    q => q.eq(q.field("moveIndex"), game.moveCount)
  ).collect();
  if (options.length === 0) {
    console.log("no options");
    return;
  }
  // Should order in the query and take first.
  options.sort((a, b) => (a.votes < b.votes) ? 1 : -1);
  const move = options[0].move;

  // Play human move.
  db.insert("moves", {gameId: game._id, moveIndex: game.moveCount, move});
  db.update(game._id, {lastMoveTime: currentTime, moveCount: game.moveCount+1});

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
