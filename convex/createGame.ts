import { mutation } from "convex-dev/server";
import { Id } from "convex-dev/values";
import {GameState, MoveOption} from "../common";

export default mutation(async ({db}): Promise<Id> => {
  console.log("creating new game");
  return db.insert("games", {moveCount: 0, lastMoveTime: (new Date()).getTime()});
});
