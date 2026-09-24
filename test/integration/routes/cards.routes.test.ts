import { describe, expect, it, test } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/server.js';
import { Card } from '../../../src/cards/Card.js';
import { buildTestRepositories } from '../../helpers/fixtures.js';

/**
 * Estas rotas ainda não fazem nada além de responder 501 — é o
 * comportamento CORRETO do estado inicial do template. Conforme vocês
 * implementam cada atividade, substituam o teste "responde 501" pelos
 * `test.todo` correspondentes (já escritos abaixo como checklist).
 */
describe('Rotas de cartões implementadas', () => {
  it('POST /cards cria um cartão e responde 302', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);
    const response = await request(app).post('/cards').send({ title: 'Novo cartão', columnId: 'col-1' });

    expect(response.status).toBe(302);
    expect(repositories.cardRepository.findAll()).toHaveLength(1);
    expect(repositories.cardRepository.findAll()[0].title).toBe('Novo cartão');
  });

  it('POST /cards responde 404 quando a coluna não existe', async () => {
    const app = createServer(buildTestRepositories());
    const response = await request(app).post('/cards').send({
      title: 'Novo cartão',
      columnId: 'col-inexistente',
    });

    expect(response.status).toBe(404);
  });

  it('POST /cards responde 409 para título duplicado na mesma coluna', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);

    await request(app).post('/cards').send({ title: 'Cartão duplicado', columnId: 'col-1' });
    const response = await request(app).post('/cards').send({
      title: '  cartão DUPLICADO  ',
      columnId: 'col-1',
    });

    expect(response.status).toBe(409);
  });

  it('POST /cards/:id/move responde 404 se o cartão não existe', async () => {
    const app = createServer(buildTestRepositories());
    const response = await request(app).post('/cards/qualquer-id/move').send({ columnId: 'col-2' });
    expect(response.status).toBe(404);
  });

  it('POST /cards/:id/update responde 404 se o cartão não existe', async () => {
    const app = createServer(buildTestRepositories());
    const response = await request(app).post('/cards/qualquer-id/update').send({ title: 'Editado' });
    expect(response.status).toBe(404);
  });

  it('POST /cards/:id/delete responde 404 se o cartão não existe', async () => {
    const app = createServer(buildTestRepositories());
    const response = await request(app).post('/cards/qualquer-id/delete');
    expect(response.status).toBe(404);
  });

  it('POST /cards/:id/move move um cartão e responde 201', async () => {
    const repositories = buildTestRepositories();
    const card = Card.create('Cartão para mover', 'col-1');
    repositories.cardRepository.save(card);
    const app = createServer(repositories);

    const response = await request(app).post('/cards/' + card.id + '/move').send({ columnId: 'col-2' });

    expect(response.status).toBe(201);
    expect(repositories.cardRepository.findById(card.id)?.columnId).toBe('col-2');
  });

  it('POST /cards/:id/move responde 404 quando a coluna destino não existe', async () => {
    const repositories = buildTestRepositories();
    const card = Card.create('Cartão para mover', 'col-1');
    repositories.cardRepository.save(card);
    const app = createServer(repositories);

    const response = await request(app).post('/cards/' + card.id + '/move').send({
      columnId: 'col-inexistente',
    });

    expect(response.status).toBe(404);
  });

  it('POST /cards/:id/move responde 409 quando a coluna destino atingiu o WIP', async () => {
    const repositories = buildTestRepositories();
    const board = repositories.boardRepository.getDefault();
    const destination = board.addColumn('Destino', 1);
    repositories.cardRepository.save(Card.create('Cartão existente', destination.id));
    const card = Card.create('Cartão para mover', 'col-1');
    repositories.cardRepository.save(card);
    const app = createServer(repositories);

    const response = await request(app).post('/cards/' + card.id + '/move').send({
      columnId: destination.id,
    });

    expect(response.status).toBe(409);
    expect(repositories.cardRepository.findById(card.id)?.columnId).toBe('col-1');
  });

  it('POST /cards/:id/move permite salvar o cartão na mesma coluna', async () => {
    const repositories = buildTestRepositories();
    const card = Card.create('Cartão na mesma coluna', 'col-1');
    repositories.cardRepository.save(card);
    const app = createServer(repositories);

    const response = await request(app).post('/cards/' + card.id + '/move').send({ columnId: 'col-1' });

    expect(response.status).toBe(201);
    expect(repositories.cardRepository.findById(card.id)?.columnId).toBe('col-1');
  });

  it('POST /cards/:id/update edita título, descrição e prioridade', async () => {
    const repositories = buildTestRepositories();
    const card = Card.create('Cartão original', 'col-1');
    repositories.cardRepository.save(card);
    const app = createServer(repositories);

    const response = await request(app).post('/cards/' + card.id + '/update').send({
      title: '  Cartão editado  ',
      description: '  Nova descrição  ',
      priority: 'alta',
    });

    expect(response.status).toBe(200);
    expect(card.title).toBe('Cartão editado');
    expect(card.description).toBe('Nova descrição');
    expect(card.priority).toBe('alta');
  });

  it('POST /cards/:id/update aceita atualização somente da prioridade', async () => {
    const repositories = buildTestRepositories();
    const card = Card.create('Cartão original', 'col-1', 'baixa', 'Descrição');
    repositories.cardRepository.save(card);
    const app = createServer(repositories);

    const response = await request(app).post('/cards/' + card.id + '/update').send({ priority: 'média' });

    expect(response.status).toBe(200);
    expect(card.title).toBe('Cartão original');
    expect(card.description).toBe('Descrição');
    expect(card.priority).toBe('média');
  });

  it('POST /cards/:id/update responde 409 para título duplicado', async () => {
    const repositories = buildTestRepositories();
    const firstCard = Card.create('Título usado', 'col-1');
    const secondCard = Card.create('Outro título', 'col-1');
    repositories.cardRepository.save(firstCard);
    repositories.cardRepository.save(secondCard);
    const app = createServer(repositories);

    const response = await request(app).post('/cards/' + secondCard.id + '/update').send({
      title: '  TÍTULO USADO  ',
    });

    expect(response.status).toBe(409);
    expect(secondCard.title).toBe('Outro título');
  });

  it('POST /cards/:id/delete remove um cartão e responde 200', async () => {
    const repositories = buildTestRepositories();
    const card = Card.create('Cartão para excluir', 'col-1');
    repositories.cardRepository.save(card);
    const app = createServer(repositories);

    const response = await request(app).post('/cards/' + card.id + '/delete');

    expect(response.status).toBe(200);
    expect(repositories.cardRepository.findById(card.id)).toBeUndefined();
  });
});

describe('Rotas de cartões ainda não implementadas', () => {
  it('GET /cards/:id responde 501 (Atividade 8, estica)', async () => {
    const app = createServer(buildTestRepositories());
    const response = await request(app).get('/cards/qualquer-id');
    expect(response.status).toBe(501);
  });

  it('GET /cards/search responde 501 (Atividade 9, estica)', async () => {
    const app = createServer(buildTestRepositories());
    const response = await request(app).get('/cards/search').query({ query: 'termo' });
    expect(response.status).toBe(501);
  });
});

describe('Checklist de atividades de extensão', () => {
  test.todo('GET /cards/:id renderiza a página de detalhe do cartão (Atividade 8)');
  test.todo('GET /cards/search?query=termo retorna só os cartões cujo título combina (Atividade 9)');
});

it('POST /cards/:id/update aceita somente descrição', async () => {
  const repositories = buildTestRepositories();
  const card = Card.create('Cartão original', 'col-1', 'baixa', 'Descrição antiga');
  repositories.cardRepository.save(card);

  const app = createServer(repositories);

  const response = await request(app)
    .post('/cards/' + card.id + '/update')
    .send({ description: 'Descrição nova' });

  expect(response.status).toBe(200);
  expect(card.title).toBe('Cartão original');
  expect(card.description).toBe('Descrição nova');
  expect(card.priority).toBe('baixa');
});
