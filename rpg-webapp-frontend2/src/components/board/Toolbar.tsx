import type { Tool } from "./types";
import "./BoardCanvas.css";

type Props = {
  tool: Tool;
  setTool: (t: Tool) => void;
  color: string;
  setColor: (c: string) => void;
  width: number;
  setWidth: (n: number) => void;
  eraserSize: number;
  setEraserSize: (n: number) => void;
};

export default function Toolbar(props: Props) {
  const {
    tool,
    setTool,
    color,
    setColor,
    width,
    setWidth,
    eraserSize,
    setEraserSize,
  } = props;
  return (
    <div className={`board-toolbar ${tool === "pencil" ? "pencil-open" : ""}`}>
      <button
        className={`tool-button ${tool === "hand" ? "active" : ""}`}
        title="Pan"
        onClick={() => setTool("hand")}
      >
        ✋
      </button>

      <div className={`eraser-select ${tool === "eraser" ? "open" : ""}`}>
        <button
          className={`tool-button ${tool === "eraser" ? "active" : ""}`}
          title="Eraser"
          onClick={() => setTool("eraser")}
        >
          🩹
        </button>
        <div className="drawing-settings">
          <label className="tool-tile">
            <input
              type="number"
              min={1}
              value={eraserSize}
              onChange={(e) => setEraserSize(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className={`pencil-select ${tool === "pencil" ? "open" : ""}`}>
        <button
          className={`tool-button ${tool === "pencil" ? "active" : ""}`}
          title="Pencil"
          onClick={() => setTool(tool === "pencil" ? "hand" : "pencil")}
        >
          ✏️
        </button>

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
      </div>
    </div>
  );
}
