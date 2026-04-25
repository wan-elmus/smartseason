'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthHook } from '@/hooks/useAuth';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import PasswordChangeForm from '@/components/forms/PasswordChangeForm';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { ArrowLeft, Camera, Key, Activity, FileText, MapPin, Clock, CheckCircle, LogOut } from 'lucide-react';
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
  const [changingPassword, setChangingPassword] = useState(false);

  const [activityData, setActivityData] = useState({
    lastLogin: null,
    updatesCount: 0,
    fieldsCount: 0,
    completionRate: 0,
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

        const updatesCount = updatesRes.data?.length || 0;
        const fieldsCount = fieldsRes.data?.length || 0;
        const completionRate = fieldsCount > 0 ? Math.round((updatesCount / (fieldsCount * 4)) * 100) : 0;

        setActivityData({
          lastLogin: localStorage.getItem('last_login')
            ? new Date(localStorage.getItem('last_login'))
            : null,
          updatesCount,
          fieldsCount,
          completionRate: Math.min(completionRate, 100),
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
          completionRate: 0,
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
      setAvatarUrl(res.data.image_url);
    } catch (error) {
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
      const payload = {
        full_name: fullName,
        avatar_url: avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : null,
      };
      await apiClient.put(ROUTES.UPDATE_PROFILE, payload);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      alert(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (passwordData) => {
    setChangingPassword(true);
    try {
      await apiClient.post(ROUTES.CHANGE_PASSWORD, passwordData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Failed to change password' };
    } finally {
      setChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const displayAvatar = avatarUrl || user?.avatar_url;

  const activityItems = [
    {
      label: 'Field Updates',
      value: activityData.updatesCount,
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Assigned Fields',
      value: activityData.fieldsCount,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Completion Rate',
      value: `${activityData.completionRate}%`,
      icon: CheckCircle,
      color: 'text-black-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      suffix: '',
    },
    {
      label: 'Last Login',
      value: activityData.lastLogin ? getRelativeTime(activityData.lastLogin) : 'First visit',
      icon: Clock,
      color: 'text-blue-900',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      isDate: true,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-90 to-gray-300">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-4 lg:px-6 space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-primary font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              
              {/* Avatar Section */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center text-3xl font-semibold overflow-hidden ring-4 ring-white shadow-md">
                  {displayAvatar ? (
                    <Image
                      src={displayAvatar}
                      alt="Avatar"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                      unoptimized
                      loading="eager"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {user?.full_name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md border border-gray-300 hover:shadow-lg transition-all"
                >
                  <Camera className="w-4 h-4 text-gray-500" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      className={`text-xl font-semibold border-b-2 focus:outline-none focus:border-primary px-1 ${
                        nameError ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="Full name"
                    />
                    {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                  </div>
                ) : (
                  <h1 className="text-xl font-bold text-gray-900">{user?.full_name}</h1>
                )}
                
                <p className="text-sm text-gray-500 mt-1.5">{user?.email}</p>
                
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                    isAdmin 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    {isAdmin ? 'Administrator' : 'Field Agent'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0">
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
                      Save Changes
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
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary*/}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5  rounded-lg">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Activity Summary</span>
            </div>
          </div>

          {loadingActivity ? (
            <div className="p-12 text-center">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              {activityItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border ${item.borderColor} ${item.bgColor} p-4 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                          {item.label}
                        </p>
                        <p className={`text-xl font-bold mt-2 ${item.color}`}>
                          {item.value}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg bg-white/60 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    {!item.isDate && item.label !== 'Completion Rate' && (
                      <div className="mt-3 pt-2 border-t border-white/50">
                        <p className="text-xs text-gray-500">
                          {item.label === 'Field Updates' 
                            ? `${Math.min(100, Math.round((activityData.updatesCount / (activityData.fieldsCount * 4 || 1)) * 100))}% of expected`
                            : item.label === 'Assigned Fields'
                            ? `${activityData.fieldsCount} active field${activityData.fieldsCount !== 1 ? 's' : ''}`
                            : ''}
                        </p>
                      </div>
                    )}
                    {item.label === 'Completion Rate' && (
                      <div className="mt-3">
                        <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-black h-full rounded-full transition-all duration-500"
                            style={{ width: `${activityData.completionRate}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg">
                <Key className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Security</span>
            </div>
          </div>

          <div className="p-6">
            {!showPasswordForm ? (
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Password</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
                  Change Password
                </Button>
              </div>
            ) : (
              <PasswordChangeForm
                onSubmit={handleChangePassword}
                onCancel={() => {
                  setShowPasswordForm(false);
                }}
                loading={changingPassword}
              />
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900">Account Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Full Name</p>
              <p className="text-sm text-gray-900">{user?.full_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email Address</p>
              <p className="text-sm text-gray-900">{user?.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Role</p>
              <p className="text-sm text-gray-900">{isAdmin ? 'Administrator' : 'Field Agent'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Member Since</p>
              <p className="text-sm text-gray-900">{formatDate(user?.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50/30">
            <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
          </div>
          <div className="p-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Log out of account</p>
            </div>
            <Button variant="danger" size="sm" onClick={logout} icon={<LogOut className="w-4 h-4" />}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}