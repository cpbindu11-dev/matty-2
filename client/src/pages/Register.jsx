import { useState } from "react";
import { useDispatch } from "react-redux";
import { register } from "../redux/authSlice";
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
  Fade
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    await dispatch(register({ username, email, password }));
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f7fa"
      }}
    >
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h5" fontWeight={700}>
                Create Matty Account
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                margin="normal"
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                error={!!error}
                helperText={error}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                type="submit"
                sx={{
                  mt: 3,
                  py: 1.3,
                  borderRadius: 3,
                  background:
                    "linear-gradient(90deg,#8b5cf6,#ec4899)",
                  color: "#fff"
                }}
              >
                Create Account →
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
