import apiClient from './axios';

const DEFAULT_FAMILIES = [];

function getLocalStore(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore invalid localStorage data and use the default value.
  }
  return defaultValue;
}

function saveLocalStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore localStorage write failures.
  }
}

export async function fetchFamilies() {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const params = currentUser.ashaWorkerId ? { ashaWorkerId: currentUser.ashaWorkerId } : {};
  try {
    const { data } = await apiClient.get('/api/asha/families', { params });
    const list = data?.data || data;
    if (Array.isArray(list)) return list;
  } catch (e) {
    // Preserve the local fallback when the backend request fails.
  }

  return getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
}

export async function fetchFamilyByCitizen(citizenId) {
  try {
    const { data } = await apiClient.get(`/api/asha/families/citizen/${citizenId}`);
    const fam = data?.data || data;
    if (fam && fam.id) return fam;
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const families = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  const match = families.find((f) => String(f.citizenId) === String(citizenId));
  return match || null;
}

export async function createFamily({ citizenId, ashaWorkerId, headOfFamily, houseNumber, village, contactPhone }) {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const payload = {
    citizenId,
    ashaWorkerId: ashaWorkerId || currentUser.ashaWorkerId || currentUser.id || 10,
    headOfFamily: headOfFamily || 'Head of Household',
    houseNumber: houseNumber || 'H.No 12/A',
    village: village || currentUser.village || 'Assigned Village',
    contactPhone: contactPhone || '—',
  };

  try {
    const { data } = await apiClient.post('/api/asha/families', payload);
    const result = data?.data || data;
    if (result) {
      const stored = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
      const updated = [result, ...stored];
      saveLocalStore('hg_asha_families', updated);
      return result;
    }
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const newFam = {
    id: Date.now(),
    ...payload,
    riskLevel: 'Low',
    members: [],
  };

  const stored = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  const updated = [newFam, ...stored];
  saveLocalStore('hg_asha_families', updated);
  return newFam;
}

export async function addFamilyMember(familyId, member) {
  const payload = {
    name: member.name,
    relationship: member.relationship || 'OTHER',
    age: Number(member.age) || 20,
    gender: member.gender || 'Female',
    isPregnant: Boolean(member.isPregnant),
    isChildMember: Boolean(member.isChildMember || Number(member.age) <= 5),
    vaccinationStatus: member.vaccinationStatus || 'UP_TO_DATE',
    healthConditions: member.healthConditions || 'None',
    riskStatus: member.riskStatus || 'NORMAL',
  };

  try {
    const { data } = await apiClient.post(`/api/asha/families/${familyId}/members`, payload);
    const result = data?.data || data;
    if (result) return result;
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const stored = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  const newMember = { id: Date.now(), familyId, ...payload };

  const updated = stored.map((f) => {
    if (String(f.id) === String(familyId)) {
      return { ...f, members: [...(f.members || []), newMember] };
    }
    return f;
  });

  saveLocalStore('hg_asha_families', updated);
  return newMember;
}

export async function updateFamilyMember(memberId, member) {
  const payload = {
    name: member.name,
    relationship: member.relationship,
    age: Number(member.age),
    gender: member.gender,
    isPregnant: Boolean(member.isPregnant),
    isChildMember: Boolean(member.isChildMember),
    vaccinationStatus: member.vaccinationStatus,
    healthConditions: member.healthConditions,
    riskStatus: member.riskStatus,
  };

  try {
    const { data } = await apiClient.put(`/api/asha/families/members/${memberId}`, payload);
    const result = data?.data || data;
    if (result) return result;
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const stored = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  const updated = stored.map((f) => ({
    ...f,
    members: (f.members || []).map((m) => (String(m.id) === String(memberId) ? { ...m, ...payload } : m)),
  }));

  saveLocalStore('hg_asha_families', updated);
  return { id: memberId, ...payload };
}

export async function deleteFamilyMember(memberId) {
  try {
    const { data } = await apiClient.delete(`/api/asha/families/members/${memberId}`);
    if (data) return true;
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const stored = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  const updated = stored.map((f) => ({
    ...f,
    members: (f.members || []).filter((m) => String(m.id) !== String(memberId)),
  }));

  saveLocalStore('hg_asha_families', updated);
  return true;
}

export async function deleteFamily(familyId) {
  try {
    await apiClient.delete(`/api/asha/families/${familyId}`);
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const stored = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  const updated = stored.filter((f) => String(f.id) !== String(familyId));
  saveLocalStore('hg_asha_families', updated);
  return true;
}

export async function fetchFamilyMetrics() {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const params = currentUser.ashaWorkerId ? { ashaWorkerId: currentUser.ashaWorkerId } : {};
  try {
    const { data } = await apiClient.get('/api/asha/families/metrics', { params });
    const stats = data?.data || data;
    if (stats && stats.totalFamilies !== undefined) return stats;
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const families = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  let totalMembers = 0;
  let pregnantWomen = 0;
  let childrenUnder5 = 0;
  let highRiskCases = 0;

  families.forEach((f) => {
    (f.members || []).forEach((m) => {
      totalMembers += 1;
      if (m.isPregnant) pregnantWomen += 1;
      if (m.isChildMember || m.age <= 5) childrenUnder5 += 1;
      if (m.riskStatus === 'HIGH_RISK' || m.riskStatus === 'High') highRiskCases += 1;
    });
  });

  return {
    totalFamilies: families.length,
    totalFamilyMembers: totalMembers,
    pregnantWomen,
    childrenUnder5,
    highRiskCases,
  };
}

export async function fetchChildHealthMembers() {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const params = currentUser.ashaWorkerId ? { ashaWorkerId: currentUser.ashaWorkerId } : {};
  try {
    const { data } = await apiClient.get('/api/asha/child-health', { params });
    const list = data?.data || data;
    if (Array.isArray(list)) return list;
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const families = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  const children = [];
  families.forEach((f) => {
    (f.members || []).forEach((m) => {
      if (m.isChildMember || m.age <= 5) {
        children.push({
          ...m,
          village: f.village,
          houseNumber: f.houseNumber,
        });
      }
    });
  });
  return children;
}

export async function fetchMaternalCareMembers() {
  const currentUser = JSON.parse(localStorage.getItem('hg_user') || '{}');
  const params = currentUser.ashaWorkerId ? { ashaWorkerId: currentUser.ashaWorkerId } : {};
  try {
    const { data } = await apiClient.get('/api/asha/maternal-care', { params });
    const list = data?.data || data;
    if (Array.isArray(list)) return list;
  } catch (e) {
    // Preserve the existing fallback when the operation fails.
  }

  const families = getLocalStore('hg_asha_families', DEFAULT_FAMILIES);
  const pregnant = [];
  families.forEach((f) => {
    (f.members || []).forEach((m) => {
      if (m.isPregnant) {
        pregnant.push({
          ...m,
          village: f.village,
          houseNumber: f.houseNumber,
        });
      }
    });
  });
  return pregnant;
}
