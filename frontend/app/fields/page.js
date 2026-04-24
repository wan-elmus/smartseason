'use client';

import { useEffect, useState } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import { useFields } from '@/hooks/useFields';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import FieldForm from '@/components/forms/FieldForm';
import { getRelativeTime, getStatusStyles } from '@/lib/utils';

import {
  Calendar,
  User,
  ChevronRight,
  Users,
  Plus,
  X,
} from 'lucide-react';

export default function FieldsPage() {
  const { isAdmin, isLoading } = useAuthHook();
  const { fields, loading, createField, assignField, refetch } = useFields();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [agents, setAgents] = useState([]);
  const [assigningField, setAssigningField] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      apiClient
        .get(ROUTES.USERS_AGENTS)
        .then((res) => setAgents(res.data || []))
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleCreateField = async (formData) => {
    const res = await createField(formData);
    if (res.success) setShowCreateForm(false);
  };

  const handleAssignField = async (fieldId, agentId) => {
    const res = await assignField(fieldId, agentId);
    if (res.success) {
      setAssigningField(null);
      await refetch();
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-semibold text-gray-900">Fields</h1>

        {isAdmin && (
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showCreateForm ? 'Cancel' : 'New Field'}
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-6">
          <FieldForm
            onSubmit={handleCreateField}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.map((field) => {
          const statusStyle = getStatusStyles(field.computed_status);

          return (
            <Link key={field.id} href={`/fields/${field.id}`} className="group">
              <div
                className={`
                  rounded-2xl p-5 bg-white
                  shadow-sm hover:shadow-md
                  ring-1 ring-gray-200
                  transition-all duration-200
                  hover:-translate-y-0.5
                  ${statusStyle.border} ${statusStyle.bg}
                `}
              >

                {/* Top */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
                      {field.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {field.crop_type}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                </div>

                {/* Info */}
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stage</span>
                    <span className="font-medium text-gray-800">
                      {field.current_stage}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Age</span>
                    <span>{field.days_since_planting} days</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Last update</span>
                    <span>
                      {field.last_update
                        ? getRelativeTime(field.last_update)
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* 🔥 Assignment (REPLACED + IMPROVED) */}
                {isAdmin && (
                  <div
                    className="mt-4 pt-3 border-t border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {field.assigned_agent ? (
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>Agent</span>
                        </div>

                        <span className="font-medium text-gray-700">
                          {field.assigned_agent.full_name?.split(' ')[0] || 'Unknown'}
                        </span>
                      </div>
                    ) : (
                      <div>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.preventDefault();
                            setAssigningField(
                              assigningField === field.id ? null : field.id
                            );
                          }}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 px-0"
                        >
                          {assigningField === field.id ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </>
                          ) : (
                            <>
                              {/* <Plus className="w-3.5 h-3.5" /> */}
                              Assign Agent
                            </>
                          )}
                        </Button>

                        {/* Dropdown */}
                        {assigningField === field.id && (
                          <div className="mt-3 bg-white rounded-xl p-2 max-h-52 overflow-y-auto border border-gray-200 shadow-sm">

                            {agents.length === 0 ? (
                              <p className="text-xs text-gray-500 px-2 py-2">
                                No agents available
                              </p>
                            ) : (
                              agents.map((agent) => (
                                <button
                                  key={agent.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleAssignField(field.id, agent.id);
                                  }}
                                  className="
                                    w-full text-left px-3 py-2.5 text-sm
                                    rounded-lg transition-all
                                    hover:bg-gray-50
                                    flex flex-col
                                  "
                                >
                                  <span className="font-medium text-gray-800">
                                    {agent.full_name}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {agent.email}
                                  </span>
                                </button>
                              ))
                            )}

                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}