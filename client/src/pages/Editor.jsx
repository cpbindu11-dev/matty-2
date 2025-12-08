import { useEffect, useState } from "react";
import { 
  Box, Button, Typography, Paper, Grid, Card, CardMedia, CardContent, 
  CardActions, IconButton, Container, Chip, Tabs, Tab,
  InputAdornment, TextField
} from "@mui/material";
import { 
  Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon,
  Search, TrendingUp
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const TEMPLATE_CATEGORIES = [
  { name: "All", icon: "🎨" },
  { name: "Social Media", icon: "📱" },
  { name: "Marketing", icon: "📊" },
  { name: "Business", icon: "💼" },
  { name: "Events", icon: "🎉" },
  { name: "Education", icon: "📚" },
  { name: "YouTube", icon: "🎥" },
  { name: "Print", icon: "🖨️" },
];

const PRESET_TEMPLATES = [
  // Social Media
  { id: "ig-post-1", title: "Instagram Post - Minimal", category: "Social Media", width: 1080, height: 1080, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: true },
  { id: "ig-post-2", title: "Instagram Post - Bold", category: "Social Media", width: 1080, height: 1080, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: true },
  { id: "ig-post-3", title: "Instagram Post - Professional", category: "Social Media", width: 1080, height: 1080, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: false },
  { id: "ig-story-1", title: "Instagram Story - Modern", category: "Social Media", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: true },
  { id: "ig-story-2", title: "Instagram Story - Elegant", category: "Social Media", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", popular: false },
  { id: "ig-story-3", title: "Instagram Story - Vibrant", category: "Social Media", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", popular: false },
  { id: "fb-post-1", title: "Facebook Post - Classic", category: "Social Media", width: 1200, height: 630, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: false },
  { id: "fb-post-2", title: "Facebook Cover Photo", category: "Social Media", width: 820, height: 312, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: true },
  { id: "twitter-post-1", title: "Twitter Post", category: "Social Media", width: 1024, height: 512, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: false },
  { id: "twitter-header-1", title: "Twitter Header", category: "Social Media", width: 1500, height: 500, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: false },
  { id: "linkedin-post-1", title: "LinkedIn Post", category: "Social Media", width: 1200, height: 627, gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", popular: false },
  { id: "pinterest-pin-1", title: "Pinterest Pin - Standard", category: "Social Media", width: 1000, height: 1500, gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", popular: true },
  
  // YouTube
  { id: "yt-thumb-1", title: "YouTube Thumbnail - Gaming", category: "YouTube", width: 1280, height: 720, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: true },
  { id: "yt-thumb-2", title: "YouTube Thumbnail - Vlog", category: "YouTube", width: 1280, height: 720, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: true },
  { id: "yt-thumb-3", title: "YouTube Thumbnail - Tutorial", category: "YouTube", width: 1280, height: 720, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: true },
  { id: "yt-banner-1", title: "YouTube Channel Banner", category: "YouTube", width: 2560, height: 1440, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: false },
  { id: "yt-end-1", title: "YouTube End Screen", category: "YouTube", width: 1920, height: 1080, gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", popular: false },
  
  // Marketing
  { id: "ad-banner-1", title: "Display Ad - Leaderboard", category: "Marketing", width: 728, height: 90, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: false },
  { id: "ad-banner-2", title: "Display Ad - Rectangle", category: "Marketing", width: 300, height: 250, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: false },
  { id: "ad-banner-3", title: "Display Ad - Skyscraper", category: "Marketing", width: 160, height: 600, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: false },
  { id: "email-header-1", title: "Email Header", category: "Marketing", width: 600, height: 200, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: false },
  { id: "infographic-1", title: "Infographic - Vertical", category: "Marketing", width: 800, height: 2000, gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", popular: true },
  
  // Business
  { id: "business-card-1", title: "Business Card - Front", category: "Business", width: 1050, height: 600, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: false },
  { id: "presentation-1", title: "Presentation Slide - 16:9", category: "Business", width: 1920, height: 1080, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: false },
  { id: "presentation-2", title: "Presentation Slide - 4:3", category: "Business", width: 1024, height: 768, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: false },
  { id: "letterhead-1", title: "Letterhead", category: "Business", width: 816, height: 1056, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: false },
  { id: "invoice-1", title: "Invoice Template", category: "Business", width: 816, height: 1056, gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", popular: false },
  
  // Events
  { id: "invitation-1", title: "Event Invitation", category: "Events", width: 1080, height: 1350, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: true },
  { id: "flyer-1", title: "Event Flyer - A4", category: "Events", width: 2480, height: 3508, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: false },
  { id: "poster-1", title: "Event Poster", category: "Events", width: 1080, height: 1920, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: true },
  { id: "ticket-1", title: "Event Ticket", category: "Events", width: 1000, height: 450, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", popular: false },
  
  // Education
  { id: "worksheet-1", title: "Worksheet - Letter", category: "Education", width: 816, height: 1056, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: false },
  { id: "certificate-1", title: "Certificate - Landscape", category: "Education", width: 1056, height: 816, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: true },
  { id: "report-1", title: "Report Cover", category: "Education", width: 816, height: 1056, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: false },
  
  // Print
  { id: "brochure-1", title: "Brochure - Trifold", category: "Print", width: 3300, height: 2550, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", popular: false },
  { id: "menu-1", title: "Restaurant Menu", category: "Print", width: 1275, height: 1650, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", popular: false },
  { id: "postcard-1", title: "Postcard - 4x6", category: "Print", width: 1800, height: 1200, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", popular: false },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header with Stylish Logo */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: { xs: "3rem", md: "5rem" },
              background: "linear-gradient(45deg, #fff, #ffd700)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              letterSpacing: "0.05em"
            }}
          >
            Matty
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: "rgba(255,255,255,0.9)",
              fontWeight: 300,
              fontFamily: "'Raleway', sans-serif",
              letterSpacing: "0.1em",
              mb: 4
            }}
          >
            CREATE STUNNING DESIGNS IN MINUTES
          </Typography>

          {/* Search */}
          <TextField
            placeholder="Search templates by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 500 },
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                "&.Mui-focused fieldset": { borderColor: "white" }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "white" }} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Category Tabs */}
        <Paper sx={{ mb: 4, borderRadius: 3, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
          <Tabs
            value={selectedCategory}
            onChange={(e, v) => setSelectedCategory(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { 
                color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none"
              },
              "& .Mui-selected": { color: "white !important" },
              "& .MuiTabs-indicator": { backgroundColor: "white", height: 3 }
            }}
          >
            {TEMPLATE_CATEGORIES.map((cat) => (
              <Tab key={cat.name} label={`${cat.icon} ${cat.name}`} value={cat.name} />
            ))}
          </Tabs>
        </Paper>

        {/* Templates Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                    background: "rgba(255,255,255,0.2)"
                  }
                }}
                onClick={() => navigate(`/editor?template=${template.id}`)}
              >
                <Box sx={{ position: "relative", paddingTop: "75%", background: template.gradient }}>
                  {template.popular && (
                    <Chip
                      icon={<TrendingUp />}
                      label="Popular"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "linear-gradient(45deg, #FF6B6B, #FFE66D)",
                        color: "white",
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ color: "white" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {template.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    {template.width} × {template.height}px
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Create Your Own CTA */}
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 4, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(20px)" }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: "white", mb: 2 }}>
            ✨ Create Your Own Design
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 300, mb: 4 }}>
            Start from scratch with our powerful editor
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/editor")}
            startIcon={<AddIcon />}
            sx={{
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              fontWeight: 700,
              borderRadius: 3,
              background: "linear-gradient(45deg, #FF6B6B, #FFE66D)",
              boxShadow: "0 10px 30px rgba(255,107,107,0.4)",
              "&:hover": { transform: "scale(1.05)" }
            }}
          >
            Start Creating
          </Button>
        </Paper>

        {/* My Designs Section */}
        {designs.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" sx={{ color: "white", fontWeight: 700, mb: 3 }}>
              📁 My Designs
            </Typography>
            <Grid container spacing={3}>
              {designs.map((design) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={design._id}>
                  <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={design.thumbnailUrl || "https://via.placeholder.com/300x200"}
                      alt={design.title}
                    />
                    <CardContent sx={{ color: "white" }}>
                      <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                        {design.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        {new Date(design.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton sx={{ color: "white" }} onClick={() => navigate(`/editor?id=${design._id}`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton sx={{ color: "#FF6B6B" }} onClick={() => handleDelete(design._id)}>
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
    </Box>
  );
}