import axios from 'axios';
import type { UserProfile } from '../types/userProfile';

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await axios.get<UserProfile>('/api/users/me');
  return res.data;
}

/** Load profile with a JWT before it is written to localStorage (pre-login role check). */
export async function fetchUserProfileWithToken(token: string): Promise<UserProfile> {
  const res = await axios.get<UserProfile>('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateUserProfile(profile: UserProfile): Promise<UserProfile> {
  const res = await axios.put<UserProfile>('/api/users/me', profile);
  return res.data;
}
