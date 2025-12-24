import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  Box,
  Button,
  Stack,
  Typography,
  Divider
} from "@mui/material";
import GridOnIcon from "@mui/icons-material/GridOn";
import ContentCutIcon from "@mui/icons-material/ContentCut";

const Editor = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [selectedObject, setSelectedObject] = useState(null);
  const [collageLayout, setCollageLayout] = useState("grid"); 
  // grid | freestyle | stitch | ai

  /* ---------------- CANVAS INIT ---------------- */
  useEffect(() => {
    const canvas = new fabric.Canvas("editor-canvas", {
      width: 900,
      height: 550,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true
    });

    fabricRef.current = canvas;

    canvas.on("selection:created", e => setSelectedObject(e.selected[0]));
    canvas.on("selection:updated", e => setSelectedObject(e.selected[0]));
    canvas.on("selection:cleared", () => setSelectedObject(null));

    return () => canvas.dispose();
  }, []);

  const canvas = fabricRef.current;

  /* ---------------- GRID OVERLAY ---------------- */
  const drawGrid = (rows, cols) => {
    if (!canvas) return;

    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    for (let i = 1; i < cols; i++) {
      canvas.add(
        new fabric.Line([i * cellW, 0, i * cellW, canvas.height], {
          stroke: "#e5e7eb",
          selectable: false,
          evented: false
        })
      );
    }

    for (let j = 1; j < rows; j++) {
      canvas.add(
        new fabric.Line([0, j * cellH, canvas.width, j * cellH], {
          stroke: "#e5e7eb",
          selectable: false,
          evented: false
        })
      );
    }
  };

  /* ---------------- COLLAGE HANDLER ---------------- */
  const handleCollageImages = e => {
    const files = Array.from(e.target.files || []);
    if (!canvas || files.length === 0) return;

    canvas.getObjects().forEach(o => {
      if (!o.excludeFromExport) canvas.remove(o);
    });

    /* -------- FREESTYLE -------- */
    if (collageLayout === "freestyle") {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
          fabric.Image.fromURL(ev.target.result, img => {
            img.set({
              left: Math.random() * 500,
              top: Math.random() * 300,
              scaleX: 0.3,
              scaleY: 0.3
            });
            canvas.add(img);
            canvas.renderAll();
          });
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    /* -------- STITCH -------- */
    if (collageLayout === "stitch") {
      let y = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
          fabric.Image.fromURL(ev.target.result, img => {
            const scale = canvas.width / img.width;
            img.set({
              left: canvas.width / 2,
              top: y,
              originX: "center",
              scaleX: scale,
              scaleY: scale
            });
            y += img.height * scale;
            canvas.add(img);
            canvas.renderAll();
          });
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    /* -------- GRID (DEFAULT) -------- */
    const cols = Math.ceil(Math.sqrt(files.length));
    const rows = Math.ceil(files.length / cols);
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;
    const padding = 20;

    drawGrid(rows, cols);

    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = ev => {
        fabric.Image.fromURL(ev.target.result, img => {
          const r = Math.floor(i / cols);
          const c = i % cols;

          const scale = Math.min(
            (cellW - padding) / img.width,
            (cellH - padding) / img.height
          );

          img.set({
            left: c * cellW + cellW / 2,
            top: r * cellH + cellH / 2,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale
          });

          canvas.add(img);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    });
  };

  /* ---------------- STICKER CUT ---------------- */
  const createSticker = () => {
    if (!selectedObject || selectedObject.type !== "image") return;

    selectedObject.clone(clone => {
      clone.set({
        left: 70,
        top: 70,
        scaleX: 0.25,
        scaleY: 0.25,
        cornerStyle: "circle",
        borderColor: "#22c55e"
      });

      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.renderAll();
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <Box display="flex" height="100vh">
      {/* LEFT PANEL */}
      <Box width={260} p={2} bgcolor="#f9fafb">
        <Typography fontWeight={600}>Collage</Typography>
        <Divider sx={{ my: 1 }} />

        {["grid", "freestyle", "ai", "stitch"].map(mode => (
          <Button
            key={mode}
            fullWidth
            variant={collageLayout === mode ? "contained" : "outlined"}
            sx={{ mb: 1, borderRadius: 3 }}
            startIcon={<GridOnIcon />}
            onClick={() => setCollageLayout(mode)}
          >
            {mode.toUpperCase()}
          </Button>
        ))}

        <Divider sx={{ my: 2 }} />

        <Button component="label" fullWidth variant="contained">
          Upload Images
          <input hidden multiple type="file" onChange={handleCollageImages} />
        </Button>
      </Box>

      {/* CANVAS */}
      <Box flex={1} display="flex" justifyContent="center" alignItems="center">
        <canvas id="editor-canvas" ref={canvasRef} />
      </Box>

      {/* RIGHT PANEL */}
      <Box width={220} p={2} bgcolor="#f9fafb">
        <Typography fontWeight={600}>Edit</Typography>
        <Divider sx={{ my: 1 }} />

        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<ContentCutIcon />}
          onClick={createSticker}
          disabled={!selectedObject}
        >
          Create Sticker
        </Button>
      </Box>
    </Box>
  );
};

export default Editor;
