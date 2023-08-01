import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    moveCount: v.number(),
    lastMoveTime: v.number(),
  }),
  moves: defineTable({
    gameId: v.id('games'),
    moveIndex: v.number(),
    move: v.string(),
  }).index('by_index', ['gameId', 'moveIndex']),
  move_options: defineTable({
    gameId: v.id('games'),
    moveIndex: v.number(),
    move: v.string(),
    votes: v.number(),
  })
  .index('by_votes', ['gameId', 'moveIndex', 'votes', 'move'])
  .index('by_move', ['gameId', 'moveIndex', 'move']),
});
