// client/src/utils/helpers.js
/**
 * Format ISO date string to "Jan 15, 2024".
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Return relative time string e.g. "2 days ago".
 */
export function timeAgo(dateString) {
  if (!dateString) return '';
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * Get initials from full name.
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Return a color based on score thresholds.
 */
export function getScoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

/**
 * Hash a username to an indigo/purple color.
 */
export function getAvatarColor(username) {
  let hash = 0;
  for (let i = 0; i < (username || '').length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#6366f1', '#8b5cf6', '#a78bfa', '#7c3aed',
    '#4f46e5', '#6d28d9', '#3730a3', '#5b21b6',
  ];
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Truncate text to given length with ellipsis.
 */
export function truncateText(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

/**
 * Parse Axios error into user‑friendly message.
 */
export function parseAPIError(error) {
  if (error.response) {
    const status = error.response.status;
    const serverMsg = error.response.data?.message;
    switch (status) {
      case 400:
        return serverMsg || 'Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Not found.';
      case 429:
        return 'Too many requests. Wait a moment.';
      case 500:
        return 'Server error. Please try again.';
      default:
        return serverMsg || error.message;
    }
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'No internet connection.';
  }
  return error.message || 'An unexpected error occurred.';
}