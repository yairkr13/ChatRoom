document.addEventListener('DOMContentLoaded', function() {
  const messagesContainer = document.getElementById('messages-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-message');
  const editMessageModalEl = document.getElementById('editMessageModal');
  const editMessageModal = new bootstrap.Modal(editMessageModalEl);
  const editMessageId = document.getElementById('edit-message-id');
  const editMessageContent = document.getElementById('edit-message-content');
  const saveEditButton = document.getElementById('save-edit-message');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-btn');
  const clearSearchButton = document.getElementById('clear-search-btn');
  const logoutButton = document.getElementById('logout-btn');
  const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
  const deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalEl);
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const deleteMessageIdInput = document.getElementById('delete-message-id');

  let lastUpdate = Date.now();
  let isPolling = true;

  let allMessages = [];
  let isSearchActive = false;

  // Create message DOM element
  function createMessageElement(message) {
    const isOwnMessage = message.senderId === userId;

    const messageItem = document.createElement('div');
    messageItem.className = `message-item card mb-2 ${isOwnMessage ? 'border-success' : 'border-secondary'}`;
    messageItem.dataset.id = message.id;

    messageItem.innerHTML = `
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="card-subtitle text-muted mb-0">
            <i class="bi bi-person-circle me-1"></i>
            ${message.sender.firstName} ${message.sender.lastName}
          </h6>
          <small class="text-muted">
            <i class="bi bi-clock"></i> ${new Date(message.createdAt).toLocaleString()}
          </small>
        </div>
        <p class="card-text message-content mb-0">${escapeHtml(message.content)}</p>
        ${isOwnMessage ? `
          <div class="message-actions mt-3 text-end">
            <button class="btn btn-sm btn-outline-success me-2 edit-message-btn" aria-label="Edit message">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-message-btn" aria-label="Delete message" data-bs-toggle="modal" data-bs-target="#deleteConfirmModal" data-id="${message.id}">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    if (isOwnMessage) {
      const editBtn = messageItem.querySelector('.edit-message-btn');
      const deleteBtn = messageItem.querySelector('.delete-message-btn');

      editBtn.addEventListener('click', () => {
        editMessageId.value = message.id;
        editMessageContent.value = message.content;
        editMessageModal.show();
      });

      deleteBtn.addEventListener('click', () => {
        deleteMessageIdInput.value = message.id;
      });
    }

    return messageItem;
  }

  // Escape HTML special characters to prevent XSS
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Display messages in container
  function displayMessages(messages) {
    messagesContainer.innerHTML = '';

    if (messages && messages.length > 0) {
      const fragment = document.createDocumentFragment();

      // Sort newest first
      const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      sortedMessages.forEach(message => {
        const messageEl = createMessageElement(message);
        fragment.appendChild(messageEl);
      });

      messagesContainer.appendChild(fragment);
    } else {
      messagesContainer.innerHTML = `
        <div class="text-center text-muted py-5">
          <i class="bi bi-info-circle mb-2" style="font-size: 2rem;"></i>
          <p class="mb-0 fs-5">No messages yet. Be the first to send a message!</p>
        </div>
      `;
    }
  }

  // Fetch all messages initially
  async function getAllMessages() {
    try {
      const res = await fetch('/api/messages/all');
      if (!res.ok) throw new Error('Failed to fetch all messages');

      const data = await res.json();

      if (data.data && data.data.messages) {
        allMessages = data.data.messages;
        if (!isSearchActive) {
          displayMessages(allMessages);
        }
      }
    } catch (error) {
      console.error('Error fetching all messages:', error);
    }
  }

  // Poll for new messages after lastUpdate
  async function getMessages() {
    if (!isPolling) return;

    try {
      const res = await fetch(`/api/messages?lastUpdate=${lastUpdate}`);
      if (!res.ok) throw new Error('Failed to fetch messages');

      const data = await res.json();

      if (data.data && data.data.messages && data.data.messages.length > 0) {
        lastUpdate = data.data.timestamp;

        let hasNewMessages = false;

        data.data.messages.forEach(newMsg => {
          const idx = allMessages.findIndex(m => m.id === newMsg.id);
          if (idx !== -1) {
            allMessages[idx] = newMsg;
          } else {
            allMessages.push(newMsg);
            hasNewMessages = true;
          }
        });

        if (!isSearchActive) {
          displayMessages(allMessages);
          if (hasNewMessages && messagesContainer.scrollTo) {
            messagesContainer.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }

    setTimeout(getMessages, POLLING_INTERVAL);
  }

  // Send a new message
  async function sendMessage(content) {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ content })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to send message');
      }

      messageInput.value = '';
      await getAllMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  }

  // Edit an existing message
  async function editMessage(id, content) {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ content })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to edit message');
      }

      editMessageModal.hide();
      await getAllMessages();
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Error editing message: ' + error.message);
    }
  }

  // Delete a message by ID
  async function deleteMessage(id) {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete message');
      }

      allMessages = allMessages.filter(m => m.id !== parseInt(id));
      const msgEl = document.querySelector(`.message-item[data-id="${id}"]`);
      if (msgEl) msgEl.remove();

      displayMessages(allMessages);

      deleteConfirmModal.hide();

      clearErrorMessage(); // נקה הודעות שגיאה קיימות אחרי הצלחה
    } catch (error) {
      console.error('Error deleting message:', error);
      showErrorMessage('Error deleting message: ' + error.message);
    }
  }
  function showErrorMessage(msg) {
    const errorEl = document.getElementById('error-message');
    if (!errorEl) return;

    errorEl.textContent = msg;
    errorEl.classList.remove('d-none');
  }
  function clearErrorMessage() {
    const errorEl = document.getElementById('error-message');
    if (!errorEl) return;

    errorEl.textContent = '';
    errorEl.classList.add('d-none');
  }
  // Search messages
  async function searchMessages(term) {
    try {
      isSearchActive = true;
      const res = await fetch(`/api/messages/search?term=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error('Failed to search messages');

      const data = await res.json();

      if (data.data && data.data.messages && data.data.messages.length > 0) {
        const sorted = [...data.data.messages].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        displayMessages(sorted);
      } else {
        messagesContainer.innerHTML = `
          <div class="text-center p-5">
            <p class="mb-0">No messages found matching "${term}"</p>
            <button id="back-to-chat" class="btn btn-primary mt-3">Back to Chat</button>
          </div>
        `;

        const backBtn = document.getElementById('back-to-chat');
        if (backBtn) {
          backBtn.addEventListener('click', () => clearSearch());
        }
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      alert('Error searching messages: ' + error.message);
    }
  }

  // Clear search mode
  function clearSearch() {
    isSearchActive = false;
    searchInput.value = '';
    displayMessages(allMessages);
  }

  // Event listeners

  // Send message on button click
  if (sendButton) {
    sendButton.addEventListener('click', () => {
      const content = messageInput.value.trim();
      if (content) sendMessage(content);
    });
  }

  // Send message on Enter key in input
  if (messageInput) {
    messageInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (content) sendMessage(content);
      }
    });
  }

  // Save edited message
  if (saveEditButton) {
    saveEditButton.addEventListener('click', () => {
      const id = editMessageId.value;
      const content = editMessageContent.value.trim();

      if (!content) {
        alert('Message cannot be empty');
        return;
      }

      editMessage(id, content);
    });
  }

  // Search button
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', e => {
      e.preventDefault();
      const term = searchInput.value.trim();
      if (term) searchMessages(term);
      else clearSearch();
    });
  }

  // Clear search button
  if (clearSearchButton) {
    clearSearchButton.addEventListener('click', e => {
      e.preventDefault();
      clearSearch();
    });
  }

  // Clear search if input emptied
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (this.value.trim() === '' && isSearchActive) clearSearch();
    });
  }

  // Logout button (if exists)
  if (logoutButton) {
    logoutButton.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = '/logout';
    });
  }

  // Confirm delete modal button
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      const id = deleteMessageIdInput.value;
      if (id) deleteMessage(id);
    });
  }

  // Initial load
  getAllMessages();
  getMessages();
});
