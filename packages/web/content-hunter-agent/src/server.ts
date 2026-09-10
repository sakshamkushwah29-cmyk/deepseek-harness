import { buildApp } from './app.js'

const app = await buildApp()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3088

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`Content Hunter Agent running at http://localhost:${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
