const homeButton = document.getElementById('aboutHomeButton');

homeButton?.addEventListener('click', async () => {
  if (!window.supabaseClient) {
    alert('Please log in first.');
    window.location.assign('login.html');
    return;
  }
  const { data, error } = await window.supabaseClient.auth.getSession();
  if (error || !data.session) {
    alert('Please log in first.');
    window.location.assign('login.html');
    return;
  }
  window.location.assign('Home.html');
});
