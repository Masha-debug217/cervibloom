import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function destinationFor(role) {
  return role === 'ADMIN' ? '/admin' : '/dashboard';
}

export default function SignInForm({ t, onSwitchToSignUp }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState(false);

  const usernameError = touched && !form.username ? t('Username is required', 'Jina la mtumiaji linahitajika') : '';
  const passwordError = touched && !form.password ? t('Password is required', 'Nenosiri linahitajika') : '';

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!form.username || !form.password) return;
    setAuthError('');
    setIsLoading(true);
    try {
      const u = await login(form.username, form.password);
      navigate(destinationFor(u?.role));
    } catch {
      setAuthError(t('Incorrect username or password.', 'Jina la mtumiaji au nenosiri si sahihi.'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
          {t('Welcome back', 'Karibu tena')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('Sign in to your CerviBloom account to continue your health journey.', 'Ingia kwenye akaunti yako ya CerviBloom kuendelea na safari yako ya afya.')}
        </p>
      </div>

      {authError && <div className="error-box">{authError}</div>}

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t('Username', 'Jina la mtumiaji')}
          </label>
          <input
            type="text"
            className="input-field"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          {usernameError && <p className="mt-1.5 text-xs text-red-600">{usernameError}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t('Password', 'Nenosiri')}
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field !pr-11"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? t('Hide password', 'Ficha nenosiri') : t('Show password', 'Onyesha nenosiri')}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordError && <p className="mt-1.5 text-xs text-red-600">{passwordError}</p>}
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t('Trouble signing in? Email', 'Una shida kuingia? Tuma barua pepe')}{' '}
            <a href="mailto:cervibloom@gmail.com" className="text-primary hover:underline">cervibloom@gmail.com</a>
          </p>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-sm">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              {t('Sign In', 'Ingia')}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t("Don't have an account?", 'Huna akaunti?')}{' '}
        <button type="button" onClick={onSwitchToSignUp} className="text-primary font-semibold hover:underline">
          {t('Create one free', 'Fungua bure')}
        </button>
      </p>
    </div>
  );
}
