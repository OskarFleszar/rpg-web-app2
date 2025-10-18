type Props = {
  color: string;
  setColor: (c: string) => void;
  width: number;
  setWidth: (n: number) => void;
};

export function DrawingSettings({ color, setColor, width, setWidth }: Props) {
  return (
    <div className="drawing-settings">
      <label className="tool-tile">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </label>

      <label className="tool-tile">
        <input
          type="number"
          min={1}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
