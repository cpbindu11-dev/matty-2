import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Button, TextField, Paper, Stack, Typography, Divider, Select, MenuItem,
  FormControl, InputLabel, Slider, Tabs, Tab, IconButton, ButtonGroup, Grid,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from "@mui/material";
import {
  Delete, Save, Download, Image as ImageIcon, Undo, Redo, ContentCopy, 
  ZoomIn, ZoomOut, TextFields, Circle, Square, RotateLeft, RotateRight
} from "@mui/icons-material";
import API from "../utils/api";

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Roboto", "Open Sans", "Montserrat", "Poppins"];

// Complete template configurations with all IDs from Dashboard
const TEMPLATES = {
  "ig-post-1": { width: 1080, height: 1080, name: "Instagram Post - Minimal", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "ig-post-2": { width: 1080, height: 1080, name: "Instagram Post - Bold", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "ig-post-3": { width: 1080, height: 1080, name: "Instagram Post - Professional", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  "ig-story-1": { width: 1080, height: 1920, name: "Instagram Story - Modern", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  "ig-story-2": { width: 1080, height: 1920, name: "Instagram Story - Elegant", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  "ig-story-3": { width: 1080, height: 1920, name: "Instagram Story - Vibrant", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  "fb-post-1": { width: 1200, height: 630, name: "Facebook Post", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "fb-post-2": { width: 820, height: 312, name: "Facebook Cover", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "twitter-post-1": { width: 1024, height: 512, name: "Twitter Post", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  "twitter-header-1": { width: 1500, height: 500, name: "Twitter Header", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  "linkedin-post-1": { width: 1200, height: 627, name: "LinkedIn Post", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  "pinterest-pin-1": { width: 1000, height: 1500, name: "Pinterest Pin", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  "yt-thumb-1": { width: 1280, height: 720, name: "YouTube Thumbnail - Gaming", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "yt-thumb-2": { width: 1280, height: 720, name: "YouTube Thumbnail - Vlog", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "yt-thumb-3": { width: 1280, height: 720, name: "YouTube Thumbnail - Tutorial", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  "yt-banner-1": { width: 2560, height: 1440, name: "YouTube Banner", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  "yt-end-1": { width: 1920, height: 1080, name: "YouTube End Screen", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  "ad-banner-1": { width: 728, height: 90, name: "Display Ad - Leaderboard", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "ad-banner-2": { width: 300, height: 250, name: "Display Ad - Rectangle", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "ad-banner-3": { width: 160, height: 600, name: "Display Ad - Skyscraper", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  "email-header-1": { width: 600, height: 200, name: "Email Header", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  "infographic-1": { width: 800, height: 2000, name: "Infographic", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  "business-card-1": { width: 1050, height: 600, name: "Business Card", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "presentation-1": { width: 1920, height: 1080, name: "Presentation 16:9", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "presentation-2": { width: 1024, height: 768, name: "Presentation 4:3", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  "letterhead-1": { width: 816, height: 1056, name: "Letterhead", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  "invoice-1": { width: 816, height: 1056, name: "Invoice", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  "invitation-1": { width: 1080, height: 1350, name: "Event Invitation", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "flyer-1": { width: 2480, height: 3508, name: "Event Flyer A4", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "poster-1": { width: 1080, height: 1920, name: "Event Poster", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  "ticket-1": { width: 1000, height: 450, name: "Event Ticket", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  "worksheet-1": { width: 816, height: 1056, name: "Worksheet", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "certificate-1": { width: 1056, height: 816, name: "Certificate", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "report-1": { width: 816, height: 1056, name: "Report Cover", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  "brochure-1": { width: 3300, height: 2550, name: "Brochure Trifold", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  "menu-1": { width: 1275, height: 1650, name: "Restaurant Menu", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  "postcard-1": { width: 1800, height: 1200, name: "Postcard 4x6", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }
};

const GRADIENT_PRESETS = [
  { name: "Sunset", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { name: "Ocean", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Purple", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Pink", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Dark", value: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  { name: "Pastel", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" }
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
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Poppins");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fillColor, setFillColor] = useState("#667eea");
  const [opacity, setOpacity] = useState(1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const templateId = searchParams.get("template");
    const designId = searchParams.get("id");
    
    const template = templateId && TEMPLATES[templateId] 
      ? TEMPLATES[templateId] 
      : { width: 1080, height: 1080, name: "Custom Canvas", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" };

    setDesignTitle(template.name);

    const c = new fabric.Canvas(canvasRef.current, {
      width: template.width,
      height: template.height,
      backgroundColor: "#667eea"
    });

    setCanvas(c);

    if (template.gradient) {
      applyGradientToCanvas(c, template.gradient);
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
    
    c.on("selection:cleared", () => setSelectedObject(null));
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

  const applyGradientToCanvas = (canvasInstance, gradientString) => {
    if (!canvasInstance) return;
    
    try {
      const colorMatches = gradientString.match(/#[0-9a-fA-F]{6}/g);
      if (colorMatches?.length >= 2) {
        const gradient = new fabric.Gradient({
          type: 'linear',
          coords: { x1: 0, y1: 0, x2: canvasInstance.width, y2: canvasInstance.height },
          colorStops: [
            { offset: 0, color: colorMatches[0] },
            { offset: 1, color: colorMatches[1] }
          ]
        });
        canvasInstance.setBackgroundColor(gradient, canvasInstance.renderAll.bind(canvasInstance));
      }
    } catch (error) {
      console.error("Error applying gradient:", error);
    }
  };

  const updateControlsFromObject = (obj) => {
    if (!obj) return;
    if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
      setFontSize(obj.fontSize || 48);
      setFontFamily(obj.fontFamily || "Poppins");
      setTextColor(obj.fill || "#ffffff");
    }
    if (obj.fill && typeof obj.fill === 'string') {
      setFillColor(obj.fill);
    }
    setOpacity(obj.opacity || 1);
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
        img.set({ left: canvas.width / 2, top: canvas.height / 2, originX: "center", originY: "center", scaleX: scale, scaleY: scale });
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

  const applyGradientBackground = (gradientValue) => {
    if (!canvas) return;
    applyGradientToCanvas(canvas, gradientValue);
    saveHistory(canvas);
  };

  const addText = () => {
    if (!canvas) return;
    const text = textInput.trim() || "Double click to edit";
    const t = new fabric.Textbox(text, {
      left: canvas.width / 2, top: canvas.height / 2, originX: "center", originY: "center",
      fontSize, fill: textColor, fontFamily, textAlign: "center", width: 300
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

  const addShape = (type) => {
    if (!canvas) return;
    let shape;
    const center = { left: canvas.width / 2, top: canvas.height / 2, originX: "center", originY: "center" };
    switch(type) {
      case "circle": shape = new fabric.Circle({ ...center, radius: 50, fill: fillColor }); break;
      case "rectangle": shape = new fabric.Rect({ ...center, width: 100, height: 100, fill: fillColor }); break;
      case "triangle": shape = new fabric.Triangle({ ...center, width: 100, height: 100, fill: fillColor }); break;
      default: return;
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
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

  const rotate = (angle) => {
    if (!selectedObject || !canvas) return;
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
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", bgcolor: "#f5f5f5" }}>
      <Box sx={{ position: "fixed", top: 64, left: 320, right: 320, bgcolor: "white", p: 1.5, zIndex: 10, boxShadow: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <TextField size="small" value={designTitle} onChange={(e) => setDesignTitle(e.target.value)} sx={{ width: 250 }} />
          <ButtonGroup size="small">
            <Tooltip title="Undo"><span><IconButton onClick={undo} disabled={historyStep <= 0}><Undo /></IconButton></span></Tooltip>
            <Tooltip title="Redo"><span><IconButton onClick={redo} disabled={historyStep >= history.length - 1}><Redo /></IconButton></span></Tooltip>
          </ButtonGroup>
          <ButtonGroup size="small">
            <IconButton onClick={() => handleZoom(-0.1)}><ZoomOut /></IconButton>
            <Button disabled sx={{ minWidth: 80 }}>{Math.round(zoom * 100)}%</Button>
            <IconButton onClick={() => handleZoom(0.1)}><ZoomIn /></IconButton>
          </ButtonGroup>
          <Button variant="contained" color="success" onClick={() => setShowSaveDialog(true)} startIcon={<Save />}>Save</Button>
          <Button variant="outlined" onClick={exportImage} startIcon={<Download />}>Export</Button>
        </Stack>
      </Box>

      <Paper sx={{ width: 320, position: "fixed", left: 0, top: 64, bottom: 0, overflowY: "auto" }}>
        <Tabs value={leftTab} onChange={(e, v) => setLeftTab(v)} variant="fullWidth">
          <Tab label="Elements" />
          <Tab label="Text" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {leftTab === 0 && (
            <Stack spacing={2}>
              <Button variant="contained" fullWidth onClick={() => fileInputRef.current.click()} startIcon={<ImageIcon />}>Upload Image</Button>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageUpload} />
              <Divider />
              <Typography variant="subtitle2">Shapes</Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("circle")}><Circle /></Button></Grid>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("rectangle")}><Square /></Button></Grid>
                <Grid item xs={4}><Button fullWidth variant="outlined" onClick={() => addShape("triangle")}>△</Button></Grid>
              </Grid>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption">Fill:</Typography>
                <input type="color" value={fillColor} onChange={(e)=>setFillColor(e.target.value)} style={{width:60,height:40,cursor:'pointer'}} />
              </Stack>
            </Stack>
          )}
          {leftTab === 1 && (
            <Stack spacing={2}>
              <TextField multiline rows={2} label="Text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Enter text..." />
              <Button variant="contained" onClick={addText} fullWidth startIcon={<TextFields />}>Add Text</Button>
              <Divider />
              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select value={fontFamily} onChange={(e) => {setFontFamily(e.target.value);updateTextProperty("fontFamily", e.target.value);}}>
                  {FONTS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
              <Typography variant="caption">Size: {fontSize}px</Typography>
              <Slider min={12} max={150} value={fontSize} onChange={(e,v)=>{setFontSize(v);updateTextProperty("fontSize", v);}} />
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption">Color:</Typography>
                <input type="color" value={textColor} onChange={(e) => {setTextColor(e.target.value);updateTextProperty("fill", e.target.value);}} style={{width:60,height:40,cursor:'pointer'}} />
              </Stack>
            </Stack>
          )}
        </Box>
      </Paper>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", mt: 8, ml: "320px", mr: "320px", p: 2, overflow: "auto" }}>
        <Paper elevation={10} sx={{ p: 2 }}>
          <canvas ref={canvasRef} />
        </Paper>
      </Box>

      <Paper sx={{ width: 320, position: "fixed", right: 0, top: 64, bottom: 0, overflowY: "auto" }}>
        <Tabs value={rightTab} onChange={(e, v) => setRightTab(v)} variant="fullWidth">
          <Tab label="Background" />
          <Tab label="Edit" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {rightTab === 0 && (
            <Stack spacing={2}>
              <Button variant="contained" fullWidth onClick={() => bgImageInputRef.current.click()}>Upload Background</Button>
              <input type="file" accept="image/*" ref={bgImageInputRef} style={{ display: "none" }} onChange={handleBackgroundImage} />
              <Divider />
              <Typography variant="subtitle2">Gradient Presets</Typography>
              <Grid container spacing={1}>
                {GRADIENT_PRESETS.map((grad) => (
                  <Grid item xs={6} key={grad.name}>
                    <Button fullWidth variant="outlined" onClick={() => applyGradientBackground(grad.value)} sx={{ background: grad.value, color: 'white', '&:hover': { opacity: 0.8 } }}>{grad.name}</Button>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
          {rightTab === 1 && (
            <Stack spacing={2}>
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
                  <Typography variant="caption">Opacity: {Math.round(opacity * 100)}%</Typography>
                  <Slider value={opacity} onChange={(e,v)=>{setOpacity(v);selectedObject.set("opacity", v);canvas.renderAll();}} min={0} max={1} step={0.01} />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">Select an object to edit</Typography>
              )}
            </Stack>
          )}
        </Box>
      </Paper>

      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Design</DialogTitle>
        <DialogContent>
          {saveStatus && <Alert severity={saveStatus.type} sx={{ mb: 2 }}>{saveStatus.message}</Alert>}
          <TextField autoFocus margin="dense" label="Design Title" fullWidth value={designTitle} onChange={(e) => setDesignTitle(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={saveDesign} variant="contained" disabled={saveStatus?.type === 'info'}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}