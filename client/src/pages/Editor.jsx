// ⭐ FULLY ENHANCED PROFESSIONAL EDITOR (Fabric.js + MUI) ⭐

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, TextField, Paper, Stack, Typography, Divider,
  Select, MenuItem, FormControl, InputLabel, Slider, Tabs, Tab,
  IconButton, ButtonGroup
} from "@mui/material";

import {
  FormatBold, FormatItalic, FormatUnderlined, RotateLeft,
  RotateRight, Delete, Save, Download, Image as ImageIcon,
  Undo, Redo, Flip, Layers, ContentCopy
} from "@mui/icons-material";

import API from "../utils/api";

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana"];

export default function Editor() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [designTitle, setDesignTitle] = useState("Untitled Design");
  const [currentTab, setCurrentTab] = useState(0);

  // TEXT SETTINGS
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [textStrokeColor, setTextStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [textBgColor, setTextBgColor] = useState("transparent");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);

  // IMAGE FILTER SETTINGS
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);

  const navigate = useNavigate();

  /* ---------------------------------------------------
      INITIALIZE CANVAS
  --------------------------------------------------- */
  useEffect(() => {
    const c = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 1080,
      backgroundColor: "#ffffff"
    });

    setCanvas(c);

    c.on("selection:created", (e) => setSelectedObject(e.selected[0]));
    c.on("selection:updated", (e) => setSelectedObject(e.selected[0]));
    c.on("selection:cleared", () => setSelectedObject(null));

    return () => c.dispose();
  }, []);

  /* ---------------------------------------------------
      UPLOAD IMAGE
  --------------------------------------------------- */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        img.set({
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: "center",
          originY: "center",
          scaleX: 0.5,
          scaleY: 0.5
        });
        canvas.add(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  /* ---------------------------------------------------
      ADD TEXT
  --------------------------------------------------- */
  const addText = () => {
    if (!textInput.trim()) return;
    const t = new fabric.Textbox(textInput, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: "center",
      originY: "center",
      fontSize,
      fill: textColor,
      fontFamily,
      stroke: textStrokeColor,
      strokeWidth,
      backgroundColor: textBgColor,
      charSpacing: letterSpacing,
      lineHeight
    });
    canvas.add(t);
    canvas.renderAll();
    setTextInput("");
  };

  /* ---------------------------------------------------
      APPLY IMAGE FILTERS
  --------------------------------------------------- */
  const applyFilters = () => {
    if (!selectedObject || selectedObject.type !== "image") return;

    selectedObject.filters = [
      new fabric.Image.filters.Brightness({ brightness }),
      new fabric.Image.filters.Contrast({ contrast }),
      new fabric.Image.filters.Saturation({ saturation }),
      new fabric.Image.filters.Blur({ blur })
    ];

    selectedObject.applyFilters();
    canvas.renderAll();
  };

  /* ---------------------------------------------------
      OBJECT CONTROLS
  --------------------------------------------------- */
  const deleteSelected = () => {
    if (!selectedObject) return;
    canvas.remove(selectedObject);
    canvas.renderAll();
  };

  const duplicate = () => {
    if (!selectedObject) return;

    selectedObject.clone((cloned) => {
      cloned.left += 20;
      cloned.top += 20;
      canvas.add(cloned);
      canvas.renderAll();
    });
  };

  const bringForward = () => selectedObject && canvas.bringForward(selectedObject);
  const sendBackward = () => selectedObject && canvas.sendBackwards(selectedObject);

  const rotate = (deg) => {
    if (!selectedObject) return;
    selectedObject.rotate(selectedObject.angle + deg);
    canvas.renderAll();
  };

  const flipHorizontal = () => {
    if (!selectedObject) return;
    selectedObject.set("flipX", !selectedObject.flipX);
    canvas.renderAll();
  };

  const flipVertical = () => {
    if (!selectedObject) return;
    selectedObject.set("flipY", !selectedObject.flipY);
    canvas.renderAll();
  };

  /* ---------------------------------------------------
      SAVE DESIGN (JSON + Thumbnail)
  --------------------------------------------------- */
  const saveDesign = async () => {
    const jsonData = canvas.toJSON();
    const thumbnail = canvas.toDataURL("image/png");

    await API.post("/designs", {
      title: designTitle,
      jsonData,
      thumbnailUrl: thumbnail
    });

    alert("Design Saved!");
  };

  /* ---------------------------------------------------
      EXPORT PNG
  --------------------------------------------------- */
  const exportImage = () => {
    const link = document.createElement("a");
    link.download = `${designTitle}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  /* ---------------------------------------------------
      JSX UI STARTS
  --------------------------------------------------- */

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>

      {/* LEFT TOOL PANEL */}
      <Paper sx={{ width: 360, p: 2, overflowY: "scroll" }}>

        {/* HEADER */}
        <TextField
          fullWidth
          label="Design Title"
          value={designTitle}
          onChange={(e) => setDesignTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="Media" />
          <Tab label="Text" />
          <Tab label="Edit" />
        </Tabs>

        <Divider sx={{ my: 2 }} />

        {/* MEDIA TAB */}
        {currentTab === 0 && (
          <Stack spacing={2}>
            <Button variant="contained" onClick={() => fileInputRef.current.click()}>
              Upload Image
            </Button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            <ButtonGroup>
              <Button onClick={flipHorizontal}>Flip X</Button>
              <Button onClick={flipVertical}>Flip Y</Button>
            </ButtonGroup>

            <ButtonGroup>
              <Button onClick={() => rotate(-10)}>Rotate Left</Button>
              <Button onClick={() => rotate(10)}>Rotate Right</Button>
            </ButtonGroup>

            <Typography variant="subtitle2">IMAGE FILTERS</Typography>

            <Slider value={brightness} onChange={(e,v)=>{setBrightness(v);applyFilters()}} min={-1} max={1} step={0.01} />
            <Slider value={contrast} onChange={(e,v)=>{setContrast(v);applyFilters()}} min={-1} max={1} step={0.01} />
            <Slider value={saturation} onChange={(e,v)=>{setSaturation(v);applyFilters()}} min={-1} max={1} step={0.01} />
            <Slider value={blur} onChange={(e,v)=>{setBlur(v);applyFilters()}} min={0} max={1} step={0.01} />

          </Stack>
        )}

        {/* TEXT TAB */}
        {currentTab === 1 && (
          <Stack spacing={2}>
            <TextField
              multiline
              rows={3}
              label="Enter text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />

            <Button variant="contained" onClick={addText}>Add Text</Button>

            <FormControl fullWidth>
              <InputLabel>Font</InputLabel>
              <Select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                {FONTS.map((f) => (
                  <MenuItem key={f} value={f}>{f}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Slider min={12} max={150} value={fontSize} onChange={(e,v)=>setFontSize(v)} />

            <TextField type="color" label="Color" value={textColor}
              onChange={(e) => setTextColor(e.target.value)} />

            <TextField type="color" label="Stroke Color" value={textStrokeColor}
              onChange={(e) => setTextStrokeColor(e.target.value)} />

            <Slider min={0} max={10} value={strokeWidth}
              onChange={(e,v)=>setStrokeWidth(v)} />

            <TextField type="color" label="BG Color"
              value={textBgColor} onChange={(e)=>setTextBgColor(e.target.value)} />

            <Slider min={0} max={500} value={letterSpacing}
              onChange={(e,v)=>setLetterSpacing(v)} />

            <Slider min={0.5} max={3} step={0.1} value={lineHeight}
              onChange={(e,v)=>setLineHeight(v)} />

          </Stack>
        )}

        {/* EDIT TAB */}
        {currentTab === 2 && (
          <Stack spacing={2}>
            <Button onClick={duplicate}>Duplicate</Button>
            <Button onClick={bringForward}>Bring Forward</Button>
            <Button onClick={sendBackward}>Send Backward</Button>
            <Button color="error" variant="outlined" onClick={deleteSelected}>Delete</Button>
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        <Button variant="contained" color="success" fullWidth onClick={saveDesign}>
          Save
        </Button>

        <Button variant="outlined" fullWidth onClick={exportImage}>
          Export PNG
        </Button>

      </Paper>

      {/* CANVAS AREA */}
      <Box sx={{ flex: 1, p: 3, display: "flex", justifyContent: "center" }}>
        <Paper elevation={10} sx={{ p: 2 }}>
          <canvas ref={canvasRef} />
        </Paper>
      </Box>
    </Box>
  );
}
