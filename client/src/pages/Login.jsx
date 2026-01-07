import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Switch,
  Fade,
  Alert,
  CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth state from Redux
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = "Invalid email address";
    }
    
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      // Only navigate if login was successful
      if (result) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Error will be shown via Redux state
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: darkMode ? "#0f172a" : "#f5f7fa"
      }}
    >
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: darkMode ? "#020617" : "#fff",
              color: darkMode ? "#fff" : "#000",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
            }}
          >
            {/* HEADER */}
            <Box textAlign="center" mb={3}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 1,
                  borderRadius: 2,
                  background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  color: "#fff"
                }}
              >
                ✨
              </Box>
              <Typography variant="h5" fontWeight={700}>
                Matty AI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back! Sign in to continue
              </Typography>
            </Box>

            {/* ERROR ALERT */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* FORM */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                type="email"
                value={email}
                error={!!errors.email}
                helperText={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                value={password}
                error={!!errors.password}
                helperText={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                type="submit"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.3,
                  borderRadius: 3,
                  color: "#fff",
                  background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                  fontWeight: 600,
                  position: "relative"
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Sign In →"
                )}
              </Button>

              <Typography align="center" mt={2}>
                Don&apos;t have an account?{" "}
                <Box
                  component="span"
                  sx={{ 
                    color: "#8b5cf6", 
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" }
                  }}
                  onClick={() => navigate("/register")}
                >
                  Sign up
                </Box>
              </Typography>

              {/* DARK MODE */}
              <Box
                mt={3}
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap={1}
              >
                🌙 <Switch onChange={() => setDarkMode(!darkMode)} />
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}