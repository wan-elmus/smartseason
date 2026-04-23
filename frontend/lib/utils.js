export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    Active: 'bg-green-100 text-green-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStageColor = (stage) => {
  const colors = {
    Planted: 'bg-blue-100 text-blue-800',
    Germination: 'bg-cyan-100 text-cyan-800',
    Vegetative: 'bg-green-100 text-green-800',
    Flowering: 'bg-purple-100 text-purple-800',
    Mature: 'bg-orange-100 text-orange-800',
    Ready: 'bg-orange-100 text-orange-800',
    Growing: 'bg-green-100 text-green-800',
    Harvested: 'bg-gray-100 text-gray-800',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};