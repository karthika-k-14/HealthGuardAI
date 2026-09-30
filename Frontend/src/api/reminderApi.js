import apiClient from './axios';

export async function fetchCitizenReminders(citizenId = 1) {
  try {
    const { data } = await apiClient.get(`/api/reminders/citizen/${citizenId}`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch medicine reminders:', err);
    return [];
  }
}

export async function createReminder(reminder) {
  try {
    const { data } = await apiClient.post('/api/reminders', reminder);
    return data;
  } catch (err) {
    console.error('Failed to create reminder:', err);
    throw err;
  }
}

export async function updateReminder(id, reminder) {
  try {
    const { data } = await apiClient.put(`/api/reminders/${id}`, reminder);
    return data;
  } catch (err) {
    console.error('Failed to update reminder:', err);
    throw err;
  }
}

export async function markReminderComplete(id) {
  try {
    const { data } = await apiClient.put(`/api/reminders/${id}/complete`);
    return data;
  } catch (err) {
    console.error('Failed to mark reminder complete:', err);
    throw err;
  }
}

export async function markReminderMissed(id) {
  try {
    const { data } = await apiClient.put(`/api/reminders/${id}/missed`);
    return data;
  } catch (err) {
    console.error('Failed to mark reminder missed:', err);
    throw err;
  }
}

export async function deleteReminder(id) {
  try {
    await apiClient.delete(`/api/reminders/${id}`);
    return true;
  } catch (err) {
    console.error('Failed to delete reminder:', err);
    throw err;
  }
}

export async function fetchAdherenceSummary(citizenId = 1) {
  try {
    const { data } = await apiClient.get(`/api/reminders/citizen/${citizenId}/adherence`);
    return data;
  } catch (err) {
    console.error('Failed to fetch adherence summary:', err);
    return {
      completedDoses: 0,
      missedDoses: 0,
      totalScheduledDoses: 0,
      adherencePercent: 0,
    };
  }
}

