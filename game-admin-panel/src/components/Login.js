import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, CssBaseline, Paper } from '@mui/material';
import { login } from '../services/api'; 
import { AccountCircle, Lock, Login as LoginIcon } from '@mui/icons-material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea',
    },
    secondary: {
      main: '#03dac6',
    },
  },
});

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
        setUsername('');
        setPassword('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    try {
      debugger;
      const response = await login(username, password);
      localStorage.setItem('token', response.token);
      navigate('/configuration'); 
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper elevation={6} sx={{ padding: 4, mt: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography component="h1" variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
              Login
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <TextField
                margin="normal"
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                error={Boolean(error)}
                helperText={error.username}
                InputProps={{
                  startAdornment: (
                    <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                  ),
                }}
              />
              <TextField
                margin="normal"
                fullWidth
                id="password"
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                error={Boolean(error)}
                helperText={error.password}
                InputProps={{
                  startAdornment: (
                    <Lock sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                  ),
                }}
              />
              {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5, width: '100%' }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      borderRadius: '50px',
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                    startIcon={<LoginIcon />}
                  >
                    Login
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="contained"
                    onClick={handleRegisterRedirect}
                    sx={{
                      borderRadius: '50px',
                      backgroundColor: 'secondary.main', 
                      color: '#000', 
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    }}
                    startIcon={<AssignmentIndOutlinedIcon />}
                  >
                    Sign up
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
