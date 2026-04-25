'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHook } from '@/hooks/useAuth';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { ArrowLeft, Camera, Key, Activity, Check } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuthHook();
  const { logout } = useAuth();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [nameError, setNameError] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [activityData, setActivityData] = useState({
    lastLogin: null,
    updatesCount: 0,
    fieldsCount: 0,
  });
  const [loadingActivity, setLoadingActivity] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchActivity = async () => {
      try {
        const [updatesRes, fieldsRes] = await Promise.all([
          apiClient.get(ROUTES.MY_UPDATES).catch(() => ({ data: [] })),
          apiClient.get(ROUTES.MY_FIELDS).catch(() => ({ data: [] })),
        ]);
        if (!isMounted) return;

        const fieldsCount = fieldsRes.data?.length || 0;
        const updatesCount = updatesRes.data?.length || 0;
        
        setActivityData({
          lastLogin: localStorage.getItem('last_login')
            ? new Date(localStorage.getItem('last_login'))
            : null,
          updatesCount: updatesCount,
          fieldsCount: fieldsCount,
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to fetch activity:', err);
        setActivityData({
          lastLogin: localStorage.getItem('last_login')
            ? new Date(localStorage.getItem('last_login'))
            : null,
          updatesCount: 0,
          fieldsCount: 0,
        });
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchActivity();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2) return 'Name too short';
    if (name.length > 100) return 'Name too long';
    return '';
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingAvatar(true);
    try {
      const res = await apiClient.post(ROUTES.UPLOAD_IMAGE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 50000,
      });
      console.log('Upload response:', res.data);
      setAvatarUrl(res.data.image_url);
    } catch (error){
      console.error('Upload error:', error.response?.data || error.message);
      alert(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    const err = validateName(fullName);
    if (err) {
      setNameError(err);
      return;
    }

    setUpdating(true);
    try {
      await apiClient.put(ROUTES.UPDATE_PROFILE, {
        full_name: fullName,
        avatar_url: avatarUrl,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      alert(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await apiClient.post(ROUTES.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const displayAvatar = avatarUrl || user?.avatar_url;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-semibold overflow-hidden">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  unoptimized
                  loading="eager"
                />
              ) : (
                <span className="text-3xl">{user?.full_name?.charAt(0) || 'U'}</span>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 bg-white border rounded-full p-1.5 shadow hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="space-y-1">
                <input
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  className={`text-lg font-semibold border-b focus:outline-none focus:border-primary ${
                    nameError ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {nameError && <p className="text-xs text-red-500">{nameError}</p>}
              </div>
            ) : (
              <h1 className="text-lg font-semibold text-gray-900">{user?.full_name}</h1>
            )}

            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

            <p className="text-xs mt-2 text-gray-400">
              {isAdmin ? 'Administrator' : 'Field Agent'}
            </p>
          </div>

          {/* Actions */}
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setFullName(user?.full_name || '');
                  setAvatarUrl(user?.avatar_url || '');
                  setNameError('');
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdateProfile} loading={updating}>
                <Check className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setFullName(user?.full_name || '');
                setAvatarUrl(user?.avatar_url || '');
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">Security</span>
          </div>
          {!showPasswordForm && (
            <Button variant="outline" size="xs" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <div className="p-4 space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            />
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            />

            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            {passwordSuccess && <p className="text-xs text-green-600">{passwordSuccess}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleChangePassword} loading={changingPassword}>
                Update Password
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Activity */}
      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">Activity Summary</span>
          </div>
        </div>

        {loadingActivity ? (
          <div className="p-8 text-center">
            <Spinner size="sm" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="p-5 text-center">
              <p className="text-2xl font-bold text-gray-900">{activityData.updatesCount}</p>
              <p className="text-xs text-gray-500 mt-1">Field Updates</p>
            </div>
            <div className="p-5 text-center">
              <p className="text-2xl font-bold text-gray-900">{activityData.fieldsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Assigned Fields</p>
            </div>
            <div className="p-5 text-center">
              <p className="text-sm font-medium text-gray-700">
                {activityData.lastLogin ? getRelativeTime(activityData.lastLogin) : 'First visit'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Last Login</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Details */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Account Information</h2>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Full Name</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{isAdmin ? 'Administrator' : 'Field Agent'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Joined</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(user?.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50/30">
          <h2 className="text-sm font-medium text-red-700">Danger Zone</h2>
        </div>
        <div className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-900">Log out of account</p>
            <p className="text-xs text-gray-500 mt-0.5">Sign out from this device</p>
          </div>
          <Button variant="danger" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}