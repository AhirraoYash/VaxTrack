// src/hooks/useCamps.js

import { useState, useEffect } from 'react';
import campService from '../api/campService';

const useCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllCamps = async () => {
      try {
        setLoading(true);
        const data = await campService.getAllCamps();
        setCamps(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch camps:", err);
        setError('Could not load camps. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCamps();
  }, []); // The empty array [] means this effect runs only once when the hook is first used.

  return { camps, loading, error };
};

export default useCamps;