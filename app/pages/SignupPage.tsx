import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { APP_NAME } from '../../constants';
import { UserPlus, Mail, Lock, DollarSign, Landmark } from 'lucide-react';
import Icon from '../../components/common/Icon';
import { Currency } from '../../types';

const SignupPage: React.FC = () => {
  const { signup, isLoading, appSettings } = useAppContext();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Default to appSettings.defaultUserCurrency (which should be USD)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(appSettings.defaultUserCurrency);
  const [error, setError] = useState('');


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const success = await signup(name, email, password, selectedCurrency);
    if (success) {
      navigate('/app/login'); // Redirect to login after successful signup
    } else {
      // Error message is shown via toast by context, or set locally if signup returns specific error
      // For now, relying on context's toast for existing email etc.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brixium-bg p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-brixium-bg-light p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <Icon name={Landmark} className="mx-auto text-brixium-purple" size={48}/>
          <h1 className="text-3xl font-bold text-brixium-purple-light mt-2">{APP_NAME}</h1>
          <p className="text-brixium-gray">Create your account to join the future of banking.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            icon={<UserPlus size={18} className="text-brixium-gray"/>}
            required
          />
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
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={18} className="text-brixium-gray"/>}
            required
          />
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-brixium-gray-light mb-1">
              Preferred Account Currency
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <DollarSign size={18} className="text-brixium-gray"/>
                </div>
                <select
                    id="currency"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                    className="w-full pl-10 pr-3 py-2.5 bg-brixium-bg-light border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light placeholder-brixium-gray focus:outline-none focus:ring-1 sm:text-sm"
                    required
                >
                    {/* Ensure defaultUserCurrency is listed and selected */}
                    {appSettings.supportedCurrencies.includes(appSettings.defaultUserCurrency) && 
                      <option key={appSettings.defaultUserCurrency} value={appSettings.defaultUserCurrency}>
                        {appSettings.defaultUserCurrency} (Default)
                      </option>
                    }
                    {appSettings.supportedCurrencies
                      .filter(curr => curr !== appSettings.defaultUserCurrency) // Avoid duplicating default if it's already explicitly selected
                      .map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                    ))}
                </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} size="lg">
            Create Account
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-brixium-gray">
          Already have an account?{' '}
          <Link to="/app/login" className="font-medium text-brixium-purple-light hover:text-brixium-purple transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
