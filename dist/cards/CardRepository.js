export class InMemoryCardRepository {
    constructor() {
        this.cards = new Map();
    }
    save(card) {
        this.cards.set(card.id, card);
    }
    findAll() {
        return Array.from(this.cards.values());
    }
    findById(id) {
        return this.cards.get(id);
    }
    findByColumn(columnId) {
        return this.findAll().filter((card) => card.columnId === columnId);
    }
    existsWithTitleInColumn(title, columnId, excludeId) {
        const normalized = title.trim().toLowerCase();
        return this.findAll().some((card) => card.id !== excludeId && card.columnId === columnId && card.title.toLowerCase() === normalized);
    }
    delete(id) {
        this.cards.delete(id);
    }
}
