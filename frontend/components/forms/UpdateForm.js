'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Upload, X } from 'lucide-react';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import { getProxiedImageUrl } from '@/lib/imageProxy';

const STAGES = [
  'Planted',
  'Germination',
  'Vegetative',
  'Flowering',
  'Mature',
  'Ready',
  'Harvested',
];

export default function UpdateForm({
  fieldId,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    new_stage: 'Vegetative',
    notes: '',
    image_url: '',
  });

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // cleanup preview
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validation
    if (!file.type.startsWith('image/')) {
      return alert('Invalid image file');
    }

    if (file.size > 2 * 1024 * 1024) {
      return alert('Image must be under 2MB');
    }

    // local preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploading(true);
    try {
      const response = await apiClient.post(ROUTES.UPLOAD_IMAGE, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData((prev) => ({
        ...prev,
        image_url: response.data.image_url,
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const proxiedImage = getProxiedImageUrl(formData.image_url);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Stage */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Growth Stage
        </label>
        <select
          value={formData.new_stage}
          onChange={(e) =>
            setFormData({ ...formData, new_stage: e.target.value })
          }
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-2xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          required
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Observations / Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-2xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-30"
          placeholder="Describe crop health, pests, weather..."
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Photo (Optional)
        </label>

        <div className="flex items-center gap-4">

          {/* Upload Button */}
          <label
            className={`flex-1 flex items-center justify-center gap-x-3 px-5 py-4 text-sm border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">
              {uploading ? 'Uploading…' : 'Upload Image'}
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Preview */}
          {(imagePreview || proxiedImage) && (
            <div className="relative w-24 h-24 shrink-0">

              <Image
                src={imagePreview || proxiedImage}
                alt="Preview"
                fill
                sizes="96px"
                className="object-cover rounded-xl border border-gray-200"
              />

              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 mt-2">
          Recommended: 1280×960px (4:3), max 2MB
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-x-3 pt-4">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={loading || uploading}
        >
          Submit Update
        </Button>
      </div>
    </form>
  );
}