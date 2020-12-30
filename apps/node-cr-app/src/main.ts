import { createServer } from 'http'
import { PubSub } from '@google-cloud/pubsub'

console.log(process.env);

const pubsub = new PubSub()

async function publishMessage() {

  const dataBuffer = Buffer.from(JSON.stringify({ data: 'testing!' }));

  try {
    const messageId = await pubsub.topic(process.env.TOPIC_NAME).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }

}

const server = createServer(async (req, res) => {
  await publishMessage()
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('sent!');
  res.end();
})

const port = process.env.PORT || 8080

server.listen(port, () => console.log(`listening on ${port}`))
