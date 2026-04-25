'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import { useAuthHook } from './useAuth';

export function useFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAdmin } = useAuthHook();

  const fetchFields = useCallback(async (signal) => {
    const response = await apiClient.get(ROUTES.FIELDS, { signal });
    return response.data || [];
  }, []);

  // Public refetch
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFields();
      setFields(data);
      setError(null);
    } catch (err) {
      console.error('Refetch error:', err.response?.data || err);
      setError(err.userMessage || err.response?.data?.detail || 'Failed to fetch fields');
    } finally {
      setLoading(false);
    }
  }, [fetchFields]);

  // Create
  const createField = async (fieldData) => {
    try {
      const response = await apiClient.post(ROUTES.FIELDS, fieldData);
      await refetch();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Create field error:', err.response?.data || err);
      return {
        success: false,
        error: err.userMessage || err.response?.data?.detail || 'Failed to create field',
      };
    }
  };

  // Update
  const updateField = async (id, fieldData) => {
    try {
      const response = await apiClient.put(ROUTES.FIELD_DETAIL(id), fieldData);
      await refetch();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Update field error:', err.response?.data || err);
      return {
        success: false,
        error: err.userMessage || err.response?.data?.detail || 'Failed to update field',
      };
    }
  };

  // Delete
  const deleteField = async (id) => {
    try {
      await apiClient.delete(ROUTES.FIELD_DETAIL(id));
      await refetch();
      return { success: true };
    } catch (err) {
      console.error('Delete field error:', err.response?.data || err);
      return {
        success: false,
        error: err.userMessage || err.response?.data?.detail || 'Failed to delete field',
      };
    }
  };

  // Assign
  const assignField = async (fieldId, agentId) => {
    try {
      const response = await apiClient.post(
        ROUTES.ASSIGN_FIELD(fieldId),
        { agent_id: agentId }
      );
      await refetch();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Assign field error:', err.response?.data || err);
      return {
        success: false,
        error: err.userMessage || err.response?.data?.detail || 'Failed to assign field',
      };
    }
  };

  // Unassign
  const unassignField = async (fieldId) => {
    try {
      await apiClient.delete(ROUTES.UNASSIGN_FIELD(fieldId));
      await refetch();
      return { success: true };
    } catch (err) {
      console.error('Unassign field error:', err.response?.data || err);
      return {
        success: false,
        error: err.userMessage || err.response?.data?.detail || 'Failed to unassign field',
      };
    }
  };

  // Initial load
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const data = await fetchFields(controller.signal);
        setFields(data);
        setError(null);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Initial load error:', err.response?.data || err);
          setError(err.userMessage || err.response?.data?.detail || 'Failed to fetch fields');
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [fetchFields]);

  return {
    fields,
    loading,
    error,
    refetch,
    createField,
    updateField,
    deleteField,
    assignField,
    unassignField,
    isAdmin,
  };
}