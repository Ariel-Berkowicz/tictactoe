import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TicTacToe, type Board } from './TicTacToe.ts';

/**
 * Builds a board from four strings, one per row:
 * 'X' and 'O' are pieces and '.' is an empty cell.
 */
function board(...rows: string[]): Board {
    return rows.map((row) => [...row].map((ch) => (ch === '.' ? null : (ch as 'X' | 'O'))));
}

const game = (...rows: string[]) => new TicTacToe(board(...rows));

describe('constructor', () => {
    it('rejects a board with the wrong number of rows', () => {
        assert.throws(() => game('....', '....', '....'), /Board must be 4x4/);
    });

    it('rejects a board with a row of the wrong length', () => {
        assert.throws(() => game('....', '...', '....', '....'), /Board must be 4x4/);
    });
});

describe('checkWinner', () => {
    it('returns null for an empty board', () => {
        assert.equal(game('....', '....', '....', '....').checkWinner(), null);
    });

    it('returns null when three in a row is not enough', () => {
        assert.equal(game('XXX.', 'OO..', '....', '....').checkWinner(), null);
    });

    it('detects every horizontal row', () => {
        for (let r = 0; r < 4; r++) {
            const rows = ['....', '....', '....', '....'];
            rows[r] = 'XXXX';
            assert.equal(game(...rows).checkWinner(), 'X', `row ${r + 1}`);
        }
    });

    it('detects every vertical column', () => {
        for (let c = 0; c < 4; c++) {
            const row = '....'.slice(0, c) + 'O' + '....'.slice(c + 1);
            assert.equal(game(row, row, row, row).checkWinner(), 'O', `column ${c + 1}`);
        }
    });

    it('detects the top-left to bottom-right diagonal', () => {
        assert.equal(game('X...', '.X..', '..X.', '...X').checkWinner(), 'X');
    });

    it('detects the top-right to bottom-left diagonal', () => {
        assert.equal(game('...O', '..O.', '.O..', 'O...').checkWinner(), 'O');
    });

    it('detects all four corners', () => {
        assert.equal(game('X..X', '....', '....', 'X..X').checkWinner(), 'X');
    });

    it('detects every 2x2 box', () => {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const cells = board('....', '....', '....', '....');
                cells[r][c] = cells[r][c + 1] = cells[r + 1][c] = cells[r + 1][c + 1] = 'O';
                assert.equal(new TicTacToe(cells).checkWinner(), 'O', `box at row ${r + 1}, column ${c + 1}`);
            }
        }
    });

    it('does not count a mixed pattern', () => {
        assert.equal(game('XXXO', 'O...', '....', 'X..O').checkWinner(), null);
    });

    it('does not count a non-adjacent square as a 2x2 box', () => {
        assert.equal(game('X.X.', '....', 'X.X.', '....').checkWinner(), null);
    });

    it('returns the winner on a full board', () => {
        assert.equal(game('XXXX', 'OOXO', 'XOOX', 'OXOO').checkWinner(), 'X');
    });

    it('throws when both players have a winning pattern', () => {
        assert.throws(() => game('XXXX', '....', '....', 'OOOO').checkWinner(), /both players/);
    });
});

describe('anyMovesLeft', () => {
    it('returns true for an empty board', () => {
        assert.equal(game('....', '....', '....', '....').anyMovesLeft(), true);
    });

    it('returns true when one cell is empty', () => {
        assert.equal(game('XOXO', 'OXOX', 'XOXO', 'OXO.').anyMovesLeft(), true);
    });

    it('returns false for a full board', () => {
        assert.equal(game('XOXO', 'XOXO', 'OXOX', 'OXOX').anyMovesLeft(), false);
    });
});

describe('isGameOver', () => {
    it('returns false for a game in progress', () => {
        assert.equal(game('X...', '.O..', '....', '....').isGameOver(), false);
    });

    it('returns true when a player has won with moves left', () => {
        assert.equal(game('OOOO', 'XXX.', '....', '....').isGameOver(), true);
    });

    it('returns true for a full board with no winner', () => {
        const draw = game('XOXO', 'XOXO', 'OXOX', 'OXOX');
        assert.equal(draw.checkWinner(), null);
        assert.equal(draw.isGameOver(), true);
    });
});
