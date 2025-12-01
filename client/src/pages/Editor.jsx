import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { 
  Box, Button, TextField, Paper, Stack, Typography, Divider,
  Select, MenuItem, FormControl, InputLabel, Slider, Grid, IconButton,
  Tabs, Tab, Card, Chip, ButtonGroup, Switch, FormControlLabel, Tooltip
} from "@mui/material";
import { 
  Brush, FormatBold, FormatItalic, FormatUnderlined, RotateLeft,
  RotateRight, Delete, Clear, Save, Download, Image as ImageIcon,
  Layers, Palette, FilterVintage, Brightness6, Contrast, Tune,
  ContentCut, FlipToBack, ZoomIn, ZoomOut, Undo, Redo
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const COLOR_PALETTE = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52BE80",
  "#EC7063", "#AF7AC5", "#5DADE2", "#48C9B0", "#F4D03F",
  "#EB984E", "#CACFD2", "#000000", "#FFFFFF", "#95A5A6"
];

const FONTS = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana",
  "Comic Sans MS", "Impact", "Trebuchet MS", "Arial Black", "Palatino"
];

const BRUSH_TYPES = [
  { name: "Pencil", value: "pencil" },
  { name: "Brush", value: "brush" },
  { name: "Spray", value: "spray" },
  { name: "Marker", value: "marker" },
  { name: "Eraser", value: "eraser" }
];

const FILTERS = [
  { name: "None", value: "none" },
  { name: "Grayscale", value: "grayscale" },
  { name: "Sepia", value: "sepia" },
  { name: "Vintage", value: "vintage" },
  { name: "Polaroid", value: "polaroid" },
  { name: "Brighten", value: "brighten" },
  { name: "Contrast+", value: "contrast" },
  { name: "Invert", value: "invert" }
];

export default function Editor() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const [designTitle, setDesignTitle] = useState("Untitled Design");
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedObject, setSelectedObject] = useState(null);
  
  // Drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushType, setBrushType] = useState("pencil");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  
  // Text
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  // Filters
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 1080,
      backgroundColor: "#ffffff"
    });
    
    setCanvas(fabricCanvas);
    
    fabricCanvas.on('selection:created', (e) => setSelectedObject(e.selected[0]));
    fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.selected[0]));
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));

    return () => fabricCanvas.dispose();
  }, []);

  useEffect(() => {
    if (!canvas) return;
    
    if (isDrawing) {
      canvas.isDrawingMode = true;
      switch(brushType) {
        case 'spray':
          canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = brushColor;
          break;
        case 'brush':
          canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = brushColor;
          break;
        case 'marker':
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          canvas.freeDrawingBrush.width = brushSize * 2;
          canvas.freeDrawingBrush.color = brushColor + '80';
          break;
        case 'eraser':
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = canvas.backgroundColor || "#ffffff";
          break;
        default:
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = brushColor;
      }
    } else {
      canvas.isDrawingMode = false;
    }
  }, [isDrawing, brushType, brushSize, brushColor, canvas]);

  const handleImageUpload = (e) => {
    if (!canvas) return;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height) * 0.8;
        
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const addText = () => {
    if (!canvas || !textInput.trim()) return;
    
    const text = new fabric.Text(textInput, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: fontSize,
      fill: textColor,
      fontFamily: fontFamily,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTextInput("");
  };

  const addShape = (type) => {
    if (!canvas) return;
    
    let shape;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    
    switch(type) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: center.x,
          top: center.y,
          originX: 'center',
          originY: 'center',
          width: 200,
          height: 150,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 3
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: center.x,
          top: center.y,
          originX: 'center',
          originY: 'center',
          radius: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 3
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: center.x,
          top: center.y,
          originX: 'center',
          originY: 'center',
          width: 150,
          height: 150,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: 3
        });
        break;
    }
    
    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
    }
  };

  const applyFilter = (filterType) => {
    if (!selectedObject || selectedObject.type !== 'image') {
      alert("Please select an image first!");
      return;
    }

    selectedObject.filters = [];

    switch(filterType) {
      case 'grayscale':
        selectedObject.filters.push(new fabric.Image.filters.Grayscale());
        break;
      case 'sepia':
        selectedObject.filters.push(new fabric.Image.filters.Sepia());
        break;
      case 'vintage':
        selectedObject.filters.push(new fabric.Image.filters.Sepia());
        selectedObject.filters.push(new fabric.Image.filters.Brightness({ brightness: -0.1 }));
        break;
      case 'polaroid':
        selectedObject.filters.push(new fabric.Image.filters.Sepia());
        selectedObject.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 }));
        selectedObject.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.1 }));
        break;
      case 'brighten':
        selectedObject.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.3 }));
        break;
      case 'contrast':
        selectedObject.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.3 }));
        break;
      case 'invert':
        selectedObject.filters.push(new fabric.Image.filters.Invert());
        break;
    }

    selectedObject.applyFilters();
    canvas.renderAll();
  };

  const applyCustomFilters = () => {
    if (!selectedObject || selectedObject.type !== 'image') return;

    selectedObject.filters = [];
    
    if (brightness !== 0) {
      selectedObject.filters.push(new fabric.Image.filters.Brightness({ brightness: brightness / 100 }));
    }
    if (contrast !== 0) {
      selectedObject.filters.push(new fabric.Image.filters.Contrast({ contrast: contrast / 100 }));
    }
    if (saturation !== 0) {
      selectedObject.filters.push(new fabric.Image.filters.Saturation({ saturation: saturation / 100 }));
    }
    if (blur !== 0) {
      selectedObject.filters.push(new fabric.Image.filters.Blur({ blur: blur / 100 }));
    }

    selectedObject.applyFilters();
    canvas.renderAll();
  };

  const removeBackground = () => {
    if (!selectedObject || selectedObject.type !== 'image') {
      alert("Please select an image first!");
      return;
    }
    alert("Background removal requires an AI API (e.g., remove.bg). This is a placeholder for the feature.");
  };

  const rotateObject = (direction) => {
    if (!selectedObject) return;
    const currentAngle = selectedObject.angle || 0;
    selectedObject.rotate(currentAngle + (direction === 'left' ? -15 : 15));
    canvas.renderAll();
  };

  const flipObject = (direction) => {
    if (!selectedObject) return;
    if (direction === 'horizontal') {
      selectedObject.set('flipX', !selectedObject.flipX);
    } else {
      selectedObject.set('flipY', !selectedObject.flipY);
    }
    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!selectedObject) return;
    canvas.remove(selectedObject);
    canvas.renderAll();
  };

  const clearCanvas = () => {
    if (confirm("Clear entire canvas?")) {
      canvas.clear();
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();
    }
  };

  const saveDesign = async () => {
    if (!canvas) return;
    try {
      const jsonData = canvas.toJSON();
      const thumbnailUrl = canvas.toDataURL({ format: "png", quality: 0.8 });
      await API.post("/designs", { title: designTitle, jsonData, thumbnailUrl });
      alert("✅ Design saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving design:", error);
      alert("❌ Failed to save design");
    }
  };

  const exportImage = (format) => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ 
      format: format, 
      quality: format === 'png' ? 1 : 0.9, 
      multiplier: 2 
    });
    const link = document.createElement("a");
    link.download = `${designTitle}.${format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Sidebar */}
      <Paper 
        sx={{ 
          width: 350, 
          overflowY: "auto",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
          <Button
            size="small"
            onClick={() => navigate("/dashboard")}
            sx={{ color: "white", mb: 1 }}
          >
            ← Back to Dashboard
          </Button>
          <TextField
            fullWidth
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                "&.Mui-focused fieldset": { borderColor: "white" }
              }
            }}
          />
        </Box>

        {/* Tabs */}
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)} 
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": { fontWeight: 600, textTransform: "none" }
          }}
        >
          <Tab label="🖌️ Draw" />
          <Tab label="📝 Text" />
          <Tab label="🎨 Effects" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {/* DRAW TAB */}
          {currentTab === 0 && (
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => fileInputRef.current.click()}
                startIcon={<ImageIcon />}
                sx={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Drawing Tools</Typography>
              
              <FormControl fullWidth size="small">
                <InputLabel>Brush Type</InputLabel>
                <Select value={brushType} label="Brush Type" onChange={(e) => setBrushType(e.target.value)}>
                  {BRUSH_TYPES.map((brush) => (
                    <MenuItem key={brush.value} value={brush.value}>{brush.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch checked={isDrawing} onChange={(e) => setIsDrawing(e.target.checked)} />}
                label="Enable Drawing Mode"
              />

              {isDrawing && (
                <>
                  <Box>
                    <Typography variant="caption">Brush Size: {brushSize}px</Typography>
                    <Slider value={brushSize} onChange={(e, v) => setBrushSize(v)} min={1} max={50} />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ mb: 1, display: "block" }}>Brush Color</Typography>
                    <Grid container spacing={0.5}>
                      {COLOR_PALETTE.slice(0, 15).map((color) => (
                        <Grid item xs={2.4} key={color}>
                          <Box
                            onClick={() => setBrushColor(color)}
                            sx={{
                              width: "100%",
                              height: 35,
                              bgcolor: color,
                              border: brushColor === color ? "3px solid #000" : "1px solid #ddd",
                              borderRadius: 1,
                              cursor: "pointer",
                              transition: "transform 0.2s",
                              "&:hover": { transform: "scale(1.1)" }
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </>
              )}

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Shapes</Typography>
              <ButtonGroup fullWidth variant="outlined">
                <Button onClick={() => addShape('rectangle')}>□ Rect</Button>
                <Button onClick={() => addShape('circle')}>○ Circle</Button>
                <Button onClick={() => addShape('triangle')}>△ Triangle</Button>
              </ButtonGroup>

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Transform</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button fullWidth variant="outlined" onClick={() => rotateObject('left')} startIcon={<RotateLeft />}>Rotate</Button>
                </Grid>
                <Grid item xs={6}>
                  <Button fullWidth variant="outlined" onClick={() => flipObject('horizontal')} startIcon={<FlipToBack />}>Flip</Button>
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="outlined" color="error" onClick={deleteSelected} startIcon={<Delete />}>Delete Selected</Button>
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* TEXT TAB */}
          {currentTab === 1 && (
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton 
                  size="small" 
                  color={isBold ? "primary" : "default"}
                  onClick={() => setIsBold(!isBold)}
                  sx={{ border: 1 }}
                >
                  <FormatBold />
                </IconButton>
                <IconButton 
                  size="small" 
                  color={isItalic ? "primary" : "default"}
                  onClick={() => setIsItalic(!isItalic)}
                  sx={{ border: 1 }}
                >
                  <FormatItalic />
                </IconButton>
                <IconButton 
                  size="small" 
                  color={isUnderline ? "primary" : "default"}
                  onClick={() => setIsUnderline(!isUnderline)}
                  sx={{ border: 1 }}
                >
                  <FormatUnderlined />
                </IconButton>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Font Family</InputLabel>
                <Select value={fontFamily} label="Font Family" onChange={(e) => setFontFamily(e.target.value)}>
                  {FONTS.map((font) => (
                    <MenuItem key={font} value={font} style={{ fontFamily: font }}>{font}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption">Font Size: {fontSize}px</Typography>
                <Slider value={fontSize} onChange={(e, v) => setFontSize(v)} min={12} max={120} />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ mb: 1, display: "block" }}>Text Color</Typography>
                <Grid container spacing={0.5}>
                  {COLOR_PALETTE.map((color) => (
                    <Grid item xs={2.4} key={color}>
                      <Box
                        onClick={() => setTextColor(color)}
                        sx={{
                          width: "100%",
                          height: 35,
                          bgcolor: color,
                          border: textColor === color ? "3px solid #000" : "1px solid #ddd",
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": { transform: "scale(1.1)" }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Enter Text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
              
              <Button
                fullWidth
                variant="contained"
                onClick={addText}
                disabled={!textInput.trim()}
                sx={{ background: "linear-gradient(45deg, #667eea, #764ba2)", py: 1.5 }}
              >
                Add Text
              </Button>
            </Stack>
          )}

          {/* EFFECTS TAB */}
          {currentTab === 2 && (
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Quick Filters</Typography>
              <Grid container spacing={1}>
                {FILTERS.map((filter) => (
                  <Grid item xs={6} key={filter.value}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => applyFilter(filter.value)}
                    >
                      {filter.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Custom Adjustments</Typography>
              
              <Box>
                <Typography variant="caption">Brightness: {brightness}</Typography>
                <Slider value={brightness} onChange={(e, v) => setBrightness(v)} min={-100} max={100} />
              </Box>

              <Box>
                <Typography variant="caption">Contrast: {contrast}</Typography>
                <Slider value={contrast} onChange={(e, v) => setContrast(v)} min={-100} max={100} />
              </Box>

              <Box>
                <Typography variant="caption">Saturation: {saturation}</Typography>
                <Slider value={saturation} onChange={(e, v) => setSaturation(v)} min={-100} max={100} />
              </Box>

              <Box>
                <Typography variant="caption">Blur: {blur}</Typography>
                <Slider value={blur} onChange={(e, v) => setBlur(v)} min={0} max={100} />
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={applyCustomFilters}
                sx={{ background: "linear-gradient(45deg, #667eea, #764ba2)" }}
              >
                Apply Filters
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => { setBrightness(0); setContrast(0); setSaturation(0); setBlur(0); }}
              >
                Reset Filters
              </Button>

              <Divider />

              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={removeBackground}
                startIcon={<ContentCut />}
              >
                Remove Background (AI)
              </Button>
            </Stack>
          )}
        </Box>

        {/* Bottom Actions */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", background: "#f5f5f5" }}>
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={saveDesign}
              startIcon={<Save />}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              Save Design
            </Button>
            <ButtonGroup fullWidth>
              <Button onClick={() => exportImage('png')} startIcon={<Download />}>PNG</Button>
              <Button onClick={() => exportImage('jpeg')} startIcon={<Download />}>JPG</Button>
            </ButtonGroup>
            <Button fullWidth variant="outlined" color="error" onClick={clearCanvas} startIcon={<Clear />}>
              Clear Canvas
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Canvas Area */}
      <Box sx={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        p: 3
      }}>
        <Paper
          elevation={10}
          sx={{
            p: 2,
            borderRadius: 3,
            background: "white",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}
        >
          <canvas ref={canvasRef} />
        </Paper>
      </Box>
    </Box>
  );
}