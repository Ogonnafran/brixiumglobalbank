import React, { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { APP_NAME } from '../../constants';
import { Mail, Lock, Landmark } from 'lucide-react'; // Import Landmark
import Icon from '../../components/common/Icon';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading, currentUser, isAdmin } = useAppContext(); // Added isAdmin
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app/dashboard";

  React.useEffect(() => {
    // Redirect if already logged in as user (and not an admin trying to access user login)
    if(currentUser && !isAdmin){ 
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
    const success = await login(email, password, false);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Login failed. Please check your credentials.'); // Context might show a toast too
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brixium-bg p-4 animate-fade-in">
      <div className="w-full max-w-md bg-brixium-bg-light p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <Icon name={Landmark} className="mx-auto text-brixium-purple" size={48}/>
          <h1 className="text-3xl font-bold text-brixium-purple-light mt-2">{APP_NAME}</h1>
          <p className="text-brixium-gray">Access your futuristic banking experience.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={<Mail size={18} className="text-brixium-gray"/>}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={18} className="text-brixium-gray"/>}
            required
          />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} size="lg">
            Login
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-brixium-gray">
          Don't have an account?{' '}
          <Link to="/app/signup" className="font-medium text-brixium-purple-light hover:text-brixium-purple transition-colors">
            Sign Up
          </Link>
        </p>
         {/* Admin login link removed as per requirement 
         <p className="mt-2 text-center text-sm text-brixium-gray">
          Are you an Admin?{' '}
          <Link to="/admin/login" className="font-medium text-brixium-purple-light hover:text-brixium-purple transition-colors">
            Admin Login
          </Link>
        </p> 
        */}
      </div>
    </div>
  );
};

export default LoginPage;
