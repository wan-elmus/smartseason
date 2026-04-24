'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthHook } from '@/hooks/useAuth';
import { useFieldUpdates } from '@/hooks/useFieldUpdates';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import UpdateForm from '@/components/forms/UpdateForm';
import { formatDate, getRelativeTime } from '@/lib/utils';

export default function FieldDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fieldId = parseInt(params.id);
  const { isAdmin } = useAuthHook();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  
  const { updates, submitUpdate, fetchUpdates, stageSuggestion, fetchStageSuggestion } = useFieldUpdates(fieldId);

  useEffect(() => {
    const fetchField = async () => {
      try {
        const response = await apiClient.get(ROUTES.FIELD_DETAIL(fieldId));
        setField(response.data);
      } catch (error) {
        console.error('Failed to fetch field:', error);
        if (error.response?.status === 404) {
          router.push('/fields');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchField();
    fetchStageSuggestion();
  }, [fieldId, router, fetchStageSuggestion]);

  const handleSubmitUpdate = async (formData) => {
    const result = await submitUpdate(formData);
    if (result.success) {
      setShowUpdateForm(false);
      // Refresh field data
      const response = await apiClient.get(ROUTES.FIELD_DETAIL(fieldId));
      setField(response.data);
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!field) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Field not found</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => router.push('/fields')}>
            Back to Fields
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <button
            onClick={() => router.push('/fields')}
            className="text-xs text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center"
          >
            ← Back to Fields
          </button>
          <h1>{field.name}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <StatusBadge status={field.computed_status} />
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-600">{field.crop_type}</span>
          </div>
        </div>
        {!showUpdateForm && (
          <Button variant="primary" size="sm" onClick={() => setShowUpdateForm(true)}>
            + Add Update
          </Button>
        )}
      </div>

      {/* Field Info Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Current Stage</p>
          <p className="text-sm font-medium text-gray-800">{field.current_stage}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Planted</p>
          <p className="text-sm font-medium text-gray-800">{formatDate(field.planting_date)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Days in Field</p>
          <p className="text-sm font-medium text-gray-800">{field.days_since_planting} days</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Last Update</p>
          <p className="text-sm font-medium text-gray-800">
            {field.last_update ? getRelativeTime(field.last_update) : 'Never'}
          </p>
        </div>
      </div>

      {/* Stage Suggestion */}
      {stageSuggestion?.suggested_stage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 text-sm">💡</span>
            <div>
              <p className="text-xs font-medium text-blue-800">AI Suggestion</p>
              <p className="text-xs text-blue-700">{stageSuggestion.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Update Form */}
      {showUpdateForm && (
        <Card title="Submit Field Update">
          <UpdateForm
            fieldId={fieldId}
            onSubmit={handleSubmitUpdate}
            onCancel={() => setShowUpdateForm(false)}
          />
        </Card>
      )}

      {/* Update History */}
      <Card title="Update History">
        {updates.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No updates recorded yet</p>
        ) : (
          <div className="space-y-3">
            {updates.map((update) => (
              <div key={update.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={update.new_stage} size="xs" />
                    <span className="text-xs text-gray-500">
                      {formatDate(update.created_at)}
                    </span>
                    <span className="text-xs text-gray-400">
                      by {update.agent_name}
                    </span>
                  </div>
                </div>
                {update.notes && (
                  <p className="text-xs text-gray-600 mt-1">{update.notes}</p>
                )}
                {update.ai_alert && (
                  <div className="mt-1 text-xs text-yellow-700 bg-yellow-50 inline-block px-2 py-0.5 rounded">
                    ⚠️ {update.ai_alert}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}