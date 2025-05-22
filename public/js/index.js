document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      logoutBtn.parentElement.innerHTML = `
        <div class='spinner-border' role='status'>
          <span class='visually-hidden'>Loading...</span>
        </div>
      `;

      const res = await fetch('/api/v1/logout');

      if (!res.ok) {
        logoutBtn.parentElement.innerHTML = e.target;
      } else {
        // פשוט רענון של העמוד הנוכחי
        window.location.reload();
      }
    });
  }
});
