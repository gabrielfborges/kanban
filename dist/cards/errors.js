/**
 * Erros de domínio do módulo `cards`. Só existem aqui os erros que o
 * código ATUAL realmente lança (`Card.create`) — de propósito: um erro
 * definido e nunca usado é código morto.
 *
 * Vocês vão precisar criar novos conforme implementam as atividades, por
 * exemplo: `CardNotFoundError` (Atividade 2/3/4), `DuplicateCardTitleError`
 * (Atividade 6), `WipLimitExceededError` (Atividade 5). Ao criar um, não
 * esqueçam de registrar o status HTTP correspondente em
 * `shared/errorHandler.ts`.
 */
export class InvalidCardTitleError extends Error {
    constructor(reason) {
        super(`Título de cartão inválido: ${reason}`);
        this.name = 'InvalidCardTitleError';
    }
}
export class InvalidCardColumnError extends Error {
    constructor(reason) {
        super(`Coluna do cartão inválida: ${reason}`);
        this.name = 'InvalidCardColumnError';
    }
}
export class InvalidPriorityError extends Error {
    constructor(value) {
        super(`Prioridade inválida: "${String(value)}". Use "baixa", "média" ou "alta".`);
        this.name = 'InvalidPriorityError';
    }
}
export class CardNotFoundError extends Error {
    constructor(id) {
        super(`Cartão ${id} não encontrado`);
        this.name = 'CardNotFoundError';
    }
}
export class WipLimitExceededError extends Error {
    constructor(columnId, limit) {
        super(`A coluna ${columnId} atingiu o limite de WIP (${limit} cartões)`);
        this.name = 'WipLimitExceededError';
    }
}
export class DuplicateCardTitleError extends Error {
    constructor(title, columnId) {
        super(`Já existe um cartão com o título "${title}" na coluna ${columnId}`);
        this.name = 'DuplicateCardTitleError';
    }
}
