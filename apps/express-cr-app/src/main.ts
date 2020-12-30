import * as express from 'express'
import * as mysql from 'mysql'
import {
  toMessagePublishedData,
} from '@google/events/cloud/pubsub/v1/MessagePublishedData'

const app = express()

app.use(express.json())

app.post('/', (req, res) => {
  console.log('req.body', req.body)
  if (!req.body) {
    const errorMessage = 'no Pub/Sub message received'
    res.status(200).send(`Bad Request: ${errorMessage}`)
    console.log(`Bad Request: ${errorMessage}`)
    return
  }
  if (!req.body.message) {
    const errorMessage = 'invalid Pub/Sub message format'
    res.status(200).send(`Bad Request: ${errorMessage}`)
    console.log(`Bad Request: ${errorMessage}`)
    return
  }
  const pubSubMessage = toMessagePublishedData(req.body)
  const name =
    pubSubMessage.message && pubSubMessage.message.data
      ? Buffer.from(pubSubMessage.message.data, 'base64').toString().trim()
      : 'World'

  const result = `Hello, ${name}! ID: ${req.get('ce-id') || ''}`
  console.log(result)
  res.send(result)
})


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS
})

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as thread id: ' + connection.threadId);
  
  const port = process.env.PORT || 3333

  const server = app.listen(port, () => {
    console.log(`Listening on ${port}`)
  })

  server.on('error', console.error)

})
