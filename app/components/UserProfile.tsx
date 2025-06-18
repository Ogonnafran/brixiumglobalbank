
import React, { useState, FormEvent, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { UserCircle, Mail, Phone, Lock } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { currentUser, updateUser, isLoading, setLoading, showToast } = useAppContext();
  
  const user = currentUser as User; // Assuming currentUser is User type for this page

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
        setName(user.name);
        setPhone(user.phone || '');
    }
  }, [user]);


  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    updateUser({ ...user, name, phone });
    showToast('Profile updated successfully!', 'success');
    setLoading(false);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    // In a real app, verify currentPassword against the stored hashed password
    if (currentPassword !== user.hashedPassword) { // Mock check
      setPasswordError('Incorrect current password.');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    updateUser({ ...user, hashedPassword: newPassword }); // Store new hashed password
    showToast('Password changed successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setLoading(false);
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Profile Information Section */}
      <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl animate-slide-in-up">
        <div className="flex items-center mb-6">
          <Icon name={UserCircle} className="text-brixium-purple-light mr-3" size={32} />
          <h2 className="text-2xl font-semibold text-brixium-purple-light">Profile Information</h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <Input
            id="email"
            label="Email"
            type="email"
            value={user.email}
            icon={<Mail size={18} className="text-brixium-gray"/>}
            disabled // Email usually not editable
          />
          <Input
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<UserCircle size={18} className="text-brixium-gray"/>}
            required
          />
          <Input
            id="phone"
            label="Phone Number (Optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone size={18} className="text-brixium-gray"/>}
            placeholder="e.g., +1 555 123 4567"
          />
          {profileError && <p className="text-sm text-red-400">{profileError}</p>}
          <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isLoading} disabled={isLoading}>
            Update Profile
          </Button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl animate-slide-in-up">
        <div className="flex items-center mb-6">
          <Icon name={Lock} className="text-brixium-purple-light mr-3" size={32} />
          <h2 className="text-2xl font-semibold text-brixium-purple-light">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-5">
          <Input
            id="currentPassword"
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            icon={<Lock size={18} className="text-brixium-gray"/>}
            required
          />
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock size={18} className="text-brixium-gray"/>}
            required
          />
          <Input
            id="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            icon={<Lock size={18} className="text-brixium-gray"/>}
            required
          />
          {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
          <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isLoading} disabled={isLoading}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
    