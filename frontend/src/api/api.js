// src/api/api.js

//This file sets up a central axios instance. The magic here is the "interceptor," which 
// automatically adds the auth token to the header of any request if we have one saved, so 
// we don't have to do it manually 
// for every protected route.

import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  This is an interceptor. It's a function that runs BEFORE each request is sent.
  It checks if we have a user token in localStorage and, if so, adds it to the
  'Authorization' header. This is how we'll access protected backend routes.
*/
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const token = JSON.parse(userInfo).token;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;