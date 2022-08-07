import './Cursor.css';

function Cursor({ id, x, y, color }) {
  return (
    <div
      id={id}
      className="cursor"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg height="16" width="16">
        <polygon points="0,0 16,6 6,16" fill={color} stroke={'#000'} />
      </svg>
    </div>
  );
}

export default Cursor;
