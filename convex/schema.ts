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
  }).index('by_index', ['gameId', 'moveIndex']),
  move_options: defineTable({
    gameId: s.id('games'),
    moveIndex: s.number(),
    move: s.string(),
    votes: s.number(),
  })
  .index('by_votes', ['gameId', 'moveIndex', 'votes', 'move'])
  .index('by_move', ['gameId', 'moveIndex', 'move']),
});
