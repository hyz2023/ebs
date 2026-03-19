import { createServerApp } from './app';

const port = Number(process.env.PORT ?? 3000);
const app = createServerApp();

app.listen(port, () => {
  console.log(`EBS server listening on http://localhost:${port}`);
});
