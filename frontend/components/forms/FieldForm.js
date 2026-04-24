'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function FieldForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    crop_type: initialData?.crop_type || '',
    planting_date: initialData?.planting_date?.split('T')[0] || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Field Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
          placeholder="e.g., Upper River Farm"
          required
        />
      </div>
      
      <div>
        <label className="label">Crop Type</label>
        <input
          type="text"
          value={formData.crop_type}
          onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
          className="input"
          placeholder="e.g., Maize, Beans, Rice"
          required
        />
      </div>
      
      <div>
        <label className="label">Planting Date</label>
        <input
          type="date"
          value={formData.planting_date}
          onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
          className="input"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Latitude (optional)</label>
          <input
            type="text"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="input"
            placeholder="-1.286389"
          />
        </div>
        <div>
          <label className="label">Longitude (optional)</label>
          <input
            type="text"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="input"
            placeholder="36.817223"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={loading}>
          {initialData ? 'Update Field' : 'Create Field'}
        </Button>
      </div>
    </form>
  );
}