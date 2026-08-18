const spotlight = document.getElementById('spotlight');
window.addEventListener('mousemove', (event) => {
  if (!spotlight) return;
  spotlight.style.left = `${event.clientX}px`;
  spotlight.style.top = `${event.clientY}px`;
});

const form = document.getElementById('login-form');
const statusBox = document.getElementById('status');
const submitButton = document.getElementById('submit-button');
const modeButton = document.getElementById('mode-button');
let isSignUp = false;

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? '#ff9b9b' : '#9fffc8';
}

function getAuthErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();
  const status = error?.status || error?.statusCode;

  if (message.includes('failed to fetch') || message.includes('networkerror') || message.includes('network request failed')) {
    return 'Cannot reach the authentication service. Check your internet connection and try again.';
  }
  if (status === 429 || message.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'An account already exists for this email. Try logging in instead.';
  }
  if (message.includes('password should be at least') || message.includes('password')) {
    return error.message;
  }
  if (status === 400 || status === 422) {
    return error.message || 'Please check the details you entered and try again.';
  }
  if (status === 403 || message.includes('apikey') || message.includes('api key')) {
    return 'Authentication is unavailable because the Supabase configuration is invalid.';
  }
  if (status === 401 || message.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }

  return 'Something went wrong. Please try again shortly.';
}

function setMode(signUp) {
  isSignUp = signUp;
  submitButton.textContent = signUp ? 'Create account' : 'Login';
  modeButton.textContent = signUp ? 'Already have an account? Login' : 'New here? Create an account';
  document.querySelector('.card-subtitle').textContent = signUp
    ? 'Create your Atlas Social account'
    : 'Secure sign in to your account';
  showStatus('');
}

async function redirectIfSignedIn() {
  if (!window.supabaseClient) return;
  try {
    const { data, error } = await window.supabaseClient.auth.getSession();
    if (!error && data.session) window.location.replace('Home.html');
  } catch (error) {
    console.error('Unable to restore Supabase session:', error);
  }
}

modeButton.addEventListener('click', () => setMode(!isSignUp));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!window.supabaseClient) {
    return showStatus('Supabase is not configured. Update supabase-config.js first.', true);
  }
  if (!username || !password) return showStatus('Enter your email and password.', true);

  submitButton.disabled = true;
  showStatus(isSignUp ? 'Creating account…' : 'Signing in…');

  try {
    const result = isSignUp
      ? await window.supabaseClient.auth.signUp({
          email: username,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login.html` }
        })
      : await window.supabaseClient.auth.signInWithPassword({ email: username, password });

    if (result.error) {
      console.error('Supabase authentication error:', result.error);
      return showStatus(getAuthErrorMessage(result.error), true);
    }

    if (!result.data?.user) {
      console.error('Supabase authentication returned no user:', result);
      return showStatus('Authentication did not complete. Please try again.', true);
    }

    if (isSignUp && !result.data.session) {
      return showStatus('Account created. Check your email to confirm it, then log in.');
    }

    window.location.replace('Home.html');
  } catch (error) {
    console.error('Supabase authentication request failed:', error);
    showStatus(getAuthErrorMessage(error), true);
  } finally {
    submitButton.disabled = false;
  }
});
redirectIfSignedIn();
