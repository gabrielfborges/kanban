import { randomUUID } from 'node:crypto';
import { Column } from './Column.js';
import { ColumnNotFoundError } from './errors.js';
/**
 * MODEL — o quadro (aggregate root): agrupa as colunas. Nesta versão do
 * template só existe UM quadro fixo (ver `src/seed.ts`); suportar vários
 * quadros é uma atividade de estica (Atividade 10).
 */
export class Board {
    constructor(_id, _name, _columns) {
        this._id = _id;
        this._name = _name;
        this._columns = _columns;
    }
    static create(id, name, columns) {
        return new Board(id, name, columns);
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get columns() {
        return this._columns;
    }
    findColumn(columnId) {
        const column = this._columns.find((c) => c.id === columnId);
        if (!column) {
            throw new ColumnNotFoundError(columnId);
        }
        return column;
    }
    hasColumn(columnId) {
        return this._columns.some((c) => c.id === columnId);
    }
    /**
     * TODO (Atividade 7): criar e adicionar uma nova coluna ao quadro.
     * Pontos a decidir: como gerar o `id`, qual `order` atribuir (última
     * posição?) e se nomes de coluna duplicados devem ser proibidos.
     */
    addColumn(_name, _wipLimit = null) {
        const nextOrder = this._columns.reduce((highestOrder, column) => Math.max(highestOrder, column.order), 0) + 1;
        const column = Column.create(randomUUID(), _name, nextOrder, _wipLimit);
        this._columns.push(column);
        return column;
    }
    toSnapshot() {
        return {
            id: this._id,
            name: this._name,
            columns: this._columns.map((c) => c.toSnapshot()).sort((a, b) => a.order - b.order),
        };
    }
}
