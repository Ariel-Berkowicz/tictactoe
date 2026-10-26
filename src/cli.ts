import * as readline from 'node:readline';
import { setTimeout as sleep } from 'node:timers/promises';
import { BOARD_SIZE, TicTacToe, type Board, type Player } from './TicTacToe.ts';

type Controller = 'human' | 'computer';

interface Mode {
    name: string;
    controllers: Record<Player, Controller>;
}

interface Position {
    row: number;
    col: number;
}

const COLUMN_LABELS = 'ABCD';
const COMPUTER_DELAY_MS = 600;

// ---------- Terminal output ----------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number) => (text: string) =>
    useColor ? `\x1b[${code}m${text}\x1b[0m` : text;
const red = paint(31);
const cyan = paint(36);
const yellow = paint(33);
const dim = paint(2);
const bold = paint(1);

function colorPlayer(player: Player): string {
    return player === 'X' ? bold(red(player)) : bold(cyan(player));
}

function clearScreen(): void {
    if (process.stdout.isTTY) process.stdout.write('\x1b[2J\x1b[H');
}

function renderBoard(board: Board): string {
    const border = '   ' + '+---'.repeat(BOARD_SIZE) + '+';
    const header = '     ' + [...COLUMN_LABELS].join('   ');
    const rows = board.map((row, r) => {
        const cells = row.map((cell) => ` ${cell ? colorPlayer(cell) : ' '} `);
        return ` ${r + 1} |${cells.join('|')}|`;
    });
    return [header, border, ...rows.flatMap((row) => [row, border])].join('\n');
}

// ---------- Input ----------

class InputClosed extends Error {}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('SIGINT', () => rl.close());
const lines = rl[Symbol.asyncIterator]();

async function ask(question: string): Promise<string> {
    process.stdout.write(question);
    const { value, done } = await lines.next();
    if (done) throw new InputClosed();
    return value.trim();
}

/** Parses moves like "B3" (column letter, then row number). */
function parsePosition(input: string): Position | null {
    const match = /^([a-d])\s*([1-4])$/i.exec(input);
    if (!match) return null;
    return {
        col: COLUMN_LABELS.indexOf(match[1].toUpperCase()),
        row: Number(match[2]) - 1,
    };
}

function formatPosition({ row, col }: Position): string {
    return `${COLUMN_LABELS[col]}${row + 1}`;
}

// ---------- Game helpers ----------

function emptyBoard(): Board {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function emptyCells(board: Board): Position[] {
    const cells: Position[] = [];
    board.forEach((row, r) =>
        row.forEach((cell, c) => {
            if (cell === null) cells.push({ row: r, col: c });
        }),
    );
    return cells;
}

function randomMove(board: Board): Position {
    const cells = emptyCells(board);
    return cells[Math.floor(Math.random() * cells.length)];
}

/**
 * Calls a TicTacToe method. While a method is still a stub, falls back to a
 * simple answer so the game stays playable, and records a warning to show.
 */
function callOrFallback<T>(
    warnings: Set<string>,
    method: string,
    call: () => T,
    fallback: T,
): T {
    try {
        return call();
    } catch (error) {
        if (error instanceof Error && error.message === 'Not implemented') {
            warnings.add(`${method}() is not implemented yet, using a fallback.`);
            return fallback;
        }
        throw error;
    }
}

// ---------- Game loop ----------

const MODES: Mode[] = [
    { name: 'Single player (you vs computer)', controllers: { X: 'human', O: 'computer' } },
    { name: 'Two players', controllers: { X: 'human', O: 'human' } },
    { name: 'Computer vs computer (random moves)', controllers: { X: 'computer', O: 'computer' } },
];

async function chooseMode(): Promise<Mode | null> {
    clearScreen();
    console.log(bold('4x4 Tic-Tac-Toe\n'));
    console.log('Win with four in a row, column, diagonal, the four corners, or any 2x2 box.\n');
    MODES.forEach((mode, i) => console.log(`  ${i + 1}) ${mode.name}`));
    console.log('  q) Quit\n');

    while (true) {
        const answer = (await ask('Choose a mode: ')).toLowerCase();
        if (answer === 'q') return null;
        const mode = MODES[Number(answer) - 1];
        if (mode) return mode;
        console.log(yellow('Please enter 1, 2, 3 or q.'));
    }
}

async function chooseSide(mode: Mode): Promise<Mode> {
    if (mode.controllers.X === mode.controllers.O) return mode;
    while (true) {
        const answer = (await ask('Play as X (goes first) or O? [X/o]: ')).toUpperCase();
        if (answer === '' || answer === 'X') return mode;
        if (answer === 'O') return { ...mode, controllers: { X: 'computer', O: 'human' } };
        console.log(yellow('Please enter X or O.'));
    }
}

async function playGame(mode: Mode): Promise<void> {
    const board = emptyBoard();
    const warnings = new Set<string>();
    let current: Player = 'X';
    let lastMove = '';

    while (true) {
        const game = new TicTacToe(board);
        const winner = callOrFallback(warnings, 'checkWinner', () => game.checkWinner(), null);
        const movesLeft = callOrFallback(
            warnings,
            'anyMovesLeft',
            () => game.anyMovesLeft(),
            emptyCells(board).length > 0,
        );
        const gameOver = callOrFallback(
            warnings,
            'isGameOver',
            () => game.isGameOver(),
            winner !== null || !movesLeft,
        );

        clearScreen();
        console.log(bold(mode.name) + '\n');
        console.log(renderBoard(board) + '\n');
        if (lastMove) console.log(dim(lastMove));
        for (const warning of warnings) console.log(yellow(`Note: ${warning}`));

        if (gameOver) {
            console.log(winner ? bold(`\n${colorPlayer(winner)} wins!`) : bold('\nDraw.'));
            return;
        }
        if (emptyCells(board).length === 0) {
            console.log(yellow('\nThe board is full but isGameOver() returned false. Ending the game.'));
            return;
        }

        const controller = mode.controllers[current];
        let move: Position;
        if (controller === 'computer') {
            console.log(`\nComputer (${colorPlayer(current)}) is thinking...`);
            await sleep(COMPUTER_DELAY_MS);
            move = randomMove(board);
        } else {
            move = await askForMove(board, current);
        }

        board[move.row][move.col] = current;
        const who = controller === 'computer' ? 'Computer' : 'Player';
        lastMove = `${who} ${current} played ${formatPosition(move)}.`;
        current = current === 'X' ? 'O' : 'X';
    }
}

async function askForMove(board: Board, player: Player): Promise<Position> {
    while (true) {
        const answer = await ask(`\nPlayer ${colorPlayer(player)}, enter a move (e.g. B3) or q to quit: `);
        if (answer.toLowerCase() === 'q') throw new InputClosed();
        const position = parsePosition(answer);
        if (!position) {
            console.log(yellow('Enter a column A-D followed by a row 1-4, like B3.'));
        } else if (board[position.row][position.col] !== null) {
            console.log(yellow(`${formatPosition(position)} is already taken.`));
        } else {
            return position;
        }
    }
}

async function main(): Promise<void> {
    try {
        while (true) {
            const mode = await chooseMode();
            if (!mode) break;
            await playGame(await chooseSide(mode));
            const again = (await ask('\nPlay again? [Y/n]: ')).toLowerCase();
            if (again === 'n' || again === 'q') break;
        }
    } catch (error) {
        if (!(error instanceof InputClosed)) throw error;
    } finally {
        rl.close();
    }
    console.log('\nGoodbye!');
}

await main();
