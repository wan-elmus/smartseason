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
    try {
      const response = await apiClient.get(ROUTES.FIELDS, { signal });
      setFields(response.data);
      setError(null);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.userMessage || 'Failed to fetch fields');
        console.error('Fetch fields error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createField = async (fieldData) => {
    try {
      const response = await apiClient.post(ROUTES.FIELDS, fieldData);

      await fetchFields();

      return { success: true, data: response.data };
    } catch (err) {
      return {
        success: false,
        error: err.userMessage || 'Failed to create field',
      };
    }
  };

  const updateField = async (id, fieldData) => {
    try {
      const response = await apiClient.put(
        ROUTES.FIELD_DETAIL(id),
        fieldData
      );

      await fetchFields();

      return { success: true, data: response.data };
    } catch (err) {
      return {
        success: false,
        error: err.userMessage || 'Failed to update field',
      };
    }
  };

  const deleteField = async (id) => {
    try {
      await apiClient.delete(ROUTES.FIELD_DETAIL(id));

      await fetchFields();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.userMessage || 'Failed to delete field',
      };
    }
  };

  const assignField = async (fieldId, agentId) => {
    try {
      const response = await apiClient.post(
        ROUTES.ASSIGN_FIELD(fieldId),
        { agent_id: agentId }
      );

      await fetchFields();

      return { success: true, data: response.data };
    } catch (err) {
      return {
        success: false,
        error: err.userMessage || 'Failed to assign field',
      };
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      await fetchFields(controller.signal);
    }

    load();

    return () => controller.abort();
  }, [fetchFields]);

  return {
    fields,
    loading,
    error,
    refetch: fetchFields,
    createField,
    updateField,
    deleteField,
    assignField,
    isAdmin,
  };
}