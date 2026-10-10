import { closeMongo, connectMongo } from './db/mongo.mjs';
import { createApiServer } from './app.mjs';
import { startSourceRefreshScheduler } from './ingestion/refresh.mjs';
import { validateConfig } from './config.mjs';

validateConfig();
const connection = await connectMongo();
const server = createApiServer({ connection });
const stopRefresh = startSourceRefreshScheduler(server.knowledgeStore, {
  enabled: process.env.SOURCE_REFRESH_ENABLED !== 'false',
  pollMs: Number(process.env.SOURCE_REFRESH_POLL_MS || 60000),
});
const port = Number(process.env.PORT || 3000);

server.requestTimeout = 15000;
server.listen(port, '0.0.0.0', () => console.info(`TRAIL API listening on ${port}`));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    stopRefresh();
    await new Promise((resolve) => server.close(resolve));
    await server.authService.waitForEmailJobs();
    await closeMongo(connection);
    process.exit(0);
  });
}
