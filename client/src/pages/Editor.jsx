import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Button, TextField, Paper, Stack, Typography, Divider, Select, MenuItem,
  FormControl, InputLabel, Slider, Tabs, Tab, IconButton, ButtonGroup, Grid,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, ToggleButton,
  ToggleButtonGroup, Chip, Card, CardMedia
} from "@mui/material";
import {
  FormatBold, FormatItalic, FormatUnderlined, Delete, Save, Download,
  Image as ImageIcon, Undo, Redo, Flip, ContentCopy, ZoomIn, ZoomOut,
  Crop, Palette, TextFields, Circle, Square, Star, Brightness6, Contrast,
  Opacity, BlurOn, AutoAwesome, ChangeCircle, Hexagon, Pentagon, Polyline,
  Add, CheckCircle, RotateLeft, RotateRight, FlipToFront, FlipToBack
} from "@mui/icons-material";
import API from "../utils/api";

const FONTS = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New",
  "Comic Sans MS", "Impact", "Trebuchet MS", "Palatino", "Garamond", "Bookman",
  "Arial Black", "Tahoma", "Lucida Console", "Monaco", "Brush Script MT"
];

const FONT_STYLES = [
  { label: "Normal", value: "normal" },
  { label: "Bold", value: "bold" },
  { label: "Italic", value: "italic" },
  { label: "Bold Italic", value: "bold-italic" }
];

const TEMPLATES = {
  "ig-post-1": { width: 1080, height: 1080, bg: "#667eea" },
  "ig-post-2": { width: 1080, height: 1080, bg: "#f093fb" },
  "ig-post-3": { width: 1080, height: 1080, bg: "#4facfe" },
  "ig-story-1": { width: 1080, height: 1920, bg: "#fa709a" },
  "ig-story-2": { width: 1080, height: 1920, bg: "#30cfd0" },
  "ig-story-3": { width: 1080, height: 1920, bg: "#a8edea" },
  "fb-post-1": { width: 1200, height: 630, bg: "#667eea" },
  "fb-post-2": { width: 820, height: 312, bg: "#f093fb" },
  "twitter-post-1": { width: 1024, height: 512, bg: "#4facfe" },
  "twitter-header-1": { width: 1500, height: 500, bg: "#fa709a" },
  "linkedin-post-1": { width: 1200, height: 627, bg: "#30cfd0" },
  "pinterest-pin-1": { width: 1000, height: 1500, bg: "#a8edea" },
  "yt-thumb-1": { width: 1280, height: 720, bg: "#667eea" },
  "yt-thumb-2": { width: 1280, height: 720, bg: "#f093fb" },
  "yt-thumb-3": { width: 1280, height: 720, bg: "#4facfe" },
  "yt-banner-1": { width: 2560, height: 1440, bg: "#fa709a" },
  "ad-banner-1": { width: 728, height: 90, bg: "#667eea" },
  "ad-banner-2": { width: 300, height: 250, bg: "#f093fb" },
  "email-header-1": { width: 600, height: 200, bg: "#fa709a" },
  "business-card-1": { width: 1050, height: 600, bg: "#667eea" },
  "presentation-1": { width: 1920, height: 1080, bg: "#f093fb" },
  "invitation-1": { width: 1080, height: 1350, bg: "#667eea" },
  "poster-1": { width: 1080, height: 1920, bg: "#4facfe" },
  "certificate-1": { width: 1056, height: 816, bg: "#f093fb" }
};

export default function Editor() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const bgImageInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [designTitle, setDesignTitle] = useState("Untitled Design");
  const [leftTab, setLeftTab] = useState(0);
  const [rightTab, setRightTab] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [stickers, setStickers] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // TEXT SETTINGS
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontStyle, setFontStyle] = useState("normal");
  const [textColor, setTextColor] = useState("#000000");
  const [textAlign, setTextAlign] = useState("left");

  // IMAGE FILTERS
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);
  const [opacity, setOpacity] = useState(1);

  // ZOOM
  const [zoom, setZoom] = useState(1);

  /* Initialize Canvas */
  useEffect(() => {
    const templateId = searchParams.get("template");
    const template = templateId ? TEMPLATES[templateId] : { width: 1080, height: 1080, bg: "#ffffff" };

    const c = new fabric.Canvas(canvasRef.current, {
      width: template.width,
      height: template.height,
      backgroundColor: template.bg
    });

    setCanvas(c);

    c.on("selection:created", (e) => {
      setSelectedObject(e.selected[0]);
      updateControlsFromObject(e.selected[0]);
    });
    c.on("selection:updated", (e) => {
      setSelectedObject(e.selected[0]);
      updateControlsFromObject(e.selected[0]);
    });
    c.on("selection:cleared", () => setSelectedObject(null));
    c.on("object:modified", saveHistory);

    return () => c.dispose();
  }, [searchParams]);

  const updateControlsFromObject = (obj) => {
    if (obj.type === "textbox" || obj.type === "text") {
      setFontSize(obj.fontSize || 32);
      setFontFamily(obj.fontFamily || "Arial");
      setTextColor(obj.fill || "#000000");
    }
    if (obj.type === "image") {
      setOpacity(obj.opacity || 1);
    }
  };

  const saveHistory = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      canvas.loadFromJSON(history[historyStep - 1], canvas.renderAll.bind(canvas));
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      canvas.loadFromJSON(history[historyStep + 1], canvas.renderAll.bind(canvas));
    }
  };

  /* Upload Image */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        img.set({ left: canvas.width / 2, top: canvas.height / 2, originX: "center", originY: "center" });
        img.scaleToWidth(canvas.width * 0.5);
        canvas.add(img);
        canvas.renderAll();
        saveHistory();
      });
    };
    reader.readAsDataURL(file);
  };

  /* Background Image */
  const handleBackgroundImage = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height
        });
        saveHistory();
      });
    };
    reader.readAsDataURL(file);
  };

  /* Add Text */
  const addText = () => {
    if (!textInput.trim()) return;
    
    let fontWeight = "normal";
    let fontStyleVal = "normal";
    
    if (fontStyle === "bold") fontWeight = "bold";
    else if (fontStyle === "italic") fontStyleVal = "italic";
    else if (fontStyle === "bold-italic") {
      fontWeight = "bold";
      fontStyleVal = "italic";
    }

    const t = new fabric.Textbox(textInput, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: "center",
      originY: "center",
      fontSize,
      fill: textColor,
      fontFamily,
      fontWeight,
      fontStyle: fontStyleVal,
      textAlign
    });
    canvas.add(t);
    canvas.renderAll();
    setTextInput("");
    saveHistory();
  };

  /* Update Text Properties */
  const updateTextProperty = (property, value) => {
    if (!selectedObject || (selectedObject.type !== "textbox" && selectedObject.type !== "text")) return;
    
    if (property === "fontStyle") {
      if (value === "bold") {
        selectedObject.set("fontWeight", "bold");
        selectedObject.set("fontStyle", "normal");
      } else if (value === "italic") {
        selectedObject.set("fontWeight", "normal");
        selectedObject.set("fontStyle", "italic");
      } else if (value === "bold-italic") {
        selectedObject.set("fontWeight", "bold");
        selectedObject.set("fontStyle", "italic");
      } else {
        selectedObject.set("fontWeight", "normal");
        selectedObject.set("fontStyle", "normal");
      }
    } else {
      selectedObject.set(property, value);
    }
    canvas.renderAll();
  };

  /* Add Shapes */
  const addShape = (type) => {
    let shape;
    const center = { left: canvas.width / 2, top: canvas.height / 2, originX: "center", originY: "center" };
    
    switch(type) {
      case "circle":
        shape = new fabric.Circle({ ...center, radius: 50, fill: textColor });
        break;
      case "rectangle":
        shape = new fabric.Rect({ ...center, width: 100, height: 100, fill: textColor });
        break;
      case "triangle":
        shape = new fabric.Triangle({ ...center, width: 100, height: 100, fill: textColor });
        break;
      case "star":
        const points = [];
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? 50 : 25;
          const angle = (Math.PI * 2 * i) / 10;
          points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
        }
        shape = new fabric.Polygon(points, { ...center, fill: textColor });
        break;
      case "hexagon":
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6;
          hexPoints.push({ x: 50 * Math.cos(angle), y: 50 * Math.sin(angle) });
        }
        shape = new fabric.Polygon(hexPoints, { ...center, fill: textColor });
        break;
      case "pentagon":
        const pentPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          pentPoints.push({ x: 50 * Math.cos(angle), y: 50 * Math.sin(angle) });
        }
        shape = new fabric.Polygon(pentPoints, { ...center, fill: textColor });
        break;
      case "line":
        shape = new fabric.Line([50, 50, 150, 50], { ...center, stroke: textColor, strokeWidth: 3 });
        break;
    }
    canvas.add(shape);
    canvas.renderAll();
    saveHistory();
  };

  /* Apply Filters */
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
    saveHistory();
  };

  /* Object Controls */
  const deleteSelected = () => {
    if (!selectedObject) return;
    canvas.remove(selectedObject);
    canvas.renderAll();
    saveHistory();
  };

  const duplicate = () => {
    if (!selectedObject) return;
    selectedObject.clone((cloned) => {
      cloned.set({ left: cloned.left + 20, top: cloned.top + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveHistory();
    });
  };

  const rotate = (angle) => {
    if (!selectedObject) return;
    selectedObject.rotate(selectedObject.angle + angle);
    canvas.renderAll();
  };

  const flipH = () => {
    if (!selectedObject) return;
    selectedObject.set("flipX", !selectedObject.flipX);
    canvas.renderAll();
  };

  const flipV = () => {
    if (!selectedObject) return;
    selectedObject.set("flipY", !selectedObject.flipY);
    canvas.renderAll();
  };

  const bringToFront = () => {
    if (!selectedObject) return;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();
  };

  const sendToBack = () => {
    if (!selectedObject) return;
    canvas.sendToBack(selectedObject);
    canvas.renderAll();
  };

  /* Create Sticker */
  const createSticker = () => {
    if (!selectedObject || selectedObject.type !== "image") {
      alert("Please select an image first");
      return;
    }

    const dataUrl = selectedObject.toDataURL({ format: "png" });
    const newSticker = {
      id: Date.now(),
      url: dataUrl,
      name: `Sticker ${stickers.length + 1}`
    };
    setStickers([...stickers, newSticker]);
    alert("Sticker created! Check the Stickers tab.");
  };

  /* Add Sticker to Canvas */
  const addStickerToCanvas = (url) => {
    fabric.Image.fromURL(url, (img) => {
      img.set({ left: canvas.width / 2, top: canvas.height / 2, originX: "center", originY: "center" });
      img.scaleToWidth(150);
      canvas.add(img);
      canvas.renderAll();
      saveHistory();
    });
  };

  /* Zoom */
  const handleZoom = (delta) => {
    const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
    setZoom(newZoom);
    canvas.setZoom(newZoom);
    canvas.renderAll();
  };

  /* Save Design */
  const saveDesign = async () => {
    const jsonData = canvas.toJSON();
    const thumbnail = canvas.toDataURL("image/png");

    try {
      await API.post("/designs", { title: designTitle, jsonData, thumbnailUrl: thumbnail });
      alert("Design Saved Successfully! 🎉");
      setShowSaveDialog(false);
    } catch (error) {
      alert("Failed to save design");
    }
  };

  /* Export */
  const exportImage = () => {
    const link = document.createElement("a");
    link.download = `${designTitle}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", bgcolor: "#f5f5f5" }}>
      
      {/* TOP TOOLBAR */}
      <Box sx={{ position: "absolute", top: 0, left: 300, right: 300, bgcolor: "white", p: 1, zIndex: 10, boxShadow: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <TextField
            size="small"
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            sx={{ width: 250 }}
          />
          
          <ButtonGroup size="small">
            <Tooltip title="Undo"><IconButton onClick={undo} disabled={historyStep <= 0}><Undo /></IconButton></Tooltip>
            <Tooltip title="Redo"><IconButton onClick={redo} disabled={historyStep >= history.length - 1}><Redo /></IconButton></Tooltip>
          </ButtonGroup>

          <ButtonGroup size="small">
            <Tooltip title="Zoom Out"><IconButton onClick={() => handleZoom(-0.1)}><ZoomOut /></IconButton></Tooltip>
            <Typography sx={{ px: 2, display: "flex", alignItems: "center" }}>{Math.round(zoom * 100)}%</Typography>
            <Tooltip title="Zoom In"><IconButton onClick={() => handleZoom(0.1)}><ZoomIn /></IconButton></Tooltip>
          </ButtonGroup>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" onClick={() => setShowSaveDialog(true)} startIcon={<Save />}>Save</Button>
            <Button variant="outlined" onClick={exportImage} startIcon={<Download />}>Export</Button>
          </Stack>
        </Stack>
      </Box>

      {/* LEFT SIDEBAR */}
      <Paper sx={{ width: 300, overflowY: "auto", mt: 7, borderRight: "1px solid #ddd" }}>
        <Tabs value={leftTab} onChange={(e, v) => setLeftTab(v)} variant="fullWidth">
          <Tab label="Elements" />
          <Tab label="Text" />
          <Tab label="Stickers" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {/* ELEMENTS TAB */}
          {leftTab === 0 && (
            <Stack spacing={2}>
              <Typography variant="h6">Add Elements</Typography>
              
              <Button variant="contained" fullWidth onClick={() => fileInputRef.current.click()} startIcon={<ImageIcon />}>
                Upload Image
              </Button>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageUpload} />

              <Divider />

              <Typography variant="subtitle2">Shapes</Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("circle")}><Circle /></Button></Grid>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("rectangle")}><Square /></Button></Grid>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("triangle")}>△</Button></Grid>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("star")}><Star /></Button></Grid>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("hexagon")}><Hexagon /></Button></Grid>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("pentagon")}><Pentagon /></Button></Grid>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("line")}><Polyline /></Button></Grid>
              </Grid>
            </Stack>
          )}

          {/* TEXT TAB */}
          {leftTab === 1 && (
            <Stack spacing={2}>
              <Typography variant="h6">Add Text</Typography>
              
              <TextField
                multiline
                rows={3}
                label="Enter text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />

              <Button variant="contained" onClick={addText} fullWidth startIcon={<TextFields />}>Add Text</Button>

              <Divider />

              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select 
                  value={fontFamily} 
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    updateTextProperty("fontFamily", e.target.value);
                  }}
                >
                  {FONTS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Font Style</InputLabel>
                <Select 
                  value={fontStyle} 
                  onChange={(e) => {
                    setFontStyle(e.target.value);
                    updateTextProperty("fontStyle", e.target.value);
                  }}
                >
                  {FONT_STYLES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>

              <Typography variant="caption">Font Size: {fontSize}px</Typography>
              <Slider min={12} max={150} value={fontSize} onChange={(e,v)=>{setFontSize(v);updateTextProperty("fontSize", v);}} />

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption">Color:</Typography>
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateTextProperty("fill", e.target.value);
                  }}
                  style={{ width: 60, height: 40, border: "1px solid #ddd", cursor: "pointer" }}
                />
              </Stack>

              <FormControl fullWidth>
                <InputLabel>Text Align</InputLabel>
                <Select value={textAlign} onChange={(e) => {setTextAlign(e.target.value);updateTextProperty("textAlign", e.target.value);}}>
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="justify">Justify</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}

          {/* STICKERS TAB */}
          {leftTab === 2 && (
            <Stack spacing={2}>
              <Typography variant="h6">My Stickers</Typography>
              {stickers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No stickers yet. Create one from the Edit panel!</Typography>
              ) : (
                <Grid container spacing={1}>
                  {stickers.map((sticker) => (
                    <Grid item xs={6} key={sticker.id}>
                      <Card sx={{ cursor: "pointer" }} onClick={() => addStickerToCanvas(sticker.url)}>
                        <CardMedia component="img" height="80" image={sticker.url} alt={sticker.name} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          )}
        </Box>
      </Paper>

      {/* CANVAS AREA */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", mt: 7, p: 2, overflow: "auto", bgcolor: "#e0e0e0" }}>
        <Paper elevation={10} sx={{ p: 2 }}>
          <canvas ref={canvasRef} />
        </Paper>
      </Box>

      {/* RIGHT SIDEBAR */}
      <Paper sx={{ width: 300, overflowY: "auto", mt: 7, borderLeft: "1px solid #ddd" }}>
        <Tabs value={rightTab} onChange={(e, v) => setRightTab(v)} variant="fullWidth">
          <Tab label="Background" />
          <Tab label="Edit" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {/* BACKGROUND TAB */}
          {rightTab === 0 && (
            <Stack spacing={2}>
              <Typography variant="h6">Background</Typography>
              
              <Button variant="contained" fullWidth onClick={() => bgImageInputRef.current.click()} startIcon={<ImageIcon />}>
                Upload Background Image
              </Button>
              <input type="file" accept="image/*" ref={bgImageInputRef} style={{ display: "none" }} onChange={handleBackgroundImage} />

              <Divider />

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption">Solid Color:</Typography>
                <input 
                  type="color"
                  onChange={(e) => canvas.setBackgroundColor(e.target.value, canvas.renderAll.bind(canvas))}
                  style={{ width: 80, height: 40, border: "1px solid #ddd", cursor: "pointer" }}
                />
              </Stack>
            </Stack>
          )}

          {/* EDIT TAB */}
          {rightTab === 1 && (
            <Stack spacing={2}>
              <Typography variant="h6">Edit Object</Typography>
              
              {selectedObject ? (
                <>
                  <ButtonGroup fullWidth>
                    <Button onClick={duplicate} startIcon={<ContentCopy />}>Duplicate</Button>
                    <Button onClick={deleteSelected} color="error" startIcon={<Delete />}>Delete</Button>
                  </ButtonGroup>

                  <ButtonGroup fullWidth>
                    <Button onClick={() => rotate(-15)} startIcon={<RotateLeft />}>Rotate L</Button>
                    <Button onClick={() => rotate(15)} startIcon={<RotateRight />}>Rotate R</Button>
                  </ButtonGroup>

                  <ButtonGroup fullWidth>
                    <Button onClick={flipH}>Flip H</Button>
                    <Button onClick={flipV}>Flip V</Button>
                  </ButtonGroup>

                  <ButtonGroup fullWidth>
                    <Button onClick={bringToFront} startIcon={<FlipToFront />}>To Front</Button>
                    <Button onClick={sendToBack} startIcon={<FlipToBack />}>To Back</Button>
                  </ButtonGroup>

                  <Divider />

                  <Typography variant="caption">Opacity: {Math.round(opacity * 100)}%</Typography>
                  <Slider value={opacity} onChange={(e,v)=>{setOpacity(v);selectedObject.set("opacity", v);canvas.renderAll();}} min={0} max={1} step={0.01} />

                  {selectedObject.type === "image" && (
                    <>
                      <Divider />
                      <Typography variant="subtitle2">Image Filters</Typography>
                      
                      <Typography variant="caption">Brightness</Typography>
                      <Slider value={brightness} onChange={(e,v)=>{setBrightness(v);applyFilters();}} min={-1} max={1} step={0.01} />
                      
                      <Typography variant="caption">Contrast</Typography>
                      <Slider value={contrast} onChange={(e,v)=>{setContrast(v);applyFilters();}} min={-1} max={1} step={0.01} />
                      
                      <Typography variant="caption">Saturation</Typography>
                      <Slider value={saturation} onChange={(e,v)=>{setSaturation(v);applyFilters();}} min={-1} max={1} step={0.01} />
                      
                      <Typography variant="caption">Blur</Typography>
                      <Slider value={blur} onChange={(e,v)=>{setBlur(v);applyFilters();}} min={0} max={1} step={0.01} />

                      <Divider />
                      <Button variant="outlined" fullWidth onClick={createSticker} startIcon={<AutoAwesome />}>
                        Create Sticker
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">Select an object to edit</Typography>
              )}
            </Stack>
          )}
        </Box>
      </Paper>

      {/* SAVE DIALOG */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Design</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Design Title"
            fullWidth
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={saveDesign} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}