import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { CURRENCIES } from '../utils/formatters';
import {
  User,
  Shield,
  Coins,
  Moon,
  Sun,
  Trash2,
  AlertTriangle,
  Save,
  Key,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';

export const Settings = () => {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const {
    currency,
    updateCurrency,
    theme,
    updateTheme,
    clearAllTxns,
    transactions,
    addToast,
  } = useFinance();

  const navigate = useNavigate();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  // Modals state
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });

    if (!name.trim()) {
      setProfileMsg({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }

    try {
      await updateProfile({ name: name.trim() });
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      addToast('Profile updated.', 'success');
    } catch (err) {
      setProfileMsg({ text: err.message || 'Failed to update profile.', type: 'error' });
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (!currentPassword) {
      setPasswordMsg({ text: 'Current password is required.', type: 'error' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      addToast('Password changed successfully.', 'success');
    } catch (err) {
      setPasswordMsg({ text: err.message || 'Failed to change password.', type: 'error' });
    }
  };

  // Handle Clear All Data
  const handleConfirmClearData = () => {
    clearAllTxns();
    setIsClearDataModalOpen(false);
  };

  // Handle Delete Account
  const handleConfirmDeleteAccount = async () => {
    await deleteAccount();
    setIsDeleteAccountModalOpen(false);
    navigate('/signup');
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Account & Preferences</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
          Manage your personal profile, display currency, theme, and data management
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <User size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Personal Profile</span>
            </h3>
            <p className="card-subtitle">Your registered demo account information</p>
          </div>
        </div>

        {profileMsg.text && (
          <div className={`alert-box ${profileMsg.type === 'error' ? 'alert-danger' : 'alert-info'}`}>
            {profileMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">
                Full Name
              </label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-email">
                Email Address (Read-only)
              </label>
              <input
                id="settings-email"
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preferences Card (Currency & Theme) */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Coins size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Application Preferences</span>
            </h3>
            <p className="card-subtitle">Configure preferred currency symbol and interface theme</p>
          </div>
        </div>

        <div className="form-row">
          {/* Currency selection */}
          <div className="form-group">
            <label className="form-label">Default Currency</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => updateCurrency(code)}
                  className="btn"
                  style={{
                    border: `2px solid ${currency === code ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    background: currency === code ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                    color: currency === code ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: currency === code ? 700 : 500,
                    justifyContent: 'center',
                    padding: '10px',
                  }}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme selection */}
          <div className="form-group">
            <label className="form-label">Display Theme</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => updateTheme('light')}
                className="btn"
                style={{
                  border: `2px solid ${theme === 'light' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: theme === 'light' ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                  color: theme === 'light' ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: theme === 'light' ? 700 : 500,
                  justifyContent: 'center',
                  padding: '10px',
                  gap: '8px',
                }}
              >
                <Sun size={18} />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => updateTheme('dark')}
                className="btn"
                style={{
                  border: `2px solid ${theme === 'dark' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: theme === 'dark' ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                  color: theme === 'dark' ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: theme === 'dark' ? 700 : 500,
                  justifyContent: 'center',
                  padding: '10px',
                  gap: '8px',
                }}
              >
                <Moon size={18} />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Key size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Change Password</span>
            </h3>
            <p className="card-subtitle">Update your local demo account password</p>
          </div>
        </div>

        {passwordMsg.text && (
          <div className={`alert-box ${passwordMsg.type === 'error' ? 'alert-danger' : 'alert-info'}`}>
            {passwordMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label" htmlFor="current-pw">
              Current Password
            </label>
            <input
              id="current-pw"
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="new-pw">
                New Password
              </label>
              <input
                id="new-pw"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-pw">
                Confirm New Password
              </label>
              <input
                id="confirm-new-pw"
                type="password"
                className="form-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Key size={15} />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Session & Sign Out Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <LogOut size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Active Session</span>
            </h3>
            <p className="card-subtitle">Sign out of your account on this device</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-hover)',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>Currently Signed In</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Logged in as {user?.name} ({user?.email}). Logging out preserves all your saved transactions and budgets.
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ color: 'var(--color-expense)', borderColor: 'var(--color-expense-border)' }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Data Reset & Account Deletion */}
      <div className="card" style={{ borderColor: 'var(--color-expense-border)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ color: 'var(--color-expense)' }}>
              <AlertTriangle size={18} />
              <span>Data Management & Danger Zone</span>
            </h3>
            <p className="card-subtitle">Irreversible actions regarding your stored records</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Clear Transactions */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-hover)',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>Clear All Transactions</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Permanently delete all {transactions.length} manual transaction records for this account.
              </div>
            </div>
            <button
              onClick={() => setIsClearDataModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--color-expense)', borderColor: 'var(--color-expense-border)' }}
              disabled={transactions.length === 0}
            >
              <Trash2 size={15} />
              <span>Clear Transactions ({transactions.length})</span>
            </button>
          </div>

          {/* Delete Account */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-expense-bg)',
              border: '1px solid var(--color-expense-border)',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-expense)' }}>Delete Demo Account</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Erase this user profile, transactions, budgets, and preferences completely.
              </div>
            </div>
            <button
              onClick={() => setIsDeleteAccountModalOpen(true)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={15} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Educational Authentication Disclaimer */}
      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border-color)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
          <Shield size={16} />
          <span>Local Storage Security Disclaimer</span>
        </div>
        This application stores accounts, transactions, and settings inside your browser's Local Storage. Local Storage data is unencrypted and scoped to this specific browser installation. Do not use actual production passwords or sensitive financial credentials.
      </div>

      {/* Confirmation Modals */}
      <DeleteConfirmModal
        isOpen={isClearDataModalOpen}
        title="Clear All Transactions"
        message="Are you sure you want to delete all transaction entries for this account? This cannot be undone."
        confirmText="Yes, Clear All"
        onConfirm={handleConfirmClearData}
        onCancel={() => setIsClearDataModalOpen(false)}
      />

      <DeleteConfirmModal
        isOpen={isDeleteAccountModalOpen}
        title="Delete Demo Account"
        message="Are you sure you want to delete your entire account? All your transactions, monthly budgets, and personal settings will be permanently erased."
        confirmText="Yes, Delete My Account"
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setIsDeleteAccountModalOpen(false)}
      />
    </div>
  );
};
