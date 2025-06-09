// src/components/auth/Signup.tsx
import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { registerUser } from '../../redux/auth/authThunks';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface SignupFormState {
  name: string;
  email: string;
  password: string;
  profile_image: File | null;
}

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: { auth: { isAuthenticated: boolean } }) => state.auth);

  const [form, setForm] = useState<SignupFormState>({
    name: '',
    email: '',
    password: '',
    profile_image: null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm((prev) => ({ ...prev, profile_image: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Dispatch the plain object as expected by registerUser
    dispatch(registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
      profile_image: form.profile_image ?? undefined,
    }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log("user login then redirecting to dashboard page");

      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleInputChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleInputChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleInputChange}
        required
      />
      <input type="file" name="profile_image" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default Signup;
