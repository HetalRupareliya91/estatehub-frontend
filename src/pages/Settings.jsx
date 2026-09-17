import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', password: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [org, setOrg] = useState({ companyName: '', currency: '', timezone: '' });
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgMessage, setOrgMessage] = useState('');

  useEffect(() => {
    async function loadOrg() {
      try {
        const { data } = await api.get('/settings');
        setOrg({ companyName: data.companyName || '', currency: data.currency || '', timezone: data.timezone || '' });
      } finally {
        setLoadingOrg(false);
      }
    }
    loadOrg();
  }, []);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const payload = { name: profile.name, phone: profile.phone };
      if (profile.password) payload.password = profile.password;
      await api.patch(`/agents/${user.id}`, payload);
      setProfileMessage('Profile updated.');
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleOrgSubmit(e) {
    e.preventDefault();
    setSavingOrg(true);
    setOrgMessage('');
    try {
      await Promise.all([
        api.put('/settings/companyName', { value: org.companyName }),
        api.put('/settings/currency', { value: org.currency }),
        api.put('/settings/timezone', { value: org.timezone }),
      ]);
      setOrgMessage('Organization settings updated.');
    } catch (err) {
      setOrgMessage(err.response?.data?.message || 'Unable to update settings.');
    } finally {
      setSavingOrg(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your profile and organization preferences.</p>
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>My profile</h2>
      <form onSubmit={handleProfileSubmit} style={{ maxWidth: 420, marginBottom: 40 }}>
        <div className="field">
          <label>Name</label>
          <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Phone</label>
          <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </div>
        <div className="field">
          <label>New password (leave blank to keep current)</label>
          <input type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} />
        </div>
        {profileMessage && <p className="page-subtitle">{profileMessage}</p>}
        <button className="btn btn-primary" type="submit" disabled={savingProfile}>
          {savingProfile ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {user?.role === 'admin' && (
        <>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Organization</h2>
          {loadingOrg ? (
            <div className="empty-state">Loading…</div>
          ) : (
            <form onSubmit={handleOrgSubmit} style={{ maxWidth: 420 }}>
              <div className="field">
                <label>Company name</label>
                <input value={org.companyName} onChange={(e) => setOrg({ ...org, companyName: e.target.value })} />
              </div>
              <div className="field">
                <label>Currency</label>
                <input value={org.currency} onChange={(e) => setOrg({ ...org, currency: e.target.value })} />
              </div>
              <div className="field">
                <label>Timezone</label>
                <input value={org.timezone} onChange={(e) => setOrg({ ...org, timezone: e.target.value })} />
              </div>
              {orgMessage && <p className="page-subtitle">{orgMessage}</p>}
              <button className="btn btn-primary" type="submit" disabled={savingOrg}>
                {savingOrg ? 'Saving…' : 'Save organization settings'}
              </button>
            </form>
          )}
        </>
      )}
    </>
  );
}

