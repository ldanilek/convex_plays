import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {GameState, MoveOption} from "../common";

export default mutation(async ({db}): Promise<Id<'games'>> => {
  console.log("creating new game");
  return db.insert("games", {moveCount: 0, lastMoveTime: (new Date()).getTime()});
});
