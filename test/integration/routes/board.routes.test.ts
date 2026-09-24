import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/server.js';
import { buildTestRepositories } from '../../helpers/fixtures.js';

describe('GET /', () => {
  it('renderiza o quadro com suas colunas', async () => {
    const app = createServer(buildTestRepositories());

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('Quadro de Teste');
    expect(response.text).toContain('Coluna 1');
    expect(response.text).toContain('Coluna 2');
  });
});

describe('POST /columns', () => {
  it('cria uma coluna e responde 302', async () => {
    const repositories = buildTestRepositories();
    const app = createServer(repositories);

    const response = await request(app).post('/columns').send({ name: 'Nova Coluna' });

    expect(response.status).toBe(302);
    expect(repositories.boardRepository.getDefault().columns).toHaveLength(3);
    expect(repositories.boardRepository.getDefault().columns.at(-1)?.name).toBe('Nova Coluna');
  });
});
