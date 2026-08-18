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

    if (result.error) return showStatus(result.error.message, true);

    if (isSignUp && !result.data.session) {
      return showStatus('Account created. Check your email to confirm it, then log in.');
    }

    window.location.replace('Home.html');
  } catch (error) {
    console.error('Supabase authentication request failed:', error);
    showStatus('Unable to reach the authentication service. Please try again shortly.', true);
  } finally {
    submitButton.disabled = false;
  }
});

redirectIfSignedIn();
