import apiClient from './axios';
import { ROLES } from '../constants/roles';

function isAdminOrOfficer() {
  try {
    const user = JSON.parse(localStorage.getItem('hg_user') || '{}');
    const role = (user.role || '').toUpperCase();
    return role === 'ADMIN' || role === 'HEALTH_OFFICER' || role === 'ROLE_ADMIN' || role === 'ROLE_HEALTH_OFFICER';
  } catch (e) {
    return false;
  }
}

export async function fetchCitizensList() {
  const admin = isAdminOrOfficer();
  let backendCitizens = [];
  try {
    const { data } = await apiClient.get('/api/citizens');
    const list = data?.data || data;
    if (Array.isArray(list) && list.length > 0) {
      backendCitizens = list.map((u) => {
        const phone = u.mobileNumber || u.phone || u.phoneNumber || '—';
        return {
          id: u.id,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          phone,
          mobileNumber: phone,
          phoneNumber: phone,
          village: u.village || u.address || 'Coimbatore Village',
          age: u.age || 28,
          gender: u.gender || 'Not specified',
          accountStatus: u.accountStatus || 'ACTIVE',
        };
      });
    }
  } catch (e) {
    if (admin) {
      const { data } = await apiClient.get('/api/admin/citizens');
      const list = data?.data || data;
      if (Array.isArray(list) && list.length > 0) {
        backendCitizens = list.map((u) => {
          const phone = u.mobileNumber || u.phone || u.phoneNumber || '—';
          return {
            id: u.id,
            name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
            phone,
            mobileNumber: phone,
            phoneNumber: phone,
            village: u.village || u.address || 'Coimbatore Village',
            age: u.age || 28,
            gender: u.gender || 'Not specified',
            accountStatus: u.accountStatus || 'ACTIVE',
          };
        });
      }
    }
  }

  let usersList = [];
  if (admin) {
    try {
      const { data } = await apiClient.get('/api/admin/users');
      const users = data?.data || data;
      if (Array.isArray(users)) {
        const citizens = users.filter((u) => u.role === 'CITIZEN' || u.role === 'ROLE_CITIZEN' || u.role === 'citizen');
        usersList = citizens.map((u) => {
          const phone = u.phoneNumber || u.mobileNumber || u.phone || '—';
          return {
            id: u.id,
            name: u.fullName || u.name || u.citizenName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
            phone,
            mobileNumber: phone,
            phoneNumber: phone,
            village: u.village || u.address || u.district || 'Coimbatore Village',
            age: u.age || 28,
            gender: u.gender || 'Not specified',
            accountStatus: u.accountStatus || 'ACTIVE',
          };
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  const all = [...backendCitizens, ...usersList];
  const seen = new Set();
  const res = [];
  for (const c of all) {
    const key = String(c.id || c.name).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      res.push(c);
    }
  }
  return res;
}

export async function fetchAshaWorkersList() {
  const admin = isAdminOrOfficer();
  let backendWorkers = [];

  // 1. Fetch from /api/asha-workers (admin-service shared data)
  try {
    const { data } = await apiClient.get('/api/asha-workers');
    const list = data?.data || data;
    if (Array.isArray(list) && list.length > 0) {
      const mapped = list.map((u) => ({
        id: u.id,
        name: u.fullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
        phone: u.mobileNumber || u.phone || u.phoneNumber || '—',
        village: u.village || u.district || 'Assigned Area',
        district: u.district || 'Coimbatore',
      }));
      backendWorkers.push(...mapped);
    }
  } catch (e) {
    if (admin) {
      try {
        const { data } = await apiClient.get('/api/admin/asha-workers');
        const list = data?.data || data;
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((u) => ({
            id: u.id,
            name: u.fullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
            email: u.email,
            phone: u.mobileNumber || u.phone || u.phoneNumber || '—',
            village: u.village || u.district || 'Assigned Area',
            district: u.district || 'Coimbatore',
          }));
          backendWorkers.push(...mapped);
        }
      } catch (err) {
        // Ignore
      }
    }
  }

  // 2. Fetch from /api/asha (community-service)
  try {
    const { data } = await apiClient.get('/api/asha');
    const list = data?.data || data;
    if (Array.isArray(list) && list.length > 0) {
      const mapped = list.map((u) => ({
        id: u.id,
        name: u.fullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
        phone: u.mobileNumber || u.phone || u.phoneNumber || '—',
        village: u.village || u.assignedPHC || u.district || 'Assigned Area',
        district: u.district || 'Coimbatore',
      }));
      backendWorkers.push(...mapped);
    }
  } catch (e) {
    // Ignore
  }

  // 3. Fetch from /api/admin/users
  let usersList = [];
  if (admin) {
    try {
      const { data } = await apiClient.get('/api/admin/users');
      const users = data?.data || data;
      if (Array.isArray(users)) {
        const workers = users.filter((u) => {
          const r = String(u.role || '').toUpperCase().trim();
          return (
            r === 'ASHA' ||
            r === 'ASHA_WORKER' ||
            r === 'ROLE_ASHA' ||
            r === 'ROLE_ASHA_WORKER' ||
            r.includes('ASHA')
          );
        });
        usersList = workers.map((u) => ({
          id: u.id,
          name: u.fullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          email: u.email,
          phone: u.mobileNumber || u.phone || u.phoneNumber || '—',
          village: u.village || u.assignedVillage || u.district || 'Assigned Area',
          district: u.district || 'Coimbatore',
        }));
      }
    } catch (e) {
      // Ignore
    }
  }

  const all = [...backendWorkers, ...usersList];
  const seen = new Set();
  const res = [];
  for (const w of all) {
    if (!w || !w.id) continue;
    const key = String(w.id);
    if (!seen.has(key)) {
      seen.add(key);
      res.push(w);
    }
  }

  // Fallback demo ASHA workers if database has none yet
  if (res.length === 0) {
    return [
      { id: 1, name: 'Srinithi V R', phone: '8825524729', village: 'myleripalayam', district: 'Coimbatore' },
      { id: 2, name: 'Kavitha Raman', phone: '9876543210', village: 'Ward 12, Patia', district: 'Coimbatore' },
      { id: 3, name: 'Ananya Sharma', phone: '9876543211', village: 'Periyanaickenpalayam', district: 'Coimbatore' },
    ];
  }

  return res;
}

export async function fetchAssignments() {
  try {
    const { data } = await apiClient.get('/api/citizen-assignments');
    const list = data?.data || data;
    if (Array.isArray(list) && list.length > 0) return list;
  } catch (e) {
    if (isAdminOrOfficer()) {
      const { data } = await apiClient.get('/api/admin/assignments');
      const list = data?.data || data;
      if (Array.isArray(list) && list.length > 0) return list;
    }
  }
  return [];
}

export async function assignCitizen({ citizenId, ashaWorkerId, citizenName, ashaWorkerName, village }) {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  if (currentUser.role === ROLES.ASHA || currentUser.role === 'ASHA' || currentUser.role === 'ASHA_WORKER') {
    const err = new Error('403 Forbidden: ASHA workers are not authorized to assign citizens.');
    err.status = 403;
    throw err;
  }

  const payload = {
    citizenId,
    ashaWorkerId,
    citizenName,
    ashaWorkerName,
    village,
    assignedByAdminId: currentUser.id || 1,
  };

  try {
    const { data } = await apiClient.post('/api/citizen-assignments', payload, {
      headers: { 'X-User-Role': currentUser.role || 'ADMIN' },
    });
    return data?.data || data;
  } catch (err) {
    if (err?.response?.status === 403) throw err;
    const { data } = await apiClient.post('/api/admin/assignments', payload, {
      headers: { 'X-User-Role': currentUser.role || 'ADMIN' },
    });
    return data?.data || data;
  }
}

export async function reassignCitizen(assignmentId, { ashaWorkerId, ashaWorkerName }) {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  if (currentUser.role === ROLES.ASHA || currentUser.role === 'ASHA' || currentUser.role === 'ASHA_WORKER') {
    const err = new Error('403 Forbidden: ASHA workers are not authorized to reassign citizens.');
    err.status = 403;
    throw err;
  }

  const { data } = await apiClient.put(`/api/citizen-assignments/${assignmentId}`, { ashaWorkerId, ashaWorkerName }, {
    headers: { 'X-User-Role': currentUser.role || 'ADMIN' },
  });
  return data?.data || data;
}

export async function removeAssignment(assignmentId) {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  if (currentUser.role === ROLES.ASHA || currentUser.role === 'ASHA' || currentUser.role === 'ASHA_WORKER') {
    const err = new Error('403 Forbidden: ASHA workers are not authorized to remove assignments.');
    err.status = 403;
    throw err;
  }

  await apiClient.delete(`/api/citizen-assignments/${assignmentId}`, {
    headers: { 'X-User-Role': currentUser.role || 'ADMIN' },
  });
  return { id: assignmentId, deleted: true };
}

export async function fetchAssignedCitizensForAsha(ashaUser) {
  const allAssignments = await fetchAssignments();
  const allCitizens = await fetchCitizensList();

  // 1. Check if ashaWorkerId is already present on user session
  let resolvedWorkerId = ashaUser?.ashaWorkerId;

  // 2. If missing, resolve asha_worker.id using user's email against asha_workers
  if (!resolvedWorkerId && ashaUser?.email) {
    try {
      const workers = await fetchAshaWorkersList();
      const match = workers.find(
        (w) => w.email && w.email.toLowerCase() === ashaUser.email.toLowerCase()
      );
      if (match) {
        resolvedWorkerId = match.id;
        // Self-heal the session in localStorage so subsequent calls are instant
        try {
          const stored = JSON.parse(localStorage.getItem('hg_user') || '{}');
          stored.ashaWorkerId = match.id;
          stored.userId = stored.userId || stored.id;
          localStorage.setItem('hg_user', JSON.stringify(stored));
        } catch (err) {}
      }
    } catch (err) {}
  }

  const ashaWorkerIdStr = resolvedWorkerId ? String(resolvedWorkerId) : null;
  const ashaUserIdStr = String(ashaUser?.userId || ashaUser?.id || '');
  const ashaNameStr = String(ashaUser?.name || '').toLowerCase().trim();

  const myAssignments = allAssignments.filter((a) => {
    // 1. Primary match: match assignment's ashaWorkerId with resolved asha_workers.id
    if (ashaWorkerIdStr && String(a.ashaWorkerId) === ashaWorkerIdStr) return true;
    // 2. Secondary match: if assignment stored auth userId directly
    if (!ashaWorkerIdStr && a.ashaWorkerId && String(a.ashaWorkerId) === ashaUserIdStr) return true;
    // 3. Fallback match: worker name match
    if (ashaNameStr && a.ashaWorkerName && a.ashaWorkerName.toLowerCase().trim() === ashaNameStr) return true;
    return false;
  });

  const assignedCitizenIds = new Set(myAssignments.map((a) => String(a.citizenId)));
  const list = allCitizens.filter((c) => assignedCitizenIds.has(String(c.id)));
  return list;
}

