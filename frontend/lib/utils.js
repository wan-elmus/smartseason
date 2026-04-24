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
    Active: 'bg-emerald-100 text-emerald-800',
    'At Risk': 'bg-amber-100 text-amber-800',
    Completed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStageColor = (stage) => {
  const colors = {
    Planted: 'bg-sky-100 text-sky-700',
    Germination: 'bg-teal-100 text-teal-700',
    Vegetative: 'bg-emerald-100 text-emerald-700',
    Flowering: 'bg-purple-100 text-purple-700',
    Mature: 'bg-amber-100 text-amber-700',
    Ready: 'bg-orange-100 text-orange-700',
    Harvested: 'bg-gray-100 text-gray-600',
  };
  return colors[stage] || 'bg-gray-100 text-gray-600';
};

export const getStageBadgeClass = (stage) => {
  return `${getStageColor(stage)} px-2.5 py-1 rounded-full text-xs font-medium`;
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

export const getStatusStyles = (status) => {
  const styles = {
    Active: {
      border: 'border-l-4 border-emerald-500',
      bg: 'bg-emerald-50/40',
    },
    'At Risk': {
      border: 'border-l-4 border-amber-500',
      bg: 'bg-amber-50/40',
    },
    Completed: {
      border: 'border-l-4 border-gray-400',
      bg: 'bg-gray-50',
    },
  };

  return styles[status] || styles.Completed;
};

export const getStageTheme = (stage) => {
  const map = {
    Planted: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-900',
      subtle: 'text-sky-700',
    },
    Germination: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-900',
      subtle: 'text-teal-700',
    },
    Vegetative: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      subtle: 'text-emerald-700',
    },
    Flowering: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      subtle: 'text-purple-700',
    },
    Mature: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      subtle: 'text-amber-700',
    },
    Ready: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      subtle: 'text-orange-700',
    },
    Harvested: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-900',
      subtle: 'text-gray-600',
    },
  };

  return map[stage] || map['Harvested'];
};