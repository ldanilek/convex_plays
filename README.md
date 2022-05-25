## Let's Play!

Play a single game of Chess with the world.

Play online at [convex-plays.vercel.app](https://convex-plays.vercel.app).

Or run locally with
```bash
npm run dev
```

And open [http://localhost:3000](http://localhost:3000).

All users, including those running locally, play a single game of [Chess](https://en.wikipedia.org/wiki/Chess), in the style of [Twitch Plays Pokemon](https://en.wikipedia.org/wiki/Twitch_Plays_Pokemon).

Instructions are at the bottom of the game page, and summarized here:

Click on the board or type in the text box to vote for a move. If this move gets the most votes from all users across the world, it can be played with the "Play Top Move" button.

## How it Works

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

The backend runs on [Convex](https://www.convex.dev/). The frontend is deployed on [Vercel](https://vercel.com/dashboard).

## Future Work

There are many opportunities for additional features.

In addition to these listed, feel free to open issues on this Github project with bug reports or feature suggestions.

1. Take advantage of upcoming Convex features like indices and ordered queries.
2. Allow or require users to log in; consider restricting votes to one per person.
3. Create or import a Chess engine that runs on the backend, so users test their collective skills against a computer.
4. Configure games to have different voting durations, Chess engine strength, etc.
5. Record and display win/lose statistics.
6. Allow click-and-drag to move pieces, not just clicks.
7. Write unit tests.
8. Allow multiple active games, open or private, a.k.a. "Play with Friends"
