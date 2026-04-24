'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

const STAGES = ['Planted', 'Germination', 'Vegetative', 'Flowering', 'Mature', 'Ready', 'Harvested'];

export default function UpdateForm({ fieldId, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    new_stage: 'Vegetative',
    notes: '',
    image_url: '',
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Growth Stage</label>
        <select
          value={formData.new_stage}
          onChange={(e) => setFormData({ ...formData, new_stage: e.target.value })}
          className="input"
          required
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="label">Observations / Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input min-h-[80px]"
          placeholder="Describe crop health, pest issues, weather conditions..."
          rows={3}
        />
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="sm" loading={loading || uploading}>
          Submit Update
        </Button>
      </div>
    </form>
  );
}