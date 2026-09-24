import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createServer } from '../../src/server.js';
import { createSeededRepositories } from '../../src/seed.js';

/**
 * Único fluxo ponta a ponta que faz sentido no estado inicial do template:
 * abrir o quadro e ver os dados hard-coded (`src/seed.ts`). Usa
 * `createServer()` SEM injetar repositórios — ou seja, o quadro e os
 * cartões reais que qualquer pessoa vê ao rodar `npm run dev`.
 */
describe('Estado inicial: visualização do quadro hard-coded', () => {
  it('GET / mostra o quadro, as três colunas e os cartões semeados', async () => {
    const app = createServer();

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Quadro do Projeto');
    expect(response.text).toContain('A Fazer');
    expect(response.text).toContain('Em Andamento');
    expect(response.text).toContain('Concluído');
    expect(response.text).toContain('Criar cartão (Atividade 1)');
  });

  it('a coluna "Em Andamento" mostra o limite de WIP (1/3) e não está estourada', async () => {
    const app = createServer();

    const response = await request(app).get('/');

    expect(response.text).toContain('1/3');
  });

  it('cartões de prioridade alta, média e baixa aparecem com rótulos diferentes', async () => {
    const app = createServer();

    const response = await request(app).get('/');

    expect(response.text).toContain('alta');
    expect(response.text).toContain('média');
    expect(response.text).toContain('baixa');
  });
});

describe('Jornada completa das atividades obrigatórias', () => {
  it('cria → move → edita → conclui → exclui um cartão, tudo via HTTP', async () => {
    const repositories = createSeededRepositories();
    const app = createServer(repositories);

    const createResponse = await request(app).post('/cards').send({
      title: 'Cartão da jornada completa',
      columnId: 'col-todo',
      priority: 'alta',
      description: 'Descrição inicial',
    });

    expect(createResponse.status).toBe(302);

    const createdCard = repositories.cardRepository
      .findAll()
      .find((card) => card.title === 'Cartão da jornada completa');
    expect(createdCard).toBeDefined();

    const cardId = createdCard!.id;

    const moveToDoingResponse = await request(app)
      .post(`/cards/${cardId}/move`)
      .send({ columnId: 'col-doing' });
    expect(moveToDoingResponse.status).toBe(201);

    const updateResponse = await request(app)
      .post(`/cards/${cardId}/update`)
      .send({
        title: 'Cartão da jornada editado',
        description: 'Descrição editada',
        priority: 'média',
      });
    expect(updateResponse.status).toBe(200);

    const moveToDoneResponse = await request(app)
      .post(`/cards/${cardId}/move`)
      .send({ columnId: 'col-done' });
    expect(moveToDoneResponse.status).toBe(201);

    const deleteResponse = await request(app).post(`/cards/${cardId}/delete`);
    expect(deleteResponse.status).toBe(200);
    expect(repositories.cardRepository.findById(cardId)).toBeUndefined();
  });
});
