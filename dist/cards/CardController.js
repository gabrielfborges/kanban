import { NotImplementedError } from '../shared/errors.js';
import { ColumnNotFoundError } from '../boards/errors.js';
import { Card } from './Card.js';
import { toBoardViewModel } from '../boards/boardView.js';
import { CardNotFoundError, DuplicateCardTitleError, WipLimitExceededError } from './errors.js';
/**
 * CONTROLLER — nenhum método está implementado ainda. Isso é proposital:
 * cada método corresponde a uma atividade proposta na Aula 03 (ver
 * aula03.md). O construtor já recebe os dois repositórios que vocês vão
 * precisar — `cardRepository` para persistir cartões, `boardRepository`
 * para validar que uma coluna existe antes de criar/mover um cartão nela.
 */
export class CardController {
    constructor(cardRepository, boardRepository) {
        this.cardRepository = cardRepository;
        this.boardRepository = boardRepository;
    }
    /**
     * TODO (Atividade 1): criar um cartão a partir do corpo da requisição
     * (`{ title, columnId, priority?, description? }`) e redirecionar de
     * volta para `/`. Regras a aplicar: título válido (`Card.create` já
     * valida), coluna precisa existir no quadro (`boardRepository`), e não
     * pode haver título duplicado na mesma coluna (Atividade 6 — podem
     * implementar já aqui ou depois, é a mesma regra).
     */
    create(_body) {
        const { title, columnId, priority, description } = _body;
        const board = this.boardRepository.getDefault();
        if (!board.hasColumn(columnId)) {
            throw new ColumnNotFoundError(columnId);
        }
        const card = Card.create(title, columnId, priority, description);
        if (this.cardRepository.existsWithTitleInColumn(card.title, card.columnId)) {
            throw new DuplicateCardTitleError(card.title, card.columnId);
        }
        this.cardRepository.save(card);
        const cards = this.cardRepository.findAll();
        return {
            status: 302,
            view: 'board/index',
            locals: { board: toBoardViewModel(board, cards) },
        };
    }
    /**
     * TODO (Atividade 2): mover um cartão para outra coluna
     * (`{ columnId }` no corpo). Regras: coluna destino precisa existir;
     * respeitar o limite de WIP da coluna destino (Atividade 5).
     */
    move(_id, _body) {
        const { columnId } = _body;
        const card = this.cardRepository.findById(_id);
        if (!card) {
            throw new CardNotFoundError(_id);
        }
        const board = this.boardRepository.getDefault();
        if (!board.hasColumn(columnId)) {
            throw new ColumnNotFoundError(columnId);
        }
        const column = board.findColumn(columnId);
        const movingToColumn = card.columnId !== columnId;
        if (movingToColumn &&
            column.wipLimit !== null &&
            this.cardRepository.findByColumn(columnId).length >= column.wipLimit) {
            throw new WipLimitExceededError(columnId, column.wipLimit);
        }
        card.changeColumn(columnId);
        this.cardRepository.save(card);
        const cards = this.cardRepository.findAll();
        return {
            status: 201,
            view: 'board/index',
            locals: { board: toBoardViewModel(board, cards) },
        };
    }
    /**
     * TODO (Atividade 3): editar título/descrição/prioridade de um cartão
     * existente (`{ title?, description?, priority? }`).
     */
    update(_id, _body) {
        const { title, priority, description } = _body;
        const card = this.cardRepository.findById(_id);
        if (!card) {
            throw new CardNotFoundError(_id);
        }
        if (title !== undefined || description !== undefined) {
            if (title !== undefined &&
                typeof title === 'string' &&
                this.cardRepository.existsWithTitleInColumn(title, card.columnId, card.id)) {
                throw new DuplicateCardTitleError(title.trim(), card.columnId);
            }
            card.rename(title !== undefined ? title : card.title, description);
        }
        if (priority !== undefined) {
            card.changePriority(priority);
        }
        this.cardRepository.save(card);
        const board = this.boardRepository.getDefault();
        const cards = this.cardRepository.findAll();
        return {
            status: 200,
            view: 'board/index',
            locals: { board: toBoardViewModel(board, cards) },
        };
    }
    /** TODO (Atividade 4): excluir um cartão existente. */
    remove(_id) {
        const card = this.cardRepository.findById(_id);
        if (!card) {
            throw new CardNotFoundError(_id);
        }
        this.cardRepository.delete(_id);
        const board = this.boardRepository.getDefault();
        const cards = this.cardRepository.findAll();
        return {
            status: 200,
            view: 'board/index',
            locals: { board: toBoardViewModel(board, cards) },
        };
    }
    /** TODO (Atividade 8, estica): página de detalhe de um cartão. */
    showDetail(_id) {
        throw new NotImplementedError('CardController#showDetail');
    }
    /** TODO (Atividade 9, estica): buscar cartões por título (`?query=`). */
    search(_query) {
        throw new NotImplementedError('CardController#search');
    }
}
