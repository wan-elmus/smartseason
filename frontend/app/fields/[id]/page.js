'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthHook } from '@/hooks/useAuth';
import { useFieldUpdates } from '@/hooks/useFieldUpdates';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import UpdateForm from '@/components/forms/UpdateForm';
import { getProxiedImageUrl, isProxiedImage } from '@/lib/imageProxy';
import {
  formatDate,
  getRelativeTime,
  getStageTheme,
} from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Lightbulb,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';

export default function FieldDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fieldId = parseInt(params.id);

  const { user, isAdmin } = useAuthHook();

  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [deletingUpdateId, setDeletingUpdateId] = useState(null);

  const {
    updates,
    submitUpdate,
    deleteUpdate,
    stageSuggestion,
    fetchStageSuggestion,
  } = useFieldUpdates(fieldId);

  useEffect(() => {
    const fetchField = async () => {
      try {
        const res = await apiClient.get(ROUTES.FIELD_DETAIL(fieldId));
        setField(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
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
    const res = await submitUpdate(formData);
    if (res.success) {
      setShowUpdateForm(false);
      const refreshed = await apiClient.get(ROUTES.FIELD_DETAIL(fieldId));
      setField(refreshed.data);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!confirm('Are you sure you want to delete this update? This action cannot be undone.')) {
      return;
    }
    
    setDeletingUpdateId(updateId);
    const res = await deleteUpdate(updateId);
    setDeletingUpdateId(null);
    
    if (res.success) {
      const refreshed = await apiClient.get(ROUTES.FIELD_DETAIL(fieldId));
      setField(refreshed.data);
    } else {
      alert(res.error || 'Failed to delete update');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!field) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-10 text-center">
        <p className="text-gray-500">Field not found</p>
        <Button onClick={() => router.push('/fields')} className="mt-4">
          Back to Fields
        </Button>
      </div>
    );
  }

  const theme = getStageTheme(field.current_stage);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => router.push('/fields')}
        className="flex items-center gap-1 text-sm text-primary font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className={`rounded-2xl p-6 border ${theme.bg} ${theme.border}`}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold ${theme.text}`}>
              {field.name}
            </h1>
            <p className={`text-sm mt-1 ${theme.subtle}`}>
              {field.crop_type} • {field.current_stage}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Status: {field.computed_status}
            </p>
          </div>
          {!showUpdateForm && (
            <Button onClick={() => setShowUpdateForm(true)}>
              + Add Update
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl ring-1 ring-gray-200 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Stage
          </p>
          <p className="text-base font-semibold text-gray-900 mt-1">
            {field.current_stage}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl ring-1 ring-gray-200 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Planted
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {formatDate(field.planting_date)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl ring-1 ring-gray-200 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Age
          </p>
          <p className="text-base font-semibold text-gray-900 mt-1">
            {field.days_since_planting} days
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl ring-1 ring-gray-200 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Last Update
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {field.last_update ? getRelativeTime(field.last_update) : '—'}
          </p>
        </div>
      </div>

      {(field.latitude || field.longitude) && (
        <div className="bg-white p-4 rounded-xl ring-1 ring-gray-200 shadow-sm flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Location:</span>
          <span className="font-semibold text-gray-800">
            {field.latitude && field.longitude
              ? `${Number(field.latitude).toFixed(4)}°, ${Number(field.longitude).toFixed(4)}°`
              : field.latitude || field.longitude}
          </span>
        </div>
      )}

      {stageSuggestion?.suggested_stage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              AI Recommendation
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {stageSuggestion.reason}
            </p>
          </div>
        </div>
      )}

      {showUpdateForm && (
        <div className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 shadow-sm">
          <UpdateForm
            fieldId={fieldId}
            onSubmit={handleSubmitUpdate}
            onCancel={() => setShowUpdateForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Update History
          </h2>
        </div>

        {updates.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No updates recorded yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {updates.map((update) => {
              const updateTheme = getStageTheme(update.new_stage);
              const isDeleting = deletingUpdateId === update.id;

              return (
                <div key={update.id} className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs font-semibold ${updateTheme.text}`}>
                        {update.new_stage}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(update.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-semibold text-gray-800">
                          {update.agent_name}
                        </span>
                      </div>
                      
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteUpdate(update.id)}
                          disabled={isDeleting}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete update"
                        >
                          {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {update.notes && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {update.notes}
                    </p>
                  )}

                  {update.image_url && (
                    <div className="mt-4 relative w-full max-w-xs h-40">
                      <Image
                        src={getProxiedImageUrl(update.image_url)}
                        alt="Field update"
                        fill
                        unoptimized={isProxiedImage(getProxiedImageUrl(update.image_url))}
                        loading="eager"
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="rounded-lg object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}