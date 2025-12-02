// Important variables for every user
let username = "Anonymous";
let currentRoom = null;
// Connection to the Webserver
const ws = new WebSocket("ws://" + window.location.hostname + ":8081");

// Get all elements
const usernameOverlay = document.getElementById("username-overlay");
const usernameInput = document.getElementById("username-input");
const usernameSubmit = document.getElementById("username-submit");
const roomList = document.getElementById("room-list");
const roomSelection = document.getElementById("room-selection");
const chatContainer = document.getElementById("container");
const chatBox = document.getElementById("chat-box");
const roomNameLabel = document.getElementById("room-name");
const userList = document.getElementById("userList");
const backButton = document.getElementById("back-button");
const sendButton = document.getElementById("send-button");
const newRoom = document.getElementById("create-room");
const newRoomNameInput = document.getElementById("new-room-name");
const messageInput = document.getElementById("message-input");

// Focus input on load
window.onload = () => {
    usernameInput.focus();
};

// User sets username via button
usernameSubmit.addEventListener("click", () => {
  createNewUser();
});

// User sets username via Enter key
usernameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    createNewUser();
  }
});

// Event Listeners
backButton.addEventListener("click", leaveRoom);

newRoom.addEventListener("click", createRoom);
newRoomNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    createRoom();
  }
});

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Websocket Events
ws.onopen = () => {
  console.log("Connected to server");
};

ws.onmessage = function (event) {
  const msg = JSON.parse(event.data);
  // console.log("Received message:", msg);
  if (msg.type === "user-list") {
    updateUserList(msg.users);
  } else if (msg.type === "message") {
    addMessage(msg.data);
  } else if (msg.type === "history") {
    chatBox.innerHTML = ''; // Clear chat box before loading history
    msg.data.forEach(addMessage);
  } else if (msg.type === "new-room") {
    addRoomButton(msg.room);
  }
};

ws.onclose = () => {
  console.log("Disconnected from the server");
  // Optional: Disable inputs if disconnected
};

function createNewUser() {
  const inputVal = usernameInput.value.trim();
  if (!inputVal) return;
  
  username = inputVal;
  usernameOverlay.style.display = "none";

  ws.send(JSON.stringify({ type: "new-user", username }));
  roomSelection.classList.remove("hidden");
}

function addRoomButton(roomNameVar) {
  // Check if button already exists to prevent duplicates
  const existingBtns = document.querySelectorAll('.room-btn');
  for(let btn of existingBtns) {
      if(btn.textContent === roomNameVar) return;
  }

  const roomButton = document.createElement("button");
  roomButton.textContent = roomNameVar;
  // UPDATED: Using CSS class 'room-btn' instead of Tailwind
  roomButton.className = "room-btn";
  roomButton.addEventListener("click", () => joinRoom(roomNameVar));
  roomList.appendChild(roomButton);
}

function joinRoom(room) {
  currentRoom = room;
  
  // Toggle views
  roomSelection.classList.add("hidden");
  chatContainer.classList.remove("hidden");
  
  roomNameLabel.textContent = `Room: ${room}`;
  messageInput.focus();

  ws.send(JSON.stringify({ type: "join-room", room }));
}

function createRoom() {
  const newRoomName = newRoomNameInput.value.trim();
  if (newRoomName !== "") {
    ws.send(JSON.stringify({ type: "create-room", room: newRoomName }));
    newRoomNameInput.value = "";
    // Auto join created room? For now just create it.
  }
}

function leaveRoom() {
  ws.send(JSON.stringify({ type: "leave-room", room: currentRoom }));
  currentRoom = null;
  
  chatContainer.classList.add("hidden");
  roomSelection.classList.remove("hidden");
  
  chatBox.innerHTML = "";
  userList.innerHTML = "";
}

function sendMessage() {
  const messageText = messageInput.value.trim();
  if (messageText !== "") {
    const messageData = {
      type: "message",
      username,
      text: messageText,
      time: new Date().toISOString(),
      room: currentRoom,
    };
    ws.send(JSON.stringify(messageData));
    messageInput.value = "";
  }
}

function addMessage(msg) {
  const messageElement = document.createElement("div");
  const isCurrentUser = msg.username === username;
  
  // UPDATED: Semantic Classes 'message', 'self'/'other'
  messageElement.className = `message ${isCurrentUser ? "self" : "other"}`;

  const headerDiv = document.createElement("div");
  headerDiv.className = "msg-header";

  const authorSpan = document.createElement("span");
  authorSpan.className = "msg-author";
  authorSpan.textContent = isCurrentUser ? "You" : msg.username;

  const timeSpan = document.createElement("span");
  timeSpan.className = "msg-time";
  timeSpan.textContent = formatTimestamp(msg.time);

  headerDiv.appendChild(authorSpan);
  headerDiv.appendChild(timeSpan);

  const textDiv = document.createElement("div");
  textDiv.className = "msg-text";
  textDiv.textContent = msg.text;

  messageElement.appendChild(headerDiv);
  messageElement.appendChild(textDiv);

  chatBox.appendChild(messageElement);
  
  // Scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function updateUserList(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.className = "user-item";
    
    const userIcon = document.createElement("div");
    userIcon.className = "user-avatar";
    userIcon.textContent = user.charAt(0).toUpperCase();
    
    const userNameSpan = document.createElement("span");
    userNameSpan.textContent = user;
    
    userItem.appendChild(userIcon);
    userItem.appendChild(userNameSpan);
    userList.appendChild(userItem);
  });
}