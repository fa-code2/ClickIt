/**
 * MicroGov Frontend API Client
 * Seamlessly connects to FastAPI backend on localhost:8000 or custom VITE_API_BASE_URL.
 * Includes local storage fallback for standalone preview or live Vercel showcase.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Fallback seed issues if backend is unreachable (ensures Vercel demo always works flawlessly)
const FALLBACK_ISSUES = [
  {
    id: 'demo-1',
    description: 'Hazardous crater-sized pothole on Central Avenue right before the railway crossing. Multiple two-wheelers skidded during rain.',
    issue_type: 'Pothole',
    severity: 'HIGH',
    priority_score: 88.5,
    department: 'Department of Public Works & Roads',
    city: 'Downtown Metro',
    ward: 'North District',
    local_authority: 'Zonal Public Works & Civic Action Center',
    routing_status: 'DISPATCHED_TO_FIELD_CREW',
    routing_notes: 'Automatically routed to Department of Public Works & Roads with alert dispatched to District Action Center. Targeted SLA: 24 hours.',
    upvotes: 42,
    downvotes: 2,
    user_vote: null,
    status: 'IN_PROGRESS',
    latitude: 23.6912,
    longitude: 86.9710,
    user_name: 'Rohan Deshmukh',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    work_order: {
      id: 'wo-1',
      status: 'IN_PROGRESS',
      after_image_path: null,
      resolution_notes: null,
      created_at: new Date(Date.now() - 3600000 * 16).toISOString()
    },
    comments: [
      {
        id: 'c-1',
        complaint_id: 'demo-1',
        user_name: 'Kavita Iyer',
        comment_text: 'Thank you for reporting! I had to swerve sharply here yesterday.',
        created_at: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ]
  },
  {
    id: 'demo-2',
    description: 'Commercial trash bins overflowing onto pedestrian walkway near City Market entrance. Stench is unbearable and blocking foot traffic.',
    issue_type: 'Trash Overflow',
    severity: 'MEDIUM',
    priority_score: 74.0,
    department: 'Department of Sanitation & Waste Management',
    city: 'Central Sector',
    ward: 'Market Zone',
    local_authority: 'Sanitation Quick Response & Environmental Unit',
    routing_status: 'RESOLVED',
    routing_notes: 'Dispatched to Sanitation & Waste Management Quick Response Team. Cleared and sanitized.',
    upvotes: 67,
    downvotes: 1,
    user_vote: null,
    status: 'RESOLVED',
    latitude: 23.6845,
    longitude: 86.9632,
    user_name: 'Dr. Ananya Sen',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    work_order: {
      id: 'wo-2',
      status: 'RESOLVED',
      after_image_path: null,
      resolution_notes: 'Sanitation compactor truck deployed. Waste cleared, bins sanitized, and daily collection frequency doubled.',
      created_at: new Date(Date.now() - 3600000 * 40).toISOString()
    },
    comments: [
      {
        id: 'c-2',
        complaint_id: 'demo-2',
        user_name: 'Municipal Sanitation Lead',
        comment_text: 'Issue resolved on 18-Sep. Area cleared and disinfected.',
        created_at: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ]
  },
  {
    id: 'demo-3',
    description: 'High-pressure municipal water main pipeline fractured near Sector 3 primary school. Water flooding street and entering shops.',
    issue_type: 'Water Leakage',
    severity: 'CRITICAL',
    priority_score: 96.0,
    department: 'Municipal Water Supply & Sewerage Board',
    city: 'Riverside District',
    ward: 'South Corridor',
    local_authority: 'Municipal Water Supply Emergency Response Team',
    routing_status: 'DISPATCHED_TO_FIELD_CREW',
    routing_notes: 'Critical water main burst escalated to Municipal Water Supply emergency wing. SLA: 12 hours.',
    upvotes: 89,
    downvotes: 3,
    user_vote: null,
    status: 'IN_PROGRESS',
    latitude: 23.6798,
    longitude: 86.9589,
    user_name: 'Sunil Varma',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    work_order: {
      id: 'wo-3',
      status: 'IN_PROGRESS',
      after_image_path: null,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    comments: []
  },
  {
    id: 'demo-4',
    description: 'Cluster of five high-mast streetlights dark for over two weeks on Ring Road Bypass. Extremely unsafe for evening commuters.',
    issue_type: 'Streetlight Failure',
    severity: 'MEDIUM',
    priority_score: 62.0,
    department: 'Department of Electrical Infrastructure & Energy',
    city: 'East Suburbs',
    ward: 'Highway Zone',
    local_authority: 'Electrical Grid Infrastructure Division',
    routing_status: 'ROUTED_AND_DISPATCHED',
    routing_notes: 'Logged with Electrical Maintenance Unit #4. Replacement ballast and LED fixtures requisitioned.',
    upvotes: 28,
    downvotes: 0,
    user_vote: null,
    status: 'OPEN',
    latitude: 23.6954,
    longitude: 86.9821,
    user_name: 'Meera Patel',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    work_order: {
      id: 'wo-4',
      status: 'OPEN',
      created_at: new Date(Date.now() - 3600000 * 70).toISOString()
    },
    comments: []
  }
];

function getStoredFallbackIssues() {
  const local = localStorage.getItem('microgov_fallback_issues');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }
  localStorage.setItem('microgov_fallback_issues', JSON.stringify(FALLBACK_ISSUES));
  return FALLBACK_ISSUES;
}

function saveFallbackIssues(issues) {
  localStorage.setItem('microgov_fallback_issues', JSON.stringify(issues));
}

function getAuthHeaders(includeContentType = true) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  baseUrl: API_BASE_URL,

  async getComplaints({ sortBy = 'upvotes', department, ward, status, userId } = {}) {
    const params = new URLSearchParams();
    if (sortBy) params.append('sort_by', sortBy);
    if (department && department !== 'ALL') params.append('department', department);
    if (ward && ward !== 'ALL') params.append('ward', ward);
    if (status && status !== 'ALL') params.append('status', status);
    if (userId) params.append('user_id', userId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/?${params.toString()}`, {
        headers: getAuthHeaders(true)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using resilient fallback data:', err);
      let list = [...getStoredFallbackIssues()];
      if (department && department !== 'ALL') {
        list = list.filter((c) => c.department?.toLowerCase().includes(department.toLowerCase()));
      }
      if (ward && ward !== 'ALL') {
        list = list.filter((c) => c.ward === ward);
      }
      if (status && status !== 'ALL') {
        list = list.filter((c) => c.status === status);
      }
      if (sortBy === 'upvotes') {
        list.sort((a, b) => b.upvotes - a.upvotes);
      } else if (sortBy === 'priority') {
        list.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
      } else {
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      return list;
    }
  },

  async getComplaint(id, userId) {
    try {
      const url = userId 
        ? `${API_BASE_URL}/api/complaints/${id}?user_id=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/api/complaints/${id}`;
      const res = await fetch(url, {
        headers: getAuthHeaders(false)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const list = getStoredFallbackIssues();
      return list.find((c) => c.id === id) || null;
    }
  },

  async createComplaint(formData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/`, {
        method: 'POST',
        headers: getAuthHeaders(false),
        body: formData
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, saving complaint locally:', err);
      const desc = formData.get('description') || 'Civic Issue';
      const ward = formData.get('ward') || 'Central Sector';
      const city = formData.get('city') || 'Civic Hub';
      const userName = formData.get('user_name') || 'Citizen Reporter';

      const newIssue = {
        id: 'local-' + Date.now(),
        description: desc,
        issue_type: 'Civic Report',
        severity: 'MEDIUM',
        priority_score: 75.0,
        department: 'Department of Public Works & Roads',
        city,
        ward,
        local_authority: `${ward} Action Office & Zonal Engineer`,
        routing_status: 'ROUTED_AND_DISPATCHED',
        routing_notes: `Dynamic routing to ${ward} Civic Hub & Department of Public Works. Targeted SLA: 48h.`,
        upvotes: 1,
        downvotes: 0,
        user_vote: 'UP',
        status: 'OPEN',
        latitude: parseFloat(formData.get('latitude')) || 23.6889,
        longitude: parseFloat(formData.get('longitude')) || 86.9661,
        user_name: userName,
        created_at: new Date().toISOString(),
        work_order: {
          id: 'wo-' + Date.now(),
          status: 'OPEN',
          created_at: new Date().toISOString()
        },
        comments: []
      };

      const current = getStoredFallbackIssues();
      current.unshift(newIssue);
      saveFallbackIssues(current);
      return newIssue;
    }
  },

  async vote(complaintId, voteType, userId = 'citizen') {
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/${complaintId}/vote`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ vote_type: voteType, user_id: userId })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, voting locally:', err);
      const list = getStoredFallbackIssues();
      const issue = list.find((c) => c.id === complaintId);
      if (issue) {
        if (issue.user_vote === voteType) {
          if (voteType === 'UP') issue.upvotes = Math.max(0, issue.upvotes - 1);
          if (voteType === 'DOWN') issue.downvotes = Math.max(0, issue.downvotes - 1);
          issue.user_vote = null;
        } else {
          if (issue.user_vote === 'UP') issue.upvotes = Math.max(0, issue.upvotes - 1);
          if (issue.user_vote === 'DOWN') issue.downvotes = Math.max(0, issue.downvotes - 1);
          if (voteType === 'UP') issue.upvotes += 1;
          if (voteType === 'DOWN') issue.downvotes += 1;
          issue.user_vote = voteType;
        }
        saveFallbackIssues(list);
        return {
          complaint_id: complaintId,
          upvotes: issue.upvotes,
          downvotes: issue.downvotes,
          user_vote: issue.user_vote
        };
      }
      return { upvotes: 1, downvotes: 0, user_vote: voteType };
    }
  },

  async addComment(complaintId, commentText, userName = 'Citizen', userId = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/${complaintId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ comment_text: commentText, user_name: userName, user_id: userId })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const list = getStoredFallbackIssues();
      const issue = list.find((c) => c.id === complaintId);
      const newComment = {
        id: 'comm-' + Date.now(),
        complaint_id: complaintId,
        user_name: userName,
        comment_text: commentText,
        created_at: new Date().toISOString()
      };
      if (issue) {
        if (!issue.comments) issue.comments = [];
        issue.comments.push(newComment);
        saveFallbackIssues(list);
      }
      return newComment;
    }
  },

  async resolveWorkOrder(workOrderId, afterImageFile, resolutionNotes) {
    const formData = new FormData();
    formData.append('after_image', afterImageFile);
    if (resolutionNotes) formData.append('resolution_notes', resolutionNotes);

    const res = await fetch(`${API_BASE_URL}/api/work-orders/${workOrderId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  async updateComplaintStatus(complaintId, status) {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${complaintId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(false)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
};
