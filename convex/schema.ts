import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  games: defineTable({
    moveCount: s.number(),
    lastMoveTime: s.number(),
  }),
  moves: defineTable({
    gameId: s.id('games'),
    moveIndex: s.number(),
    move: s.string(),
  }),
  move_options: defineTable({
    gameId: s.id('games'),
    moveIndex: s.number(),
    move: s.string(),
    votes: s.number(),
  }),
});
