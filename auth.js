// Include this file on pages that require a signed-in Supabase user.
(async () => {
  if (!window.supabaseClient) {
    alert('Supabase is not configured. Update supabase-config.js first.');
    window.location.replace('login.html');
    return;
  }

  const { data, error } = await window.supabaseClient.auth.getSession();
  if (error || !data.session) {
    window.location.replace('login.html');
    return;
  }

  const menu = document.querySelector('.menu');
  if (!menu) return;
  const logout = document.createElement('button');
  logout.type = 'button';
  logout.className = 'Button';
  logout.textContent = 'Logout';
  logout.addEventListener('click', async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    await window.supabaseClient.auth.signOut({ scope: 'local' });
    window.location.replace('login.html');
  });
  menu.appendChild(logout);
})();
