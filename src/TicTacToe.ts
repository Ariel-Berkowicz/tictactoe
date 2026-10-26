export type Player = 'X' | 'O';

/** A cell holds a player's piece, or null if it is empty. */
export type Cell = Player | null;

/** A 4x4 board, indexed as board[row][column]. */
export type Board = Cell[][];

export const BOARD_SIZE = 4;

/** The coordinates of one cell on the board. */
interface Position {
    row: number;
    col: number;
}

/** Four cells that win the game when one player fills all of them. */
type WinPattern = Position[];

const LAST = BOARD_SIZE - 1;
const INDICES = Array.from({ length: BOARD_SIZE }, (_, i) => i); // [0, 1, 2, 3]

// ---------- Win patterns, one function per win condition ----------

/** Horizontal: each of the 4 rows. */
function horizontalPatterns(): WinPattern[] {
    return INDICES.map((row) => INDICES.map((col) => ({ row, col })));
}

/** Vertical: each of the 4 columns. */
function verticalPatterns(): WinPattern[] {
    return INDICES.map((col) => INDICES.map((row) => ({ row, col })));
}

/** Diagonal: top-left to bottom-right, and top-right to bottom-left. */
function diagonalPatterns(): WinPattern[] {
    const downRight = INDICES.map((i) => ({ row: i, col: i }));
    const downLeft = INDICES.map((i) => ({ row: i, col: LAST - i }));
    return [downRight, downLeft];
}

/** All four corners. */
function cornerPatterns(): WinPattern[] {
    return [
        [
            { row: 0, col: 0 },
            { row: 0, col: LAST },
            { row: LAST, col: 0 },
            { row: LAST, col: LAST },
        ],
    ];
}

/** 2x2 box: every square of 4 adjacent cells, 9 in total. */
function boxPatterns(): WinPattern[] {
    const patterns: WinPattern[] = [];
    for (let row = 0; row < LAST; row++) {
        for (let col = 0; col < LAST; col++) {
            patterns.push([
                { row, col },
                { row, col: col + 1 },
                { row: row + 1, col },
                { row: row + 1, col: col + 1 },
            ]);
        }
    }
    return patterns;
}

/** All 20 win patterns: 4 rows, 4 columns, 2 diagonals, the corners, 9 boxes. */
const WIN_PATTERNS: WinPattern[] = [
    ...horizontalPatterns(),
    ...verticalPatterns(),
    ...diagonalPatterns(),
    ...cornerPatterns(),
    ...boxPatterns(),
];

// ---------- Game ----------

export class TicTacToe {
    private readonly board: Board;

    constructor(board: Board) {
        if (
            board.length !== BOARD_SIZE ||
            board.some((row) => row.length !== BOARD_SIZE)
        ) {
            throw new Error(`Board must be ${BOARD_SIZE}x${BOARD_SIZE}`);
        }
        this.board = board;
    }

    /**
     * Returns the winning player, or null if there is no winner.
     *
     * Throws if both players have a winning pattern, since that board
     * cannot come from a real game.
     */
    public checkWinner(): Player | null {
        const xWins = this.hasWinningPattern('X');
        const oWins = this.hasWinningPattern('O');

        if (xWins && oWins) {
            throw new Error('Invalid board: both players have a winning pattern');
        }
        if (xWins) return 'X';
        if (oWins) return 'O';
        return null;
    }

    /** Returns true if at least one cell is empty. */
    public anyMovesLeft(): boolean {
        for (const row of this.board) {
            if (row.includes(null)) return true;
        }
        return false;
    }

    /** Returns true if there is a winner or no moves are left. */
    public isGameOver(): boolean {
        const hasWinner = this.checkWinner() !== null;
        return hasWinner || !this.anyMovesLeft();
    }

    /** Returns true if the player fills every cell of at least one win pattern. */
    private hasWinningPattern(player: Player): boolean {
        return WIN_PATTERNS.some((pattern) => this.fillsPattern(player, pattern));
    }

    /** Returns true if the player has a piece in every cell of the pattern. */
    private fillsPattern(player: Player, pattern: WinPattern): boolean {
        return pattern.every(({ row, col }) => this.board[row][col] === player);
    }
}
