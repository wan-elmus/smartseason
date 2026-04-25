'use client';

import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export function useFieldUpdates(fieldId) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiAlert, setAiAlert] = useState(null);
  const [stageSuggestion, setStageSuggestion] = useState(null);

  const fetchUpdates = useCallback(async (signal) => {
    if (!fieldId) return;

    try {
      const response = await apiClient.get(ROUTES.FIELD_UPDATES(fieldId), { signal });
      setUpdates(response.data);
      setError(null);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.userMessage || 'Failed to fetch updates');
      }
    } finally {
      setLoading(false);
    }
  }, [fieldId]);

  const fetchStageSuggestion = useCallback(async (signal) => {
    if (!fieldId) return;

    try {
      const response = await apiClient.get(ROUTES.SUGGEST_STAGE(fieldId), { signal });
      setStageSuggestion(response.data);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.warn('Failed to fetch stage suggestion:', err);
      }
    }
  }, [fieldId]);

  const submitUpdate = async (updateData) => {
    try {
      const response = await apiClient.post(ROUTES.CREATE_UPDATE(fieldId), updateData);

      await fetchUpdates();

      if (response.data.id) {
        try {
          const alertRes = await apiClient.get(ROUTES.AI_ALERT(response.data.id));
          setAiAlert(alertRes.data.has_alert ? alertRes.data : null);
        } catch (err) {
          console.warn('Failed to fetch AI alert:', err);
        }
      }

      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.userMessage || 'Failed to submit update' };
    }
  };

  // NEW: Delete update
  const deleteUpdate = async (updateId) => {
    try {
      await apiClient.delete(ROUTES.DELETE_UPDATE(updateId));
      await fetchUpdates();
      return { success: true };
    } catch (err) {
      console.error('Delete update error:', err.response?.data || err);
      return { 
        success: false, 
        error: err.userMessage || err.response?.data?.detail || 'Failed to delete update' 
      };
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/v4/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.image_url;
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      await Promise.all([
        fetchUpdates(controller.signal),
        fetchStageSuggestion(controller.signal),
      ]);
    }

    load();

    return () => controller.abort();
  }, [fetchUpdates, fetchStageSuggestion]);

  return {
    updates,
    loading,
    error,
    aiAlert,
    stageSuggestion,
    refetch: fetchUpdates,
    submitUpdate,
    deleteUpdate,
    fetchStageSuggestion,
    uploadImage,
  };
}