import { useEffect, useState } from "react";
import { 
  Box, Button, Typography, Paper, Grid, Card, CardMedia, CardContent, 
  CardActions, IconButton, CircularProgress, Container, Chip, Tabs, Tab,
  InputAdornment, TextField
} from "@mui/material";
import { 
  Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon,
  Instagram, Facebook, Twitter, YouTube, TrendingUp, Search
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const TEMPLATE_CATEGORIES = [
  { name: "All", icon: "🎨" },
  { name: "Social Media", icon: "📱" },
  { name: "Popular", icon: "🔥" },
  { name: "Business", icon: "💼" },
  { name: "Marketing", icon: "📊" },
];

const PRESET_TEMPLATES = [
  {
    id: "social-1",
    title: "Instagram Post",
    category: "Social Media",
    width: 1080,
    height: 1080,
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    popular: true
  },
  {
    id: "social-2",
    title: "Instagram Story",
    category: "Social Media",
    width: 1080,
    height: 1920,
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=600&fit=crop",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    popular: true
  },
  {
    id: "social-3",
    title: "Facebook Post",
    category: "Social Media",
    width: 1200,
    height: 630,
    thumbnail: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&h=400&fit=crop",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    popular: false
  },
  {
    id: "social-4",
    title: "Twitter Post",
    category: "Social Media",
    width: 1024,
    height: 512,
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    popular: false
  },
  {
    id: "popular-1",
    title: "YouTube Thumbnail",
    category: "Popular",
    width: 1280,
    height: 720,
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    popular: true
  },
  {
    id: "popular-2",
    title: "Pinterest Pin",
    category: "Popular",
    width: 1000,
    height: 1500,
    thumbnail: "https://images.unsplash.com/photo-1611162618479-ee3d24aaef0b?w=400&h=600&fit=crop",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    popular: true
  },
  {
    id: "business-1",
    title: "Business Card",
    category: "Business",
    width: 1050,
    height: 600,
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    popular: false
  },
  {
    id: "business-2",
    title: "Presentation Slide",
    category: "Business",
    width: 1920,
    height: 1080,
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    popular: false
  },
  {
    id: "marketing-1",
    title: "Ad Banner",
    category: "Marketing",
    width: 728,
    height: 90,
    thumbnail: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&h=200&fit=crop",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    popular: false
  },
  {
    id: "marketing-2",
    title: "Email Header",
    category: "Marketing",
    width: 600,
    height: 200,
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=200&fit=crop",
    gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    popular: false
  }
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
    <Box sx={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ 
          textAlign: "center", 
          mb: 6,
          animation: "fadeIn 1s ease-in"
        }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800,
              background: "linear-gradient(45deg, #fff, #f0f0f0)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}
          >
            Matty Design Studio
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: "rgba(255,255,255,0.9)",
              fontWeight: 300,
              mb: 4
            }}
          >
            Create stunning designs in minutes
          </Typography>

          {/* Search */}
          <TextField
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 400 },
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
        <Paper 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
          }}
        >
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
              "& .Mui-selected": { 
                color: "white !important",
                textShadow: "0 2px 10px rgba(255,255,255,0.5)"
              },
              "& .MuiTabs-indicator": { 
                backgroundColor: "white",
                height: 3,
                borderRadius: 3
              }
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
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
                        fontWeight: 600,
                        boxShadow: "0 4px 15px rgba(255,107,107,0.4)"
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.3)",
                      opacity: 0,
                      transition: "opacity 0.3s",
                      "&:hover": { opacity: 1 }
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        background: "white",
                        color: "#667eea",
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        "&:hover": {
                          background: "white",
                          transform: "scale(1.05)"
                        }
                      }}
                    >
                      Use Template
                    </Button>
                  </Box>
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

        {/* Create Your Own - Big CTA */}
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))",
            backdropFilter: "blur(20px)",
            border: "2px solid rgba(255,255,255,0.3)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
              animation: "shimmer 3s infinite"
            }
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: "white",
                mb: 2,
                textShadow: "0 4px 20px rgba(0,0,0,0.3)"
              }}
            >
              ✨ Create Your Own Design
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: "rgba(255,255,255,0.9)",
                fontWeight: 300,
                mb: 4,
                maxWidth: 600,
                mx: "auto"
              }}
            >
              Start from scratch with our powerful editor. Upload images, add filters, remove backgrounds, and create stunning designs.
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
                transition: "all 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 15px 40px rgba(255,107,107,0.6)"
                }
              }}
            >
              Start Creating
            </Button>
          </Box>
        </Paper>

        {/* My Designs Section */}
        {designs.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: "white",
                fontWeight: 700,
                mb: 3,
                textShadow: "0 2px 10px rgba(0,0,0,0.3)"
              }}
            >
              📁 My Designs
            </Typography>
            <Grid container spacing={3}>
              {designs.map((design) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={design._id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 15px 30px rgba(0,0,0,0.3)"
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={design.thumbnailUrl || "https://via.placeholder.com/300x200?text=No+Preview"}
                      alt={design.title}
                      sx={{ objectFit: "cover" }}
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
                      <IconButton 
                        sx={{ color: "white" }}
                        onClick={() => navigate(`/editor?id=${design._id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        sx={{ color: "#FF6B6B" }}
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

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </Box>
  );
}