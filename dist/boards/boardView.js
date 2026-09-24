function priorityBadgeClass(priority) {
    switch (priority) {
        case 'alta':
            return 'bg-red-100 text-red-700';
        case 'média':
            return 'bg-yellow-100 text-yellow-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
}
function toCardViewModel(card) {
    return {
        id: card.id,
        title: card.title,
        description: card.description,
        priority: card.priority,
        priorityBadgeClass: priorityBadgeClass(card.priority),
    };
}
export function toBoardViewModel(board, cards) {
    const snapshot = board.toSnapshot();
    return {
        id: snapshot.id,
        name: snapshot.name,
        columns: snapshot.columns.map((column) => {
            const columnCards = cards.filter((c) => c.columnId === column.id).map(toCardViewModel);
            return {
                id: column.id,
                name: column.name,
                wipLimit: column.wipLimit,
                cards: columnCards,
                isOverWipLimit: column.wipLimit !== null && columnCards.length > column.wipLimit,
            };
        }),
    };
}
