const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 7071 });
const clients = new Map();

const COLORS = [
  '#ffca38',
  '#74d675',
  '#b584d1',
  '#e07097',
  '#69b5e0',
  '#cc7435',
];

let ctr = 0;

wss.on('connection', (ws) => {
  const id = uuidv4();
  const color = COLORS[ctr % COLORS.length];
  const x = 0;
  const y = 0;
  const metadata = { id, color, x, y };
  ctr++;
  let metadataArr = [...clients.values()];
  let welcomeMessage = { data: metadataArr };
  welcomeMessage.tag = 'welcome';
  ws.send(JSON.stringify(welcomeMessage));
  clients.set(ws, metadata);

  ws.on('message', (messageAsString) => {
    const message = JSON.parse(messageAsString);
    let metadata = clients.get(ws);

    message.sender = metadata.id;
    message.color = metadata.color;
    metadata.x = message.x;
    metadata.y = message.y;
    clients.set(ws, metadata);
    message.tag = 'update';

    [...clients.keys()].forEach((client) => {
      client.send(JSON.stringify(message));
    });

    // console.log(message);
  });

  ws.on('close', () => {
    const lastPos = `(${clients.get(ws).x}, ${clients.get(ws).y})`;
    console.log(
      `connection closed; deleting client. their last position was ${lastPos}}`
    );
    [...clients.keys()].forEach((client) => {
      client.send(
        JSON.stringify({
          tag: 'removal',
          id: clients.get(ws).id,
        })
      );
    });
    clients.delete(ws);
  });
});

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

console.log('wss up');
