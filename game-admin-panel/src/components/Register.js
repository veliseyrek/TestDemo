import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import '../assets/register.css';
import { TextField, Button, Container, Typography, Box, CssBaseline, Paper, Snackbar, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';

const theme = createTheme();

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ username: '', email: '', password: '', server: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setError({ username: '', email: '', password: '', server: '' });
    }, 5000);

    return () => clearTimeout(timer);
  }, [error]);

  const handleRegister = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newError = { username: '', email: '', password: '', server: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username) {
      newError.username = 'Username is required';
      hasError = true;
    }
    if (!email) {
      newError.email = 'Email is required';
      hasError = true;
    } else if (!emailRegex.test(email)) {
      newError.email = 'Email format is invalid';
      hasError = true;
    }
    if (!password) {
      newError.password = 'Password is required';
      hasError = true;
    }

    if (hasError) {
      setError(newError);
      return;
    }

    try {
      await register(username, email, password);
      setSuccessMessage('Registration successful!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError({ ...newError, server: 'Registration failed. Try a different username and e-mail address.' });
    }
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
            <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
              Register
            </Typography>
            <Box
              component="form"
              noValidate
              sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={Boolean(error.username)}
                helperText={error.username}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(error.email)}
                helperText={error.email}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(error.password)}
                helperText={error.password}
              />
              {error.server && <Typography color="error" sx={{ mt: 2 }}>{error.server}</Typography>}
              <Box sx={{ width: '100%', mt: 3 }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{
                      borderRadius: '50px',
                      mt: 1,
                      mb: 1,
                    }}
                    onClick={handleRegister}
                  >
                    Register
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    fullWidth
                    variant="text"
                    color="secondary"
                    sx={{
                      borderRadius: '50px',
                      mt: 1,
                      mb: 1,
                    }}
                    onClick={() => navigate('/login')}
                  >
                    I already have an account
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </Paper>
      </Container>
      <Snackbar open={Boolean(successMessage)} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Register;
