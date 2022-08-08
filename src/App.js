import './App.css';
import { useState, useEffect } from 'react';
import Cursor from './components/Cursor/Cursor';
import ColorMenu from './components/ColorMenu/ColorMenu';
import COLORS from './colors';

const BOX_W = 700;
const BOX_H = 400;
const ws = new WebSocket('ws://localhost:7071/ws');

function App() {
  const [currColorIdx, setCurrColorIdx] = useState(1);

  useEffect(() => {
    function init() {
      console.log('init called');
      const box = document.getElementById('box');
      const ball = document.getElementById('ball');
      const rect = box.getBoundingClientRect();

      ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);
        if (messageBody.tag === 'update') {
          let cursor = document.getElementById(messageBody.sender);
          if (!cursor)
            cursor = makeCursor(messageBody.sender, messageBody.color);
          cursor.style.transform = `translate(${messageBody.x + 1}px, ${
            messageBody.y + 1
          }px)`;

          if (messageBody.hasBall) {
            ball.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;
            ball.style.border = `6px solid ${messageBody.color}`;
          } else {
            ball.style.border = null;
          }
        } else if (messageBody.tag === 'welcome') {
          console.log(messageBody.data);
          messageBody.data.forEach((cursorData, i) => {
            let cursor = makeCursor(cursorData.id, cursorData.color);
            cursor.style.transform = `translate(${cursorData.x + 1}px, ${
              cursorData.y + 1
            }px)`;
          });
        } else if (messageBody.tag === 'removal') {
          const cursorToDelete = document.getElementById(messageBody.id);
          cursorToDelete.remove();
        }
      };

      let hasBall = false;

      document.onmousemove = (evt) => {
        const messageBody = {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top,
          hasBall: hasBall,
          color: COLORS[currColorIdx],
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
        }
      };

      document.onmouseup = (evt) => {
        hasBall = false;
      };
    }
    init();
  }, []);

  function makeCursor(id, color) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.id = id;
    cursor.innerHTML = `<svg height="16" width="16">
        <polygon points="0,0 16,6 6,16" fill="${color}" stroke='#000' />
    </svg>`;
    document.getElementById('box').appendChild(cursor);
    return cursor;
  }

  return (
    <div className="App">
      <div id="box" style={{ width: `${BOX_W}px`, height: `${BOX_H}px` }}>
        <div
          id="ball"
          style={{ transform: `translate(${BOX_W / 2}px, ${BOX_H / 2}px)` }}
        ></div>
      </div>
    </div>
  );
}

export default App;
