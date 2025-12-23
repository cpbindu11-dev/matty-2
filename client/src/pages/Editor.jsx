import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Button, TextField, Paper, Stack, Typography, Divider, Select, MenuItem,
  FormControl, InputLabel, Slider, Tabs, Tab, IconButton, ButtonGroup, Grid,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, AppBar, Toolbar,
  ToggleButton, ToggleButtonGroup, Chip
} from "@mui/material";
import {
  Delete, Save, Download, Image as ImageIcon, Undo, Redo, ContentCopy, 
  ZoomIn, ZoomOut, TextFields, Circle, Square, RotateLeft, RotateRight, ArrowBack,
  FormatBold, FormatItalic, FormatUnderlined, Star, Favorite, EmojiEmotions,
  Gradient, Brightness4, FilterBAndW, Blur, Opacity as OpacityIcon
} from "@mui/icons-material";
import API from "../utils/api";

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Roboto", "Open Sans", "Montserrat", "Poppins", "Playfair Display", "Lora", "Dancing Script"];

const TEMPLATES = {
  "ig-post-1": { width: 1080, height: 1080, name: "Instagram Post - Gradient", colors: ["#667eea", "#764ba2"] },
  "ig-post-2": { width: 1080, height: 1080, name: "Instagram Post - Sunset", colors: ["#f093fb", "#f5576c"] },
  "ig-post-3": { width: 1080, height: 1080, name: "Instagram Post - Ocean", colors: ["#4facfe", "#00f2fe"] },
  "ig-story-1": { width: 1080, height: 1920, name: "Instagram Story - Vibrant", colors: ["#fa709a", "#fee140"] },
  "ig-story-2": { width: 1080, height: 1920, name: "Instagram Story - Dark", colors: ["#30cfd0", "#330867"] },
  "ig-story-3": { width: 1080, height: 1920, name: "Instagram Story - Pastel", colors: ["#a8edea", "#fed6e3"] },
  "fb-post-1": { width: 1200, height: 630, name: "Facebook Post", colors: ["#667eea", "#764ba2"] },
  "fb-cover-1": { width: 820, height: 312, name: "Facebook Cover", colors: ["#f093fb", "#f5576c"] },
  "twitter-post-1": { width: 1024, height: 512, name: "Twitter Post", colors: ["#4facfe", "#00f2fe"] },
  "twitter-header-1": { width: 1500, height: 500, name: "Twitter Header", colors: ["#fa709a", "#fee140"] },
  "linkedin-post-1": { width: 1200, height: 627, name: "LinkedIn Post", colors: ["#30cfd0", "#330867"] },
  "resume-1": { width: 816, height: 1056, name: "Professional Resume", colors: ["#667eea", "#764ba2"] },
  "resume-2": { width: 816, height: 1056, name: "Modern Resume", colors: ["#f093fb", "#f5576c"] },
  "poster-1": { width: 1080, height: 1920, name: "Event Poster", colors: ["#4facfe", "#00f2fe"] },
  "poster-2": { width: 1080, height: 1920, name: "Movie Poster", colors: ["#fa709a", "#fee140"] }
};

const COLOR_PALETTE = [
  "#667eea", "#f093fb", "#4facfe", "#fa709a", "#30cfd0", 
  "#a8edea", "#764ba2", "#f5576c", "#00f2fe", "#fee140",
  "#ffffff", "#000000", "#ff6b6b", "#4ecdc4", "#45b7d1",
  "#96ceb4", "#ffeaa7", "#dfe6e9", "#74b9ff", "#a29bfe"
];

const SHAPES = [
  { type: "rectangle", icon: <Square />, label: "Rectangle" },
  { type: "circle", icon: <Circle />, label: "Circle" },
  { type: "triangle", icon: "▲", label: "Triangle" },
  { type: "star", icon: <Star />, label: "Star" },
  { type: "heart", icon: <Favorite />, label: "Heart" },
  { type: "line", icon: "━", label: "Line" }
];

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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  
  // Text properties
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Poppins");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textAlign, setTextAlign] = useState("center");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [textDecoration, setTextDecoration] = useState("");
  
  // Object properties
  const [fillColor, setFillColor] = useState("#667eea");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [zoom, setZoom] = useState(1);
  
  // Image filters
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    const templateId = searchParams.get("template");
    const designId = searchParams.get("id");
    
    const template = templateId && TEMPLATES[templateId] 
      ? TEMPLATES[templateId] 
      : { width: 1080, height: 1080, name: "Custom Canvas", colors: ["#667eea", "#764ba2"] };

    setDesignTitle(template.name);

    const c = new fabric.Canvas(canvasRef.current, {
      width: template.width,
      height: template.height,
      backgroundColor: "#ffffff"
    });

    setCanvas(c);

    // Apply gradient background
    if (template.colors && template.colors.length >= 2) {
      const gradient = new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: c.width, y2: c.height },
        colorStops: [
          { offset: 0, color: template.colors[0] },
          { offset: 1, color: template.colors[1] }
        ]
      });
      c.setBackgroundColor(gradient, c.renderAll.bind(c));
    }

    if (templateId && !designId) {
      addPlaceholderText(c, template);
    }

    if (designId) {
      loadDesign(c, designId);
    }

    c.on("selection:created", (e) => {
      if (e.selected?.[0]) {
        setSelectedObject(e.selected[0]);
        updateControlsFromObject(e.selected[0]);
      }
    });
    
    c.on("selection:updated", (e) => {
      if (e.selected?.[0]) {
        setSelectedObject(e.selected[0]);
        updateControlsFromObject(e.selected[0]);
      }
    });
    
    c.on("selection:cleared", () => {
      setSelectedObject(null);
      resetControls();
    });
    
    c.on("object:modified", () => saveHistory(c));

    saveHistory(c);

    return () => c.dispose();
  }, [searchParams]);

  const addPlaceholderText = (canvasInstance, template) => {
    const titleSize = Math.min(template.width, template.height) * 0.08;
    const subtitleSize = Math.min(template.width, template.height) * 0.04;

    const titleText = new fabric.Textbox("Your Title Here", {
      left: canvasInstance.width / 2,
      top: canvasInstance.height * 0.4,
      originX: "center",
      originY: "center",
      fontSize: titleSize,
      fill: "#ffffff",
      fontFamily: "Poppins",
      fontWeight: "bold",
      textAlign: "center",
      width: canvasInstance.width * 0.8,
      shadow: "2px 2px 4px rgba(0,0,0,0.3)"
    });

    const subtitleText = new fabric.Textbox("Click to edit and customize", {
      left: canvasInstance.width / 2,
      top: canvasInstance.height * 0.55,
      originX: "center",
      originY: "center",
      fontSize: subtitleSize,
      fill: "#ffffff",
      fontFamily: "Arial",
      textAlign: "center",
      width: canvasInstance.width * 0.7,
      opacity: 0.9
    });

    canvasInstance.add(titleText, subtitleText);
    canvasInstance.renderAll();
    saveHistory(canvasInstance);
  };

  const loadDesign = async (canvasInstance, designId) => {
    try {
      const response = await API.get(`/designs/${designId}`);
      if (response.data?.jsonData) {
        canvasInstance.loadFromJSON(response.data.jsonData, () => {
          canvasInstance.renderAll();
          setDesignTitle(response.data.title || "Untitled Design");
          saveHistory(canvasInstance);
        });
      }
    } catch (error) {
      console.error("Error loading design:", error);
    }
  };

  const updateControlsFromObject = (obj) => {
    if (!obj) return;
    
    if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
      setFontSize(obj.fontSize || 48);
      setFontFamily(obj.fontFamily || "Poppins");
      setTextColor(obj.fill || "#ffffff");
      setTextAlign(obj.textAlign || "center");
      setFontWeight(obj.fontWeight || "normal");
      setFontStyle(obj.fontStyle || "normal");
      setTextDecoration(obj.underline ? "underline" : "");
    }
    
    if (obj.fill && typeof obj.fill === 'string') {
      setFillColor(obj.fill);
    }
    
    setStrokeColor(obj.stroke || "#000000");
    setStrokeWidth(obj.strokeWidth || 0);
    setOpacity(obj.opacity || 1);
    
    // Reset filters for images
    if (obj.type === "image") {
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setBlur(0);
    }
  };

  const resetControls = () => {
    setFontSize(48);
    setFontFamily("Poppins");
    setTextColor("#ffffff");
    setTextAlign("center");
    setFontWeight("normal");
    setFontStyle("normal");
    setTextDecoration("");
    setFillColor("#667eea");
    setStrokeColor("#000000");
    setStrokeWidth(0);
    setOpacity(1);
  };

  const saveHistory = (canvasInstance) => {
    if (!canvasInstance) return;
    try {
      const json = canvasInstance.toJSON();
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(json);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const undo = () => {
    if (!canvas || historyStep <= 0) return;
    setHistoryStep(historyStep - 1);
    canvas.loadFromJSON(history[historyStep - 1], () => canvas.renderAll());
  };

  const redo = () => {
    if (!canvas || historyStep >= history.length - 1) return;
    setHistoryStep(historyStep + 1);
    canvas.loadFromJSON(history[historyStep + 1], () => canvas.renderAll());
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        const scale = Math.min(canvas.width * 0.5 / img.width, canvas.height * 0.5 / img.height);
        img.set({ 
          left: canvas.width / 2, 
          top: canvas.height / 2, 
          originX: "center", 
          originY: "center", 
          scaleX: scale, 
          scaleY: scale 
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveHistory(canvas);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height
        });
        saveHistory(canvas);
      });
    };
    reader.readAsDataURL(file);
  };

  const addText = () => {
    if (!canvas) return;
    const text = textInput.trim() || "Double click to edit";
    const t = new fabric.Textbox(text, {
      left: canvas.width / 2, 
      top: canvas.height / 2, 
      originX: "center", 
      originY: "center",
      fontSize, 
      fill: textColor, 
      fontFamily, 
      textAlign,
      fontWeight,
      fontStyle,
      underline: textDecoration === "underline",
      width: 300
    });
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.renderAll();
    setTextInput("");
    saveHistory(canvas);
  };

  const updateTextProperty = (property, value) => {
    if (!selectedObject || !canvas) return;
    if (selectedObject.type === "textbox" || selectedObject.type === "text" || selectedObject.type === "i-text") {
      selectedObject.set(property, value);
      canvas.renderAll();
      saveHistory(canvas);
    }
  };

  const addShape = (shapeType) => {
    if (!canvas) return;
    let shape;
    const center = { 
      left: canvas.width / 2, 
      top: canvas.height / 2, 
      originX: "center", 
      originY: "center",
      fill: fillColor,
      stroke: strokeWidth > 0 ? strokeColor : null,
      strokeWidth: strokeWidth
    };
    
    switch(shapeType) {
      case "circle": 
        shape = new fabric.Circle({ ...center, radius: 50 }); 
        break;
      case "rectangle": 
        shape = new fabric.Rect({ ...center, width: 100, height: 100 }); 
        break;
      case "triangle":
        shape = new fabric.Triangle({ ...center, width: 100, height: 100 });
        break;
      case "star":
        const points = [];
        const numPoints = 5;
        const outerRadius = 50;
        const innerRadius = 25;
        for (let i = 0; i < numPoints * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / numPoints;
          points.push({
            x: radius * Math.sin(angle),
            y: -radius * Math.cos(angle)
          });
        }
        shape = new fabric.Polygon(points, { ...center });
        break;
      case "heart":
        const heartPath = "M140,20C73,20,20,74,20,140c0,135,136,170,228,303c88-132,229-173,229-303c0-66-54-120-120-120c-48,0-90,28-109,69c-19-41-60-69-108-69Z";
        shape = new fabric.Path(heartPath, { 
          ...center, 
          scaleX: 0.3, 
          scaleY: 0.3 
        });
        break;
      case "line":
        shape = new fabric.Line([0, 0, 100, 0], { 
          ...center, 
          stroke: strokeColor || fillColor,
          strokeWidth: strokeWidth || 2,
          fill: null
        });
        break;
      default: 
        return;
    }
    
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    saveHistory(canvas);
  };

  const applyImageFilter = (filterType, value) => {
    if (!selectedObject || !canvas || selectedObject.type !== "image") return;
    
    selectedObject.filters = selectedObject.filters || [];
    
    // Remove existing filter of same type
    selectedObject.filters = selectedObject.filters.filter(f => {
      const filterName = f.type || f.constructor.name;
      return filterName !== filterType;
    });
    
    // Add new filter if value is not default
    if (value !== 0 || filterType === "Grayscale") {
      let filter;
      switch(filterType) {
        case "Brightness":
          filter = new fabric.Image.filters.Brightness({ brightness: value / 100 });
          break;
        case "Contrast":
          filter = new fabric.Image.filters.Contrast({ contrast: value / 100 });
          break;
        case "Saturation":
          filter = new fabric.Image.filters.Saturation({ saturation: value / 100 });
          break;
        case "Blur":
          filter = new fabric.Image.filters.Blur({ blur: value / 100 });
          break;
        case "Grayscale":
          filter = new fabric.Image.filters.Grayscale();
          break;
        default:
          return;
      }
      selectedObject.filters.push(filter);
    }
    
    selectedObject.applyFilters();
    canvas.renderAll();
    saveHistory(canvas);
  };

  const deleteSelected = () => {
    if (!selectedObject || !canvas) return;
    canvas.remove(selectedObject);
    canvas.renderAll();
    saveHistory(canvas);
  };

  const duplicate = () => {
    if (!selectedObject || !canvas) return;
    selectedObject.clone((cloned) => {
      cloned.set({ left: cloned.left + 20, top: cloned.top + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveHistory(canvas);
    });
  };

  const rotateObject = (direction) => {
    if (!selectedObject || !canvas) return;
    const angle = direction === "left" ? -90 : 90;
    selectedObject.rotate((selectedObject.angle || 0) + angle);
    canvas.renderAll();
    saveHistory(canvas);
  };

  const handleZoom = (delta) => {
    if (!canvas) return;
    const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
    setZoom(newZoom);
    canvas.setZoom(newZoom);
    canvas.renderAll();
  };

  const saveDesign = async () => {
    if (!canvas) return;
    try {
      setSaveStatus({ type: 'info', message: 'Saving...' });
      const jsonData = canvas.toJSON();
      const thumbnail = canvas.toDataURL("image/png");
      await API.post("/designs", { title: designTitle, jsonData, thumbnailUrl: thumbnail });
      setSaveStatus({ type: 'success', message: 'Design saved! 🎉' });
      setTimeout(() => {
        setShowSaveDialog(false);
        setSaveStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus({ type: 'error', message: 'Failed to save.' });
    }
  };

  const exportImage = () => {
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${designTitle}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Top Toolbar */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: "white", color: "#1e293b" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate("/dashboard")}>
              <ArrowBack />
            </IconButton>
            <TextField 
              size="small" 
              value={designTitle} 
              onChange={(e) => setDesignTitle(e.target.value)} 
              sx={{ width: 250 }}
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Undo (Ctrl+Z)">
                <span>
                  <IconButton onClick={undo} disabled={historyStep <= 0} size="small">
                    <Undo fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Redo (Ctrl+Y)">
                <span>
                  <IconButton onClick={redo} disabled={historyStep >= history.length - 1} size="small">
                    <Redo fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </ButtonGroup>

            <ButtonGroup size="small" variant="outlined" sx={{ ml: 2 }}>
              <IconButton onClick={() => handleZoom(-0.1)} size="small">
                <ZoomOut fontSize="small" />
              </IconButton>
              <Button disabled sx={{ minWidth: 80, fontSize: "0.875rem" }}>
                {Math.round(zoom * 100)}%
              </Button>
              <IconButton onClick={() => handleZoom(0.1)} size="small">
                <ZoomIn fontSize="small" />
              </IconButton>
            </ButtonGroup>

            <Button 
              variant="contained" 
              color="success" 
              onClick={() => setShowSaveDialog(true)} 
              startIcon={<Save />}
              sx={{ ml: 2 }}
            >
              Save
            </Button>
            <Button 
              variant="outlined" 
              onClick={exportImage} 
              startIcon={<Download />}
            >
              Download
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar */}
        <Paper sx={{ width: 320, overflow: "auto", borderRadius: 0 }}>
          <Tabs value={leftTab} onChange={(e, v) => setLeftTab(v)} variant="fullWidth">
            <Tab label="Elements" />
            <Tab label="Text" />
            <Tab label="Shapes" />
          </Tabs>
          <Box sx={{ p: 2 }}>
            {/* Elements Tab */}
            {leftTab === 0 && (
              <Stack spacing={2}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => fileInputRef.current.click()} 
                  startIcon={<ImageIcon />}
                >
                  Upload Image
                </Button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: "none" }} 
                  onChange={handleImageUpload} 
                />
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => bgImageInputRef.current.click()}
                >
                  Set Background Image
                </Button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={bgImageInputRef} 
                  style={{ display: "none" }} 
                  onChange={handleBackgroundImage} 
                />
                
                <Divider />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Color Palette</Typography>
                <Grid container spacing={1}>
                  {COLOR_PALETTE.map((color) => (
                    <Grid item xs={2.4} key={color}>
                      <Box
                        onClick={() => setFillColor(color)}
                        sx={{
                          width: "100%",
                          paddingTop: "100%",
                          bgcolor: color,
                          borderRadius: 1,
                          cursor: "pointer",
                          border: fillColor === color ? "3px solid #000" : "1px solid #ddd",
                          transition: "all 0.2s",
                          "&:hover": { transform: "scale(1.1)" }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}
            
            {/* Text Tab */}
            {leftTab === 1 && (
              <Stack spacing={2}>
                <TextField 
                  multiline 
                  rows={2} 
                  label="Text Content" 
                  value={textInput} 
                  onChange={(e) => setTextInput(e.target.value)} 
                  placeholder="Enter your text..." 
                />
                <Button 
                  variant="contained" 
                  onClick={addText} 
                  fullWidth 
                  startIcon={<TextFields />}
                >
                  Add Text
                </Button>
                
                <Divider />
                
                <FormControl fullWidth size="small">
                  <InputLabel>Font Family</InputLabel>
                  <Select 
                    value={fontFamily} 
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      updateTextProperty("fontFamily", e.target.value);
                    }}
                  >
                    {FONTS.map((f) => <MenuItem key={f} value={f} style={{ fontFamily: f }}>{f}</MenuItem>)}
                  </Select>
                </FormControl>
                
                <Box>
                  <Typography variant="caption">Font Size: {fontSize}px</Typography>
                  <Slider 
                    min={12} 
                    max={200} 
                    value={fontSize} 
                    onChange={(e,v)=>{
                      setFontSize(v);
                      updateTextProperty("fontSize", v);
                    }} 
                  />
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                    Text Formatting
                  </Typography>
                  <ButtonGroup fullWidth size="small">
                    <Button 
                      variant={fontWeight === "bold" ? "contained" : "outlined"}
                      onClick={() => {
                        const newWeight = fontWeight === "bold" ? "normal" : "bold";
                        setFontWeight(newWeight);
                        updateTextProperty("fontWeight", newWeight);
                      }}
                    >
                      <FormatBold />
                    </Button>
                    <Button 
                      variant={fontStyle === "italic" ? "contained" : "outlined"}
                      onClick={() => {
                        const newStyle = fontStyle === "italic" ? "normal" : "italic";
                        setFontStyle(newStyle);
                        updateTextProperty("fontStyle", newStyle);
                      }}
                    >
                      <FormatItalic />
                    </Button>
                    <Button 
                      variant={textDecoration === "underline" ? "contained" : "outlined"}
                      onClick={() => {
                        const newDeco = textDecoration === "underline" ? "" : "underline";
                        setTextDecoration(newDeco);
                        updateTextProperty("underline", newDeco === "underline");
                      }}
                    >
                      <FormatUnderlined />
                    </Button>
                  </ButtonGroup>
                </Box>
                
                <FormControl fullWidth size="small">
                  <InputLabel>Text Align</InputLabel>
                  <Select 
                    value={textAlign} 
                    onChange={(e) => {
                      setTextAlign(e.target.value);
                      updateTextProperty("textAlign", e.target.value);
                    }}
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                    <MenuItem value="justify">Justify</MenuItem>
                  </Select>
                </FormControl>
                
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                    Text Color
                  </Typography>
                  <Grid container spacing={1}>
                    {COLOR_PALETTE.slice(0, 10).map((color) => (
                      <Grid item xs={2.4} key={color}>
                        <Box
                          onClick={() => {
                            setTextColor(color);
                            updateTextProperty("fill", color);
                          }}
                          sx={{
                            width: "100%",
                            paddingTop: "100%",
                            bgcolor: color,
                            borderRadius: 1,
                            cursor: "pointer",
                            border: textColor === color ? "3px solid #000" : "1px solid #ddd"
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            )}
            
            {/* Shapes Tab */}
            {leftTab === 2 && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Add Shapes</Typography>
                <Grid container spacing={1}>
                  {SHAPES.map((shape) => (
                    <Grid item xs={4} key={shape.type}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={() => addShape(shape.type)}
                        sx={{ py: 3, flexDirection: "column" }}
                      >
                        {typeof shape.icon === "string" ? (
                          <Typography variant="h5">{shape.icon}</Typography>
                        ) : shape.icon}
                        <Typography variant="caption" sx={{ mt: 0.5 }}>
                          {shape.label}
                        </Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                
                <Divider />
                
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Shape Settings</Typography>
                
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                    Fill Color
                  </Typography>
                  <Grid container spacing={1}>
                    {COLOR_PALETTE.slice(0, 10).map((color) => (
                      <Grid item xs={2.4} key={color}>
                        <Box
                          onClick={() => {
                            setFillColor(color);
                            if (selectedObject) {
                              selectedObject.set("fill", color);
                              canvas.renderAll();
                              saveHistory(canvas);
                            }
                          }}
                          sx={{
                            width: "100%",
                            paddingTop: "100%",
                            bgcolor: color,
                            borderRadius: 1,
                            cursor: "pointer",
                            border: fillColor === color ? "3px solid #000" : "1px solid #ddd"
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                <Box>
                  <Typography variant="caption">Stroke Width: {strokeWidth}px</Typography>
                  <Slider 
                    min={0} 
                    max={20} 
                    value={strokeWidth} 
                    onChange={(e,v)=>{
                      setStrokeWidth(v);
                      if (selectedObject) {
                        selectedObject.set("strokeWidth", v);
                        if (v > 0) selectedObject.set("stroke", strokeColor);
                        canvas.renderAll();
                      }
                    }} 
                  />
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                    Stroke Color
                  </Typography>
                  <Grid container spacing={1}>
                    {COLOR_PALETTE.slice(10, 20).map((color) => (
                      <Grid item xs={2.4} key={color}>
                        <Box
                          onClick={() => {
                            setStrokeColor(color);
                            if (selectedObject && strokeWidth > 0) {
                              selectedObject.set("stroke", color);
                              canvas.renderAll();
                              saveHistory(canvas);
                            }
                          }}
                          sx={{
                            width: "100%",
                            paddingTop: "100%",
                            bgcolor: color,
                            borderRadius: 1,
                            cursor: "pointer",
                            border: strokeColor === color ? "3px solid #000" : "1px solid #ddd"
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            )}
          </Box>
        </Paper>

        {/* Canvas Area */}
        <Box sx={{ 
          flex: 1, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          p: 2, 
          overflow: "auto",
          bgcolor: "#e2e8f0"
        }}>
          <Paper elevation={10} sx={{ p: 2 }}>
            <canvas ref={canvasRef} />
          </Paper>
        </Box>

        {/* Right Sidebar */}
        <Paper sx={{ width: 320, overflow: "auto", borderRadius: 0 }}>
          <Tabs value={rightTab} onChange={(e, v) => setRightTab(v)} variant="fullWidth">
            <Tab label="Adjust" />
            <Tab label="Effects" />
          </Tabs>
          <Box sx={{ p: 2 }}>
            {rightTab === 0 && (
              <Stack spacing={2}>
                {selectedObject ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Object Controls
                    </Typography>
                    
                    <ButtonGroup fullWidth variant="outlined">
                      <Button onClick={duplicate} startIcon={<ContentCopy />}>
                        Duplicate
                      </Button>
                      <Button onClick={deleteSelected} color="error" startIcon={<Delete />}>
                        Delete
                      </Button>
                    </ButtonGroup>
                    
                    <ButtonGroup fullWidth variant="outlined">
                      <Button onClick={() => rotateObject("left")} startIcon={<RotateLeft />}>
                        Rotate L
                      </Button>
                      <Button onClick={() => rotateObject("right")} startIcon={<RotateRight />}>
                        Rotate R
                      </Button>
                    </ButtonGroup>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="caption">Opacity: {Math.round(opacity * 100)}%</Typography>
                      <Slider 
                        value={opacity} 
                        onChange={(e,v)=>{
                          setOpacity(v);
                          selectedObject.set("opacity", v);
                          canvas.renderAll();
                        }} 
                        onChangeCommitted={() => saveHistory(canvas)}
                        min={0} 
                        max={1} 
                        step={0.01} 
                      />
                    </Box>
                    
                    {selectedObject.type === "image" && (
                      <>
                        <Divider />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Image Filters
                        </Typography>
                        
                        <Box>
                          <Typography variant="caption">
                            Brightness: {brightness}
                          </Typography>
                          <Slider 
                            value={brightness} 
                            onChange={(e,v)=>{
                              setBrightness(v);
                              applyImageFilter("Brightness", v);
                            }} 
                            min={-100} 
                            max={100} 
                            step={1}
                          />
                        </Box>
                        
                        <Box>
                          <Typography variant="caption">
                            Contrast: {contrast}
                          </Typography>
                          <Slider 
                            value={contrast} 
                            onChange={(e,v)=>{
                              setContrast(v);
                              applyImageFilter("Contrast", v);
                            }} 
                            min={-100} 
                            max={100} 
                            step={1}
                          />
                        </Box>
                        
                        <Box>
                          <Typography variant="caption">
                            Saturation: {saturation}
                          </Typography>
                          <Slider 
                            value={saturation} 
                            onChange={(e,v)=>{
                              setSaturation(v);
                              applyImageFilter("Saturation", v);
                            }} 
                            min={-100} 
                            max={100} 
                            step={1}
                          />
                        </Box>
                        
                        <Box>
                          <Typography variant="caption">
                            Blur: {blur}
                          </Typography>
                          <Slider 
                            value={blur} 
                            onChange={(e,v)=>{
                              setBlur(v);
                              applyImageFilter("Blur", v);
                            }} 
                            min={0} 
                            max={100} 
                            step={1}
                          />
                        </Box>
                        
                        <Button 
                          variant="outlined" 
                          fullWidth
                          startIcon={<FilterBAndW />}
                          onClick={() => applyImageFilter("Grayscale", 1)}
                        >
                          Grayscale
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant="outlined" 
                      color="warning"
                      fullWidth
                      onClick={() => {
                        selectedObject.bringToFront();
                        canvas.renderAll();
                        saveHistory(canvas);
                      }}
                    >
                      Bring to Front
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="warning"
                      fullWidth
                      onClick={() => {
                        selectedObject.sendToBack();
                        canvas.renderAll();
                        saveHistory(canvas);
                      }}
                    >
                      Send to Back
                    </Button>
                  </>
                ) : (
                  <Alert severity="info">
                    Select an object to adjust its properties
                  </Alert>
                )}
              </Stack>
            )}
            
            {rightTab === 1 && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Canvas Background
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => bgImageInputRef.current.click()}
                  startIcon={<ImageIcon />}
                >
                  Upload Background
                </Button>
                
                <Typography variant="caption" sx={{ mt: 2, mb: 1, display: "block" }}>
                  Solid Colors
                </Typography>
                <Grid container spacing={1}>
                  {COLOR_PALETTE.map((color) => (
                    <Grid item xs={2.4} key={color}>
                      <Box
                        onClick={() => {
                          canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
                          saveHistory(canvas);
                        }}
                        sx={{
                          width: "100%",
                          paddingTop: "100%",
                          bgcolor: color,
                          borderRadius: 1,
                          cursor: "pointer",
                          border: "1px solid #ddd",
                          transition: "all 0.2s",
                          "&:hover": { transform: "scale(1.1)", boxShadow: 2 }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Gradient Backgrounds
                </Typography>
                
                {[
                  { colors: ["#667eea", "#764ba2"], name: "Purple" },
                  { colors: ["#f093fb", "#f5576c"], name: "Pink" },
                  { colors: ["#4facfe", "#00f2fe"], name: "Blue" },
                  { colors: ["#fa709a", "#fee140"], name: "Sunset" },
                  { colors: ["#30cfd0", "#330867"], name: "Dark" },
                  { colors: ["#a8edea", "#fed6e3"], name: "Pastel" }
                ].map((grad, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      const gradient = new fabric.Gradient({
                        type: 'linear',
                        coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
                        colorStops: [
                          { offset: 0, color: grad.colors[0] },
                          { offset: 1, color: grad.colors[1] }
                        ]
                      });
                      canvas.setBackgroundColor(gradient, canvas.renderAll.bind(canvas));
                      saveHistory(canvas);
                    }}
                    sx={{
                      background: `linear-gradient(135deg, ${grad.colors[0]} 0%, ${grad.colors[1]} 100%)`,
                      color: "white",
                      fontWeight: 600,
                      "&:hover": {
                        background: `linear-gradient(135deg, ${grad.colors[0]} 0%, ${grad.colors[1]} 100%)`,
                        opacity: 0.9
                      }
                    }}
                  >
                    {grad.name}
                  </Button>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Design</DialogTitle>
        <DialogContent>
          {saveStatus && <Alert severity={saveStatus.type} sx={{ mb: 2 }}>{saveStatus.message}</Alert>}
          <TextField 
            autoFocus 
            margin="dense" 
            label="Design Title" 
            fullWidth 
            value={designTitle} 
            onChange={(e) => setDesignTitle(e.target.value)} 
            placeholder="Enter a name for your design"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button 
            onClick={saveDesign} 
            variant="contained" 
            disabled={saveStatus?.type === 'info'}
          >
            Save Design
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}