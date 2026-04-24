'use client';

import { useState } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isLoading } = useAuthHook();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const response = await apiClient.put(ROUTES.UPDATE_PROFILE, null, {
        params: { full_name: fullName }
      });
      if (response.data) {
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const roleBadge = user?.role === 'admin' 
    ? 'bg-primary/10 text-primary'
    : 'bg-blue-100 text-blue-700';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1>My Profile</h1>

      <Card title="Personal Information">
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>

          <div>
            <label className="label">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
              />
            ) : (
              <p className="text-sm text-gray-800">{user?.full_name}</p>
            )}
          </div>

          <div>
            <label className="label">Email Address</label>
            <p className="text-sm text-gray-800">{user?.email}</p>
          </div>

          <div>
            <label className="label">Role</label>
            <div>
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${roleBadge}`}>
                {user?.role === 'admin' ? 'Administrator' : 'Field Agent'}
              </span>
            </div>
          </div>

          <div>
            <label className="label">Account Created</label>
            <p className="text-sm text-gray-800">{formatDate(user?.created_at)}</p>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
            {isEditing ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleUpdateProfile} loading={updating}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}