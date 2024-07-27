import axios from 'axios';

 const API_URL = 'https://veliseyrek-001-site1.ktempurl.com/api';

//const API_URL = 'http://localhost:5022/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic MTExODc5Njg6NjAtZGF5ZnJlZXRyaWFs'
  }
});

export const login = async (username, password) => {
 
  try {

    const response = await api.post('/login', { username, password });

    if (response.data && response.data.token) {
      return response.data;
    } else {
      throw new Error('No token received');
    }
    //return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConfigurations = async () => {
  try {
    const response = await api.get('/configurations');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addConfiguration = async (config) => {
  try {
    const response = await api.post('/configurations', config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteConfiguration = async (id) => {
  try {
    const response = await api.delete(`/configurations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConfigurationsForConfig = async ()=>{
  var response  = axios.get(
    "https://veliseyrek-001-site1.ktempurl.com/api/configurations",
    {
      headers: {
        Authorization: "Basic MTExODc5Njg6NjAtZGF5ZnJlZXRyaWFs",
      },
    }
  );
  return response;
};

