import { useEffect, useState } from "react";
import { 
  Box, Button, Typography, Paper, Grid, Card, CardMedia, CardContent, 
  CardActions, IconButton, Container, Chip, Tabs, Tab,
  InputAdornment, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { 
  Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon,
  Search, TrendingUp, EmojiEmotions, Star, Favorite, Face, Pets,
  Nature, Sports, Restaurant, Flight, DirectionsCar, Computer
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const TEMPLATE_CATEGORIES = [
  { name: "All Templates", icon: "🎨" },
  { name: "Instagram", icon: "📱" },
  { name: "Facebook", icon: "👤" },
  { name: "LinkedIn", icon: "💼" },
  { name: "Twitter/X", icon: "🐦" },
  { name: "Resume", icon: "📄" },
  { name: "Posters", icon: "🖼️" },
];

const PRESET_TEMPLATES = [
  // Instagram Templates
  { id: "ig-post-1", title: "Instagram Post - Gradient", category: "Instagram", width: 1080, height: 1080, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: true },
  { id: "ig-post-2", title: "Instagram Post - Sunset", category: "Instagram", width: 1080, height: 1080, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: true },
  { id: "ig-post-3", title: "Instagram Post - Ocean", category: "Instagram", width: 1080, height: 1080, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: false },
  { id: "ig-story-1", title: "Instagram Story - Vibrant", category: "Instagram", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: true },
  { id: "ig-story-2", title: "Instagram Story - Dark", category: "Instagram", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", popular: false },
  { id: "ig-story-3", title: "Instagram Story - Pastel", category: "Instagram", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", popular: false },
  
  // Facebook Templates
  { id: "fb-post-1", title: "Facebook Post", category: "Facebook", width: 1200, height: 630, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: false },
  { id: "fb-cover-1", title: "Facebook Cover Photo", category: "Facebook", width: 820, height: 312, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: true },
  
  // Twitter Templates
  { id: "twitter-post-1", title: "Twitter Post", category: "Twitter/X", width: 1024, height: 512, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: false },
  { id: "twitter-header-1", title: "Twitter Header", category: "Twitter/X", width: 1500, height: 500, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: false },
  
  // LinkedIn Templates
  { id: "linkedin-post-1", title: "LinkedIn Post", category: "LinkedIn", width: 1200, height: 627, gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", popular: false },
  
  // Resume Templates
  { id: "resume-1", title: "Professional Resume", category: "Resume", width: 816, height: 1056, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: true },
  { id: "resume-2", title: "Modern Resume", category: "Resume", width: 816, height: 1056, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: false },
  
  // Poster Templates
  { id: "poster-1", title: "Event Poster", category: "Posters", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: true },
  { id: "poster-2", title: "Movie Poster", category: "Posters", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: false },
];

// NEW: Sticker categories and collections
const STICKER_CATEGORIES = [
  { name: "All", icon: <EmojiEmotions /> },
  { name: "Emoji", icon: <Face /> },
  { name: "Animals", icon: <Pets /> },
  { name: "Nature", icon: <Nature /> },
  { name: "Sports", icon: <Sports /> },
  { name: "Food", icon: <Restaurant /> },
  { name: "Travel", icon: <Flight /> },
  { name: "Tech", icon: <Computer /> },
];

// Sample sticker data (in a real app, these would be image URLs)
const STICKER_LIBRARY = [
  { id: "s1", name: "Happy Face", category: "Emoji", emoji: "😊", url: "https://em-content.zobj.net/thumbs/240/apple/354/grinning-face-with-smiling-eyes_1f604.png" },
  { id: "s2", name: "Heart", category: "Emoji", emoji: "❤️", url: "https://em-content.zobj.net/thumbs/240/apple/354/red-heart_2764-fe0f.png" },
  { id: "s3", name: "Star", category: "Emoji", emoji: "⭐", url: "https://em-content.zobj.net/thumbs/240/apple/354/star_2b50.png" },
  { id: "s4", name: "Fire", category: "Emoji", emoji: "🔥", url: "https://em-content.zobj.net/thumbs/240/apple/354/fire_1f525.png" },
  { id: "s5", name: "Thumbs Up", category: "Emoji", emoji: "👍", url: "https://em-content.zobj.net/thumbs/240/apple/354/thumbs-up_1f44d.png" },
  { id: "s6", name: "Dog", category: "Animals", emoji: "🐕", url: "https://em-content.zobj.net/thumbs/240/apple/354/dog_1f415.png" },
  { id: "s7", name: "Cat", category: "Animals", emoji: "🐱", url: "https://em-content.zobj.net/thumbs/240/apple/354/cat-face_1f431.png" },
  { id: "s8", name: "Panda", category: "Animals", emoji: "🐼", url: "https://em-content.zobj.net/thumbs/240/apple/354/panda_1f43c.png" },
  { id: "s9", name: "Tree", category: "Nature", emoji: "🌲", url: "https://em-content.zobj.net/thumbs/240/apple/354/evergreen-tree_1f332.png" },
  { id: "s10", name: "Flower", category: "Nature", emoji: "🌸", url: "https://em-content.zobj.net/thumbs/240/apple/354/cherry-blossom_1f338.png" },
  { id: "s11", name: "Sun", category: "Nature", emoji: "☀️", url: "https://em-content.zobj.net/thumbs/240/apple/354/sun_2600-fe0f.png" },
  { id: "s12", name: "Soccer", category: "Sports", emoji: "⚽", url: "https://em-content.zobj.net/thumbs/240/apple/354/soccer-ball_26bd.png" },
  { id: "s13", name: "Basketball", category: "Sports", emoji: "🏀", url: "https://em-content.zobj.net/thumbs/240/apple/354/basketball_1f3c0.png" },
  { id: "s14", name: "Pizza", category: "Food", emoji: "🍕", url: "https://em-content.zobj.net/thumbs/240/apple/354/pizza_1f355.png" },
  { id: "s15", name: "Burger", category: "Food", emoji: "🍔", url: "https://em-content.zobj.net/thumbs/240/apple/354/hamburger_1f354.png" },
  { id: "s16", name: "Plane", category: "Travel", emoji: "✈️", url: "https://em-content.zobj.net/thumbs/240/apple/354/airplane_2708-fe0f.png" },
  { id: "s17", name: "Car", category: "Travel", emoji: "🚗", url: "https://em-content.zobj.net/thumbs/240/apple/354/automobile_1f697.png" },
  { id: "s18", name: "Laptop", category: "Tech", emoji: "💻", url: "https://em-content.zobj.net/thumbs/240/apple/354/laptop_1f4bb.png" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Templates");
  const [searchQuery, setSearchQuery] = useState("");
  
  // NEW: Sticker browser state
  const [stickerDialogOpen, setStickerDialogOpen] = useState(false);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState("All");

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const response = await API.get("/designs");
      setDesigns(response.data);
    } catch (error) {
      console.error("Error fetching designs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this design?")) return;
    
    try {
      await API.delete(`/designs/${id}`);
      setDesigns(designs.filter(d => d._id !== id));
    } catch (error) {
      console.error("Error deleting design:", error);
      alert("Failed to delete design");
    }
  };

  const filteredTemplates = PRESET_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === "All Templates" || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // NEW: Filter stickers by category
  const filteredStickers = STICKER_LIBRARY.filter(sticker => 
    selectedStickerCategory === "All" || sticker.category === selectedStickerCategory
  );

  // NEW: Handle sticker selection
  const handleStickerSelect = (sticker) => {
    navigate(`/editor?sticker=${sticker.id}&stickerUrl=${encodeURIComponent(sticker.url)}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Header Section */}
      <Box sx={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
        py: 6, 
        mb: 4 
      }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800,
              color: "white",
              mb: 2,
              textAlign: "center"
            }}
          >
            Matty AI
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: "rgba(255,255,255,0.9)",
              fontWeight: 300,
              textAlign: "center",
              mb: 3
            }}
          >
            AI-Powered Design Platform
          </Typography>

          {/* Search Bar */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <TextField
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 600 },
                bgcolor: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { border: "none" }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#667eea" }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* NEW: Create Design CTA - Moved to Top */}
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: "center", 
            borderRadius: 4, 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            mb: 4,
            boxShadow: "0 12px 24px rgba(102, 126, 234, 0.3)"
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, color: "white", mb: 2 }}>
            ✨ Start Creating
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)", mb: 4 }}>
            Create your own custom design or browse our sticker library
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/editor")}
              startIcon={<AddIcon />}
              sx={{
                px: 6,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: 3,
                bgcolor: "white",
                color: "#667eea",
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                "&:hover": { 
                  bgcolor: "#f8f9fa",
                  transform: "scale(1.05)"
                }
              }}
            >
              Create New Design
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => setStickerDialogOpen(true)}
              startIcon={<EmojiEmotions />}
              sx={{
                px: 6,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "2px solid white",
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                "&:hover": { 
                  bgcolor: "rgba(255,255,255,0.3)",
                  transform: "scale(1.05)"
                }
              }}
            >
              Browse Stickers
            </Button>
          </Box>
        </Paper>

        {/* Category Tabs */}
        <Box sx={{ 
          bgcolor: "white", 
          borderRadius: 3, 
          mb: 4, 
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)" 
        }}>
          <Tabs
            value={selectedCategory}
            onChange={(e, v) => setSelectedCategory(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { 
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.95rem",
                textTransform: "none",
                py: 2
              },
              "& .Mui-selected": { color: "#667eea !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#667eea", height: 3 }
            }}
          >
            {TEMPLATE_CATEGORIES.map((cat) => (
              <Tab 
                key={cat.name} 
                label={`${cat.icon} ${cat.name}`} 
                value={cat.name} 
              />
            ))}
          </Tabs>
        </Box>

        {/* Templates Grid */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "#1e293b" }}>
          Discover Templates
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 4 }}>
          Browse our collection of professionally designed templates ready for customization.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 24px rgba(102, 126, 234, 0.2)",
                  }
                }}
                onClick={() => navigate(`/editor?template=${template.id}`)}
              >
                <Box sx={{ 
                  position: "relative", 
                  paddingTop: template.height > template.width ? "150%" : "75%", 
                  background: template.gradient 
                }}>
                  {template.popular && (
                    <Chip
                      icon={<TrendingUp sx={{ fontSize: 16 }} />}
                      label="Popular"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        bgcolor: "white",
                        color: "#667eea",
                        fontWeight: 600,
                        fontSize: "0.75rem"
                      }}
                    />
                  )}
                  <Box sx={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    right: 12,
                    color: "white",
                    textAlign: "center"
                  }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600,
                      bgcolor: "rgba(0,0,0,0.3)",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      display: "inline-block"
                    }}>
                      {template.category}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: "#1e293b" }}>
                    {template.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    {template.width} × {template.height}px
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* My Designs Section */}
        {designs.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "#1e293b" }}>
              📁 My Designs
            </Typography>
            <Grid container spacing={3}>
              {designs.map((design) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={design._id}>
                  <Card sx={{ 
                    borderRadius: 3, 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 8px 16px rgba(0,0,0,0.12)"
                    }
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={design.thumbnailUrl || "https://via.placeholder.com/300x200?text=No+Preview"}
                      alt={design.title}
                    />
                    <CardContent>
                      <Typography variant="body1" noWrap sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {design.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {new Date(design.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                      <IconButton 
                        sx={{ color: "#667eea" }} 
                        onClick={() => navigate(`/editor?id=${design._id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        sx={{ color: "#ef4444" }} 
                        onClick={() => handleDelete(design._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* NEW: Sticker Browser Dialog */}
      <Dialog 
        open={stickerDialogOpen} 
        onClose={() => setStickerDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#667eea", color: "white", fontWeight: 700 }}>
          🎨 Browse Stickers
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", mt: 0.5 }}>
            Select a sticker to create a custom design
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Sticker Category Tabs */}
          <Tabs
            value={selectedStickerCategory}
            onChange={(e, v) => setSelectedStickerCategory(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            {STICKER_CATEGORIES.map((cat) => (
              <Tab 
                key={cat.name}
                label={cat.name}
                value={cat.name}
                icon={cat.icon}
                iconPosition="start"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
            ))}
          </Tabs>

          {/* Stickers Grid */}
          <Grid container spacing={2}>
            {filteredStickers.map((sticker) => (
              <Grid item xs={3} sm={2} md={1.5} key={sticker.id}>
                <Card
                  onClick={() => handleStickerSelect(sticker)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "scale(1.1)",
                      boxShadow: 3
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 2,
                      fontSize: "2.5rem"
                    }}
                  >
                    {sticker.emoji}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStickerDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}