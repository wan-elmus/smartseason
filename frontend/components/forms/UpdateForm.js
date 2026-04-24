'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Upload, X } from 'lucide-react';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';

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

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stage */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Growth Stage</label>
        <select
          value={formData.new_stage}
          onChange={(e) => setFormData({ ...formData, new_stage: e.target.value })}
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-3xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
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
        <label className="block text-xs font-semibold text-gray-700 mb-2">Observations / Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-3 text-base border border-gray-200 rounded-3xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[120px] transition-all"
          placeholder="Describe crop health, pest issues, weather conditions..."
          rows={4}
        />
      </div>

      {/* Image Upload – endpoint is used here (ROUTES.UPLOAD_IMAGE) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Photo (Optional)</label>
        <div className="flex items-center gap-4">
          <label
            className={`flex-1 flex items-center justify-center gap-x-3 px-5 py-4 text-sm border border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-colors ${
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

          {imagePreview && (
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                sizes="64px"
                className="object-cover rounded-3xl border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-2xl p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-x-3 pt-4">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={loading || uploading}>
          Submit Update
        </Button>
      </div>
    </form>
  );
}