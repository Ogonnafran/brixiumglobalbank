
import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { APP_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } from '../../constants';
import { Shield, Mail, Lock } from 'lucide-react';
import Icon from '../../components/common/Icon';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, currentUser, isAdmin } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin/dashboard";

  React.useEffect(() => {
    if(currentUser && isAdmin){ // Redirect if already logged in as admin
        navigate(from, { replace: true });
    }
  }, [currentUser, isAdmin, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // For demo, checking against constants. In real app, this would be an API call.
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        const success = await login(email, password, true); // Attempt login via context anyway
        if(success) {
            navigate(from, { replace: true });
        } else {
            setError('Invalid admin credentials.');
        }
        return;
    }

    const success = await login(email, password, true);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Admin login failed.'); // Should be handled by context toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brixium-bg p-4 animate-fade-in">
      <div className="w-full max-w-md bg-brixium-bg-light p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <Icon name={Shield} className="mx-auto text-brixium-purple" size={48}/>
          <h1 className="text-3xl font-bold text-brixium-purple-light mt-2">{APP_NAME}</h1>
          <p className="text-brixium-gray">Administrator Access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Admin Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={ADMIN_EMAIL}
            icon={<Mail size={18} className="text-brixium-gray"/>}
            required
          />
          <Input
            id="password"
            label="Admin Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={18} className="text-brixium-gray"/>}
            required
          />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} size="lg">
            Admin Login
          </Button>
        </form>
         <p className="mt-8 text-center text-sm text-brixium-gray">
          User?{' '}
          <Link to="/app/login" className="font-medium text-brixium-purple-light hover:text-brixium-purple transition-colors">
            Go to User Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
    