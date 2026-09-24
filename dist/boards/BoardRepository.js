export class InMemoryBoardRepository {
    constructor(board) {
        this.board = board;
    }
    getDefault() {
        return this.board;
    }
}
