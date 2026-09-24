import { InvalidColumnNameError } from './errors.js';
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 40;
/**
 * MODEL — uma coluna do quadro (ex.: "A Fazer", "Em Andamento").
 * `wipLimit` é o número máximo de cartões permitidos na coluna ao mesmo
 * tempo (limite de "Work In Progress", conceito central de Kanban) — o
 * campo já existe, mas **ninguém aplica essa regra ainda** (Atividade 5).
 */
export class Column {
    constructor(_id, _name, _order, _wipLimit) {
        this._id = _id;
        this._name = _name;
        this._order = _order;
        this._wipLimit = _wipLimit;
    }
    static create(id, name, order, wipLimit = null) {
        const normalized = Column.validateName(name);
        return new Column(id, normalized, order, wipLimit);
    }
    static validateName(name) {
        if (typeof name !== 'string') {
            throw new InvalidColumnNameError('deve ser um texto');
        }
        const normalized = name.trim();
        if (normalized.length < MIN_NAME_LENGTH || normalized.length > MAX_NAME_LENGTH) {
            throw new InvalidColumnNameError(`deve ter entre ${MIN_NAME_LENGTH} e ${MAX_NAME_LENGTH} caracteres`);
        }
        return normalized;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get order() {
        return this._order;
    }
    get wipLimit() {
        return this._wipLimit;
    }
    toSnapshot() {
        return { id: this._id, name: this._name, order: this._order, wipLimit: this._wipLimit };
    }
}
