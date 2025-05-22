document.addEventListener('DOMContentLoaded', function() {
  const messagesContainer = document.getElementById('messages-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-message');
  const editMessageModal = new bootstrap.Modal(document.getElementById('editMessageModal'));
  const editMessageId = document.getElementById('edit-message-id');
  const editMessageContent = document.getElementById('edit-message-content');
  const saveEditButton = document.getElementById('save-edit-message');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-btn');
  const logoutButton = document.getElementById('logout-btn');
  const clearSearchButton = document.getElementById('clear-search-btn');

  let lastUpdate = Date.now();
  let isPolling = true;

  let allMessages = []; // Store all messages to restore after search
  let isSearchActive = false;

  // Function to create a message element
  function createMessageElement(message) {
    const isOwnMessage = message.senderId === userId;

    const messageItem = document.createElement('div');
    messageItem.className = `message-item card mb-2 ${isOwnMessage ? 'border-primary' : ''}`;
    messageItem.dataset.id = message.id;

    // Create message content
    messageItem.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="card-subtitle text-muted">
            ${message.sender.firstName} ${message.sender.lastName}
          </h6>
          <small class="text-muted">${new Date(message.createdAt).toLocaleString()}</small>
        </div>
        <p class="card-text message-content">${message.content}</p>
        
        ${isOwnMessage ? `
          <div class="message-actions mt-2 text-end">
            <button class="btn btn-sm btn-outline-primary edit-message-btn">Edit</button>
            <button class="btn btn-sm btn-outline-danger delete-message-btn">Delete</button>
          </div>
        ` : ''}
      </div>
    `;

    // Add event listeners to action buttons if it's the user's message
    if (isOwnMessage) {
      // Edit button
      messageItem.querySelector('.edit-message-btn').addEventListener('click', function() {
        editMessageId.value = message.id;
        editMessageContent.value = message.content;
        editMessageModal.show();
      });

      // Delete button
      messageItem.querySelector('.delete-message-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this message?')) {
          deleteMessage(message.id);
        }
      });
    }

    return messageItem;
  }

  // Function to send a message
  async function sendMessage(content) {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      // Clear input after successful send
      messageInput.value = '';

      // Update messages immediately
      getMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  }

  // Function to edit a message
  async function editMessage(id, content) {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to edit message');
      }

      // Close modal after successful edit
      editMessageModal.hide();

      // Update messages
      getMessages();
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Error editing message: ' + error.message);
    }
  }

  // Function to delete a message
  async function deleteMessage(id) {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete message');
      }

      // Also remove from allMessages array
      allMessages = allMessages.filter(message => message.id !== parseInt(id));

      // Remove message from DOM
      const messageElement = document.querySelector(`.message-item[data-id="${id}"]`);
      if (messageElement) {
        messageElement.remove();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message: ' + error.message);
    }
  }

  // Function to display all messages
  function displayMessages(messages) {
    messagesContainer.innerHTML = '';

    if (messages && messages.length > 0) {
      const fragment = document.createDocumentFragment();

      // Sort messages by creation date (newest first)
      const sortedMessages = [...messages].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      sortedMessages.forEach(message => {
        const messageElement = createMessageElement(message);
        fragment.appendChild(messageElement);
      });

      messagesContainer.appendChild(fragment);
    } else {
      messagesContainer.innerHTML = `
        <div class="text-center p-5">
          <p class="mb-0">No messages yet. Be the first to send a message!</p>
        </div>
      `;
    }
  }

  // Function to get all messages
  async function getAllMessages() {
    try {
      const response = await fetch('/api/messages/all');

      if (!response.ok) {
        throw new Error('Failed to fetch all messages');
      }

      const data = await response.json();

      if (data.data && data.data.messages) {
        allMessages = data.data.messages;

        // Only display all messages if not in search mode
        if (!isSearchActive) {
          displayMessages(allMessages);
        }
      }
    } catch (error) {
      console.error('Error fetching all messages:', error);
    }
  }

  // Function to get new messages (polling)
  async function getMessages() {
    if (!isPolling) return;

    try {
      const response = await fetch(`/api/messages?lastUpdate=${lastUpdate}`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      if (data.data.messages && data.data.messages.length > 0) {
        // Update timestamp
        lastUpdate = data.data.timestamp;

        let hasNewMessages = false;

        // Update allMessages
        data.data.messages.forEach(newMessage => {
          // Check if message already exists in allMessages
          const existingIndex = allMessages.findIndex(msg => msg.id === newMessage.id);

          if (existingIndex !== -1) {
            // Update existing message
            allMessages[existingIndex] = newMessage;
          } else {
            // Add new message
            allMessages.push(newMessage);
            hasNewMessages = true;
          }
        });

        // Only update display if not in search mode
        if (!isSearchActive) {
          displayMessages(allMessages);

          // If there are new messages, scroll to top to show them
          if (hasNewMessages && messagesContainer.scrollTo) {
            messagesContainer.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }

    // Continue polling
    setTimeout(getMessages, POLLING_INTERVAL);
  }

  // Function to search messages
  async function searchMessages(term) {
    try {
      isSearchActive = true;

      const response = await fetch(`/api/messages/search?term=${encodeURIComponent(term)}`);

      if (!response.ok) {
        throw new Error('Failed to search messages');
      }

      const data = await response.json();

      // Display search results
      if (data.data.messages && data.data.messages.length > 0) {
        // Sort search results by creation date (newest first)
        const sortedMessages = [...data.data.messages].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        displayMessages(sortedMessages);
      } else {
        // No results found
        messagesContainer.innerHTML = `
          <div class="text-center p-5">
            <p class="mb-0">No messages found matching "${term}"</p>
            <button id="back-to-chat" class="btn btn-primary mt-3">Back to Chat</button>
          </div>
        `;

        // Add event listener to the "Back to Chat" button
        const backButton = document.getElementById('back-to-chat');
        if (backButton) {
          backButton.addEventListener('click', function() {
            clearSearch();
          });
        }
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      alert('Error searching messages: ' + error.message);
    }
  }

  // Function to clear search and display all messages
  function clearSearch() {
    isSearchActive = false;
    searchInput.value = '';
    displayMessages(allMessages);
  }

  // Event listener for send button
  if (sendButton) {
    sendButton.addEventListener('click', function() {
      const content = messageInput.value.trim();
      if (content) {
        sendMessage(content);
      }
    });
  }

  // Event listener for pressing Enter in message input
  if (messageInput) {
    messageInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const content = messageInput.value.trim();
        if (content) {
          sendMessage(content);
        }
      }
    });
  }

  // Event listener for save edit button
  if (saveEditButton) {
    saveEditButton.addEventListener('click', function() {
      const id = editMessageId.value;
      const content = editMessageContent.value.trim();

      if (content) {
        editMessage(id, content);
      } else {
        alert('Message cannot be empty');
      }
    });
  }

  // Event listener for search
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', function(event) {
      event.preventDefault();
      const term = searchInput.value.trim();

      if (term) {
        searchMessages(term);
      } else {
        clearSearch();
      }
    });
  }

  // Event listener for clear search button
  if (clearSearchButton) {
    clearSearchButton.addEventListener('click', function(event) {
      event.preventDefault();
      clearSearch();
    });
  }

  // Event listener for search input - clear search when emptied
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (this.value.trim() === '' && isSearchActive) {
        clearSearch();
      }
    });
  }

  // Event listener for logout (For commit)
  if (logoutButton) {
    logoutButton.addEventListener('click', function(event) {
      event.preventDefault();
      window.location.href = '/logout';
    });
  }

  // Initial loading of all messages
  getAllMessages();

  // Start polling for new messages
  getMessages();
});