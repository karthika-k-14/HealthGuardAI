import { mockRequest } from './mockClient';
import apiClient from './axios';
import emergencyFixture from '../data/emergencyContacts.json';

// TODO: Missing backend API: /citizen/emergency-services
export async function fetchEmergencyServices() {
  return mockRequest(emergencyFixture.services);
}

// TODO: Missing backend API: /citizen/blood-banks
export async function fetchBloodBanks() {
  return mockRequest(emergencyFixture.bloodBanks);
}

// TODO: Missing backend API: /citizen/emergency-tips
export async function fetchEmergencyTips() {
  return mockRequest(emergencyFixture.emergencyTips);
}

// ---- Emergency Contact Management (real backend: /citizen/emergency-contacts) ----

function mapEmergencyContact(data) {
  if (!data) return null;
  return {
    id: data.id,
    uuid: data.uuid,
    name: data.name,
    relationship: data.relationship,
    phone: data.phone,
    alternatePhone: data.alternatePhone,
    email: data.email,
    address: data.address,
    isPrimary: Boolean(data.isPrimary),
    createdAt: data.createdAt,
  };
}

export async function fetchEmergencyContacts() {
  const { data } = await apiClient.get('/citizen/emergency-contacts');
  return (data || []).map(mapEmergencyContact);
}

export async function searchEmergencyContacts(keyword) {
  const { data } = await apiClient.get('/citizen/emergency-contacts/search', {
    params: { keyword: keyword || undefined },
  });
  return (data || []).map(mapEmergencyContact);
}

export async function addEmergencyContact(contact) {
  const { data } = await apiClient.post('/citizen/emergency-contacts', {
    name: contact.name,
    relationship: contact.relationship,
    phone: contact.phone,
    alternatePhone: contact.alternatePhone || null,
    email: contact.email || null,
    address: contact.address || null,
    isPrimary: Boolean(contact.isPrimary),
  });
  return mapEmergencyContact(data);
}

export async function updateEmergencyContact(contactId, contact) {
  const { data } = await apiClient.put(`/citizen/emergency-contacts/${contactId}`, {
    name: contact.name,
    relationship: contact.relationship,
    phone: contact.phone,
    alternatePhone: contact.alternatePhone || null,
    email: contact.email || null,
    address: contact.address || null,
    isPrimary: Boolean(contact.isPrimary),
  });
  return mapEmergencyContact(data);
}

export async function deleteEmergencyContact(contactId) {
  await apiClient.delete(`/citizen/emergency-contacts/${contactId}`);
  return true;
}
