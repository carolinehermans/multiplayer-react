import './App.css';
import { useState, useEffect } from 'react';
import Cursor from './components/Cursor/Cursor';
import ColorMenu from './components/ColorMenu/ColorMenu';
import COLORS from './colors';

const BOX_W = 700;
const BOX_H = 400;

function App() {
  const [ballX, setBallX] = useState(BOX_W / 2);
  const [ballY, setBallY] = useState(BOX_H / 2);

  const [cursorX, setCursorX] = useState(null);
  const [cursorY, setCursorY] = useState(null);

  const [cursors, setCursors] = useState([]);
  const [cursorData, setCursorData] = useState({});

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

      ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);
        let cursor = document.getElementById(messageBody.sender);
        if (!cursor) cursor = makeCursor(messageBody);
        cursor.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;
      };

      document.onmousemove = (evt) => {
        const rect = box.getBoundingClientRect();
        const messageBody = {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top,
        };
        ws.send(JSON.stringify(messageBody));
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
    <div
      className="App"
      onMouseMove={(e) => {
        // }
      }}
    >
      <div id="box" style={{ width: `${BOX_W}px`, height: `${BOX_H}px` }}></div>
      <ColorMenu
        currColorIdx={currColorIdx}
        setCurrColorIdx={setCurrColorIdx}
      />
    </div>
  );
}

export default App;
