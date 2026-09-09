import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = fastify({ logger: true });

await app.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/',
});

app.get('/health', async () => ({ status: 'ok' }));

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3081;

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Virtual Pet server running at http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}