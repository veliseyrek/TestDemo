import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Box,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getConfigurations,
  addConfiguration,
  deleteConfiguration,
  getConfigurationsForConfig
} from "../services/api";
import { Delete, AddCircleOutline, Logout } from "@mui/icons-material";
import "../assets/configuration.css";

const Configuration = () => {
  const [configs, setConfigs] = useState([]);
  const [open, setOpen] = useState(false);
  const [buildingType, setBuildingType] = useState("");
  const [buildingCost, setBuildingCost] = useState("");
  const [constructionTime, setConstructionTime] = useState("");
  const types = ["Farm", "Academy", "Headquarters", "LumberMill", "Barracks"];

  const [addedTypes, setAddedTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const data = await getConfigurations();
        setConfigs(data);
        setAddedTypes(data.map((config) => config.buildingType));
      } catch (error) {
        showError(error);
      }
    };

    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await getConfigurationsForConfig();
        setConfigs(response.data);
      } catch (error) {
        navigate("/login");
      }
    };

    fetchData();
    fetchConfigs();
  }, [navigate]);

  const handleAddConfig = async () => {
    if (buildingCost <= 0) {
      showError("Building cost must be a positive number.");
      return;
    }
    if (constructionTime < 30 || constructionTime > 1800) {
      showError("Construction time must be between 30 and 1800 seconds.");
      return;
    }
    if (!types.includes(buildingType)) {
      showError("Selected building type is not valid.");
      return;
    }

    const newConfig = { buildingType, buildingCost, constructionTime };
    try {
      const result = await addConfiguration(newConfig);
      setConfigs([...configs, result]);
      setAddedTypes([...addedTypes, buildingType]);
      setBuildingType("");
      setBuildingCost("");
      setConstructionTime("");
      setOpen(false);
      showSuccess("Configuration added successfully.");
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteConfig = async (id) => {
    try {
      await deleteConfiguration(id);

      const deletedConfig = configs.find((config) => config.id === id);

      if (deletedConfig) {
        setAddedTypes(
          addedTypes.filter((type) => type !== deletedConfig.buildingType)
        );
      }

      setConfigs(configs.filter((config) => config.id !== id));
      showSuccess("Configuration deleted successfully.");
    } catch (error) {
      console.error(error);
      showError("Failed to delete configuration.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

 
  const columns = [
    {
      field: "buildingType",
      headerName: "Building Type",
      flex: 1,
      headerClassName: "header-style",
    },
    {
      field: "buildingCost",
      headerName: "Building Cost",
      flex: 1,
      headerClassName: "header-style",
    },
    {
      field: "constructionTime",
      headerName: "Construction Time",
      flex: 1,
      headerClassName: "header-style",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="error"
          onClick={() => handleDeleteConfig(params.row.id)}
        >
          <Delete />
        </IconButton>
      ),
    },
  ];

  const rows = configs.map((config, index) => ({
    id: index + 1,
    ...config,
  }));

  return (
    <Container
      maxWidth="md"
      style={{
        backgroundImage: 'url("/path/to/your/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ pt: 5, pb: 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h4" gutterBottom>
              Configuration
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              startIcon={<Logout />}
            >
              Logout
            </Button>
          </Box>
          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
              startIcon={<AddCircleOutline />}
            >
              Add Configuration
            </Button>
          </Box>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              disableSelectionOnClick
              sx={{
                "& .MuiDataGrid-row": {
                  transition: "all 0.3s ease",
                },
                "& .MuiDataGrid-row:hover": {
                  transform: "scale(1.02)",
                },
              }}
            />
          </div>
        </Paper>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Configuration</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Building Type"
            fullWidth
            margin="normal"
            value={buildingType}
            onChange={(e) => setBuildingType(e.target.value)}
          >
            {types
              .filter((type) => !addedTypes.includes(type))
              .map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            label="Building Cost"
            type="number"
            fullWidth
            margin="normal"
            value={buildingCost}
            onChange={(e) => setBuildingCost(e.target.value)}
          />
          <TextField
            label="Construction Time (seconds)"
            type="number"
            fullWidth
            margin="normal"
            value={constructionTime}
            onChange={(e) => setConstructionTime(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddConfig} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {errorMessage && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={() => setErrorMessage("")}
        >
          <Alert severity="error">{errorMessage}</Alert>
        </Snackbar>
      )}
      {successMessage && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
        >
          <Alert severity="success">{successMessage}</Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default Configuration;
