import './ColorMenu.css';
import COLORS from '../../colors';

function ColorMenu({ currColorIdx, setCurrColorIdx }) {
  return (
    <div className="color-menu">
      {COLORS.map((color, i) => {
        return (
          <div
            key={i}
            className={`color active-${i === currColorIdx}`}
            style={{ backgroundColor: color }}
            onClick={() => setCurrColorIdx(i)}
          ></div>
        );
      })}
    </div>
  );
}

export default ColorMenu;
