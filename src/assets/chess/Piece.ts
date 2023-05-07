import { PieceColor, PieceType, Position } from './utility';
import { Move, MovePattern } from './Move';
import { Game } from './Game';

export class Piece {
    constructor(
        public color: PieceColor, 
        public type: PieceType,
        public pos: Position,
        public movePattern: MovePattern
    ) { }

    public step(move: Move): void {
        this.pos = move.to;
    }

    public getPossibleMoves(game: Game): Move[] {
        const moves: Move[] = [];
        const enemyKing = game.getKing(Game.getOtherColor(this.color));
        for(const direction of this.movePattern.directions) {
            for(let i = 1; i <= this.movePattern.maxSteps; i++) {
                const move = new Move(this.pos, {
                    x: this.pos.x + direction[0] * i,
                    y: this.pos.y + direction[1] * i
                });
                if(!game.isInBounds(move.to)) {
                    break;
                }
                const piece = game.getPiece(move.to);
                if(piece) {
                    if(piece.color != this.color) {
                        moves.push(move);
                    }
                    break;
                }
                if(!(move.to.x == enemyKing.pos.x && move.to.y == enemyKing.pos.y)) {
                    moves.push(move);
                }
            }
        }
        return moves;
    }

    public getIcon(): string {
        return `${this.type as string}-${this.color == PieceColor.BLACK ? "black" : "white"}`;
    }
    public getChar(): string {
        if(this.type == PieceType.KNIGHT) {
            return this.color == PieceColor.BLACK ? "n" : "N";
        }
        let char = this.type[0] as string;
        if(this.color == PieceColor.WHITE) {
            char = char.toUpperCase();
        }
        return char;
    }

    public copy(): Piece {
        return new Piece(this.color, this.type, {...this.pos}, this.movePattern);
    }
}

export class Pawn extends Piece {
    constructor(color: PieceColor, pos: Position) {
        super(color, PieceType.PAWN, pos, {
            directions: [[0, color == PieceColor.WHITE ? 1 : -1]],
            maxSteps: 1
        });
    }

    public override getPossibleMoves(game: Game): Move[] {
        const moves = super.getPossibleMoves(game);
        for(const move of moves) {
            for(const piece of game.pieces.filter(p => p.color != this.color)) {
                if(move.to.x == piece.pos.x && move.to.y == piece.pos.y) {
                    moves.splice(moves.indexOf(move), 1);
                    break;
                }
            }
        }
        const moveDirection = this.movePattern.directions[0][1];
        for(let i = -1; i <= 1; i += 2) {
            if(game.isInBounds({x: this.pos.x + i, y: this.pos.y + moveDirection})) {
                const piece = game.getPiece({x: this.pos.x + i, y: this.pos.y + moveDirection});
                if(piece && piece.color != this.color) {
                    moves.push(new Move(this.pos, {x: this.pos.x + i, y: this.pos.y + moveDirection}));
                }
            }
        }
        if(this.pos.y == (this.color == PieceColor.WHITE ? 1 : 6)) {
            const move = new Move(this.pos, {x: this.pos.x, y: this.pos.y + moveDirection * 2});
            if(!game.getPiece(move.to) && !game.getPiece({x: this.pos.x, y: this.pos.y + moveDirection}) && game.isInBounds(move.to)) {
                moves.push(move);
            }
        }
        return moves;
    }
}

export class Rook extends Piece {
    constructor(color: PieceColor, pos: Position) {
        super(color, PieceType.ROOK, pos, {
            directions: [...Move.HORIZONTAL_MOVE_PATTERNS],
            maxSteps: 8
        });
    }
}

export class Knight extends Piece {
    constructor(color: PieceColor, pos: Position) {
        super(color, PieceType.KNIGHT, pos, {
            directions: [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]],
            maxSteps: 1
        });
    }
}

export class Bishop extends Piece {
    constructor(color: PieceColor, pos: Position) {
        super(color, PieceType.BISHOP, pos, {
            directions: [...Move.DIAGONAL_MOVE_PATTERNS],
            maxSteps: 8
        });
    }
}

export class Queen extends Piece {
    constructor(color: PieceColor, pos: Position) {
        super(color, PieceType.QUEEN, pos, {
            directions: [...Move.HORIZONTAL_MOVE_PATTERNS, ...Move.DIAGONAL_MOVE_PATTERNS],
            maxSteps: 8
        });
    }
}

export class King extends Piece {
    constructor(color: PieceColor, pos: Position) {
        super(color, PieceType.KING, pos, {
            directions: [...Move.HORIZONTAL_MOVE_PATTERNS, ...Move.DIAGONAL_MOVE_PATTERNS],
            maxSteps: 1
        });
    }
}
