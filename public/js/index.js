document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      // Show loading spinner while logging out
      logoutBtn.parentElement.innerHTML = `
        <div class='spinner-border' role='status'>
          <span class='visually-hidden'>Loading...</span>
        </div>
      `;

      try {
        const res = await fetch('/api/v1/logout');

        if (!res.ok) {
          // Restore original button HTML on failure
          logoutBtn.parentElement.innerHTML = e.target.outerHTML;
        } else {
          // Reload page after successful logout
          window.location.reload();
        }
      } catch (error) {
        console.error('Logout failed:', error);
        // Restore original button HTML on error
        logoutBtn.parentElement.innerHTML = e.target.outerHTML;
      }
    });
  }
});
