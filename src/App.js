import './App.css';
import { useState, useEffect } from 'react';
import Cursor from './components/Cursor/Cursor';
import ColorMenu from './components/ColorMenu/ColorMenu';
import COLORS from './colors';

const BOX_W = 700;
const BOX_H = 400;

function App() {
  const [currColorIdx, setCurrColorIdx] = useState(1);

  async function connectToServer() {
    const ws = new WebSocket('ws://localhost:7071/ws');
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (ws.readyState === 1) {
          clearInterval(timer);
          resolve(ws);
        }
      }, 10);
    });
  }

  useEffect(() => {
    async function init() {
      const ws = await connectToServer();
      const box = document.getElementById('box');
      const ball = document.getElementById('ball');
      const rect = box.getBoundingClientRect();

      ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);
        let cursor = document.getElementById(messageBody.sender);
        if (!cursor) cursor = makeCursor(messageBody);
        cursor.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;

        if (messageBody.hasBall) {
          ball.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;
          ball.style.border = `6px solid hsl(${messageBody.color}, 50%, 50%)`;
        } else {
          ball.style.border = null;
        }
      };

      let hasBall = false;

      document.onmousemove = (evt) => {
        const messageBody = {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top,
          hasBall: hasBall,
        };
        ws.send(JSON.stringify(messageBody));
      };

      document.onmousedown = (evt) => {
        const ballSize = 100;

        const ballX = parseInt(
          ball.style.transform.split('translate(').join('').split('px')[0]
        );
        const ballY = parseInt(
          ball.style.transform.split('px, ')[1].split('px)')[0]
        );
        const mouseX = evt.clientX - rect.left;
        const mouseY = evt.clientY - rect.top;

        if (
          mouseX > ballX - ballSize / 2 &&
          mouseX < ballX + ballSize / 2 &&
          mouseY > ballY - ballSize / 2 &&
          mouseY < ballY + ballSize / 2
        ) {
          hasBall = true;
          console.log('has ball true');
        }
      };

      document.onmouseup = (evt) => {
        hasBall = false;
      };
    }
    init();
  }, []);

  function makeCursor(messageBody) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.id = messageBody.sender;
    cursor.innerHTML = `<svg height="16" width="16">
        <polygon points="0,0 16,6 6,16" fill="hsl(${messageBody.color}, 50%, 50%)" stroke='#000' />
    </svg>`;
    document.getElementById('box').appendChild(cursor);
  }

  return (
    <div className="App">
      <div id="box" style={{ width: `${BOX_W}px`, height: `${BOX_H}px` }}>
        <div
          id="ball"
          style={{ transform: `translate(${BOX_W / 2}px, ${BOX_H / 2}px)` }}
        ></div>
      </div>
      <ColorMenu
        currColorIdx={currColorIdx}
        setCurrColorIdx={setCurrColorIdx}
      />
    </div>
  );
}

export default App;
