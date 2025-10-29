import type { Tool } from "./types";
import "./BoardCanvas.css";
import { DrawingSettings } from "./DrawingSettings";

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

      <div className={`eraser-select ${tool === "pointer" ? "open" : ""}`}>
        <button
          className={`tool-button ${tool === "pointer" ? "active" : ""}`}
          title="Pointer"
          onClick={() => setTool("pointer")}
        >
          ↖
        </button>
      </div>

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
          onClick={() => setTool("pencil")}
        >
          ✏️
        </button>

        <DrawingSettings
          color={color}
          setColor={setColor}
          width={width}
          setWidth={setWidth}
        />
      </div>

      <div className={`pencil-select ${tool === "ellipse" ? "open" : ""}`}>
        <button
          className={`tool-button ${tool === "ellipse" ? "active" : ""}`}
          title="Ellipse"
          onClick={() => setTool("ellipse")}
        >
          ⚪
        </button>

        <DrawingSettings
          color={color}
          setColor={setColor}
          width={width}
          setWidth={setWidth}
        />
      </div>

      <div className={`pencil-select ${tool === "rect" ? "open" : ""}`}>
        <button
          className={`tool-button ${tool === "rect" ? "active" : ""}`}
          title="Rect"
          onClick={() => setTool("rect")}
        >
          ⬛
        </button>

        <DrawingSettings
          color={color}
          setColor={setColor}
          width={width}
          setWidth={setWidth}
        />
      </div>
    </div>
  );
}
