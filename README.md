# tictactoe

A 4x4 Tic-Tac-Toe / Connect Four solver. Given a 4x4 board, the program reports the winner, if there is one.

> **Scope:** No UI is required. The focus is the win-condition logic.

## Tech stack

This project is TypeScript on Node.js only. Other languages and runtimes are out of scope.

- **Language:** TypeScript
- **Runtime:** Node.js
- **Package manager:** npm

## Win conditions

A player wins by filling any one of these patterns with four of their pieces:

| Condition      | Description                                    |
| -------------- | ---------------------------------------------- |
| Horizontal     | Any full row                                   |
| Vertical       | Any full column                                |
| Diagonal       | Either of the two main diagonals               |
| Four corners   | All four corner cells                          |
| 2x2 box        | Any 2x2 square of adjacent cells               |

## Required API

Implement the class below in TypeScript. The parameters and return types are up to you, and you can add any other types you need.

```ts
class TicTacToe {
    public checkWinner(/* params, if any */): /* return type */ {}

    public anyMovesLeft(/* params, if any */): /* return type */ {}

    public isGameOver(/* params, if any */): /* return type */ {}
}
```

| Method         | Purpose                                     |
| -------------- | ------------------------------------------- |
| `checkWinner`  | Return the winner of the board, if any      |
| `anyMovesLeft` | Report whether any empty cells remain       |
| `isGameOver`   | Report whether the game has ended           |

## Deliverables

- [x] Implementation of the `TicTacToe` class in TypeScript
- [x] Unit tests in TypeScript, runnable with Node.js, with instructions for running them (see below)
- [x] AI session transcripts, if AI was used: see [`transcripts/ai-session.md`](transcripts/ai-session.md)

## Playing in the terminal

Requires Node.js 23.6 or later, which runs `.ts` files directly. Nothing needs to be installed.

```sh
npm start
```

Pick a mode from the menu:

| Mode                 | Description                                   |
| -------------------- | --------------------------------------------- |
| Single player        | You against a computer that plays randomly    |
| Two players          | Two people take turns at the same keyboard    |
| Computer vs computer | Two random computers play each other          |

Enter moves as a column letter followed by a row number, such as `B3`. Enter `q` to quit.

The game uses the `TicTacToe` class to decide when someone has won and when the game is over.

## Running the tests

The tests use Node's built-in test runner, so nothing needs to be installed.

```sh
npm test
```

The tests are in `src/TicTacToe.test.ts`. They cover every win condition, boards with no winner, full and partly full boards, and invalid board sizes.
