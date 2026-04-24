'use client';

import { useEffect, useState } from 'react';
import { useAuthHook } from '@/hooks/useAuth';
import { useFields } from '@/hooks/useFields';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import FieldForm from '@/components/forms/FieldForm';
import { getRelativeTime } from '@/lib/utils';

export default function FieldsPage() {
  const { isAdmin, isLoading } = useAuthHook();
  const { fields, loading, createField, deleteField, assignField, refetch } = useFields();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [agents, setAgents] = useState([]);
  const [assigningField, setAssigningField] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      // Agents see their assigned fields, no redirect needed
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const fetchAgents = async () => {
      if (isAdmin) {
        try {
          const response = await apiClient.get(ROUTES.USERS_AGENTS);
          setAgents(response.data || []);
        } catch (error) {
          console.error('Failed to fetch agents:', error);
        }
      }
    };
    fetchAgents();
  }, [isAdmin]);

  const handleCreateField = async (formData) => {
    const result = await createField(formData);
    if (result.success) {
      setShowCreateForm(false);
    } else {
      alert(result.error);
    }
  };

  const handleAssignField = async (fieldId, agentId) => {
    const result = await assignField(fieldId, agentId);
    if (result.success) {
      setAssigningField(null);
    } else {
      alert(result.error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Fields</h1>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ New Field'}
          </Button>
        )}
      </div>

      {showCreateForm && isAdmin && (
        <Card title="Create New Field">
          <FieldForm onSubmit={handleCreateField} onCancel={() => setShowCreateForm(false)} />
        </Card>
      )}

      {fields.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No fields found</p>
            {isAdmin && (
              <Button variant="primary" size="sm" className="mt-3" onClick={() => setShowCreateForm(true)}>
                Create your first field
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {fields.map((field) => (
            <Link key={field.id} href={`/fields/${field.id}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="text-sm font-medium text-gray-800 truncate">{field.name}</h3>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{field.crop_type}</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 flex-wrap gap-y-1">
                      <StatusBadge status={field.computed_status} size="xs" />
                      <span className="text-xs text-gray-400">
                        {field.days_since_planting} days
                      </span>
                      {field.last_update && (
                        <span className="text-xs text-gray-400">
                          Updated {getRelativeTime(field.last_update)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">{field.current_stage}</p>
                  </div>
                </div>

                {isAdmin && field.assigned_agent && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Agent: {field.assigned_agent?.full_name || 'Unassigned'}
                    </p>
                  </div>
                )}

                {isAdmin && !field.assigned_agent && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setAssigningField(assigningField === field.id ? null : field.id);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      {assigningField === field.id ? 'Cancel' : 'Assign Agent'}
                    </button>
                    
                    {assigningField === field.id && (
                      <div className="mt-2 space-y-1">
                        {agents.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={(e) => {
                              e.preventDefault();
                              handleAssignField(field.id, agent.id);
                            }}
                            className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-50"
                          >
                            {agent.full_name} ({agent.email})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}