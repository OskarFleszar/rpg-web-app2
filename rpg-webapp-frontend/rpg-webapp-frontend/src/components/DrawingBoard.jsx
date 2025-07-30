import React, { useRef, useEffect, useState } from "react";
import { over } from "stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import axios from "axios";
import "../styles/DrawingBoard.sass";

let stompClient = null;

const DrawingBoard = ({ campaignId, isGameMaster }) => {
  const canvasRef = useRef(null);
  const subscribedRef = useRef(false);
  const [drawings, setDrawings] = useState([]);
  const [activeTool, setActiveTool] = useState("drawing");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState({
    color: "#000000",
    lineWidth: 2,
    points: [],
  });
  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("userData"));

  const MAX_BATCH_SIZE = 500;

  const connectWebSocket = () => {
    if (stompClient && stompClient.connected) return;

    const Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);

    stompClient.connect(
      { Authorization: `Bearer ${token}` },
      onConnected,
      (err) => console.error("WebSocket error:", err)
    );
  };

  const onConnected = () => {
    console.log("WebSocket connected");
    if (!subscribedRef.current) {
      stompClient.subscribe(`/topic/${campaignId}`, onDrawingReceived);
      subscribedRef.current = true;
    }
  };

  const onDrawingReceived = (payload) => {
    if (payload.body === "CLEAR_BOARD") {
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      setDrawings([]);
      return;
    }

    if (payload.body === "UNDO") {
      loadDrawings();
      return;
    }

    const receivedDrawing = JSON.parse(payload.body);

    if (receivedDrawing && Array.isArray(receivedDrawing.points)) {
      setDrawings((prev) => [...prev, receivedDrawing]);
      renderDrawing(receivedDrawing);
    } else {
      console.error("Invalid drawing received:", receivedDrawing);
    }
  };

  const sendDrawingInBatches = (drawingData) => {
    const points = drawingData.points;
    const totalBatches = Math.ceil(points.length / MAX_BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const batchPoints = points.slice(
        i * MAX_BATCH_SIZE,
        (i + 1) * MAX_BATCH_SIZE
      );

      stompClient.send(
        `/app/drawing/${campaignId}`,
        {},
        JSON.stringify({
          points: batchPoints,
          color: activeTool === "eraser" ? "#ffffff" : drawingData.color,
          lineWidth: drawingData.lineWidth,
        })
      );
    }
    setDrawingData({ ...drawingData, points: [] });
  };

  const sendDrawing = () => {
    if (stompClient && stompClient.connected && drawingData.points.length > 0) {
      sendDrawingInBatches(drawingData);
    }
  };

  const loadDrawings = () => {
    axios
      .get(`http://localhost:8080/api/drawing/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setDrawings(response.data))
      .catch((err) => console.error("Error loading drawings:", err));
  };

  const renderDrawing = (drawing) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawing || !Array.isArray(drawing.points)) return;

    const context = canvas.getContext("2d");
    context.strokeStyle = drawing.color || "#000000";
    context.lineWidth = drawing.lineWidth || 2;

    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    drawing.points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.stroke();
  };

  const renderAllDrawings = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawings.forEach((drawing) => renderDrawing(drawing));
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawingData((prev) => ({
      ...prev,
      points: [...prev.points, { x, y }],
    }));
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.strokeStyle =
      activeTool === "eraser" ? "#ffffff" : drawingData.color;
    context.lineWidth = drawingData.lineWidth;
    context.lineJoin = "round";
    context.lineCap = "round";

    context.beginPath();
    const lastPoint = drawingData.points[drawingData.points.length - 1];
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(x, y);
    context.stroke();

    setDrawingData((prev) => ({
      ...prev,
      points: [...prev.points, { x, y }],
    }));
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    sendDrawing();
  };

  useEffect(() => {
    connectWebSocket();
    loadDrawings();

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
      subscribedRef.current = false;
    };
  }, [campaignId]);

  useEffect(() => {
    renderAllDrawings();
  }, [drawings]);

  useEffect(() => {
    const handleUndo = (event) => {
      if (event.ctrlKey && event.key === "z") {
        undoLastDrawing();
      }
    };

    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, []);

  const undoLastDrawing = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/drawing/undo/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDrawings((prevDrawings) =>
        prevDrawings.filter(
          (drawing, index) => index !== prevDrawings.length - 1
        )
      );

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      renderAllDrawings();
    } catch (error) {
      console.error("Failed to undo the last drawing:", error);
    }
  };

  const clearBoard = () => {
    axios
      .delete(`http://localhost:8080/api/drawing/clear/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setDrawings([]);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        console.log("Board cleared successfully.");
        loadDrawings();
      })
      .catch((err) => {
        console.error("Error clearing the board:", err);
        alert("Failed to clear the board.");
      });
  };

  return (
    <div className="drawing-board-container">
      <div className="controls">
        <div className="tools">
          <button
            onClick={() => setActiveTool("drawing")}
            style={{
              marginRight: "10px",
              backgroundColor: activeTool === "drawing" ? "gray" : "#242424",
              color: "white",
            }}
          >
            Drawing
          </button>
          <button
            onClick={() => setActiveTool("eraser")}
            style={{
              backgroundColor: activeTool === "eraser" ? "gray" : "#242424",
              color: "white",
            }}
          >
            Eraser
          </button>
        </div>

        <label>
          Color:
          <input
            type="color"
            value={drawingData.color}
            onChange={(e) =>
              setDrawingData((prev) => ({ ...prev, color: e.target.value }))
            }
            style={{ marginLeft: "10px" }}
          />
        </label>
        <label style={{ marginTop: "20px" }}>
          Line width:
          <input
            type="number"
            min="1"
            max="20"
            value={drawingData.lineWidth}
            onChange={(e) =>
              setDrawingData((prev) => ({
                ...prev,
                lineWidth: parseInt(e.target.value, 10),
              }))
            }
            style={{ marginLeft: "10px", width: "50px" }}
          />
        </label>
        {isGameMaster && (
          <button
            className="clear-board-btn"
            onClick={() => clearBoard()}
            style={{
              marginTop: "20px",
              backgroundColor: "grey",
              color: "white",
            }}
          >
            Clear Board
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="canvas"
        width={1000}
        height={800}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
};

export default DrawingBoard;
