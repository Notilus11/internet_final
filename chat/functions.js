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
const roomName = document.getElementById("room-name");
const userList = document.getElementById("userList");
const userListContainer = document.getElementById("userListContainer");
const backButton = document.getElementById("back-button");
const sendButton = document.getElementById("send-button");
const newRoom = document.getElementById("create-room");
const newRoomNameInput = document.getElementById("new-room-name");
const messageInput = document.getElementById("message-input");

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
  console.log("Received message:", msg);
  if (msg.type === "user-list") {
    updateUserList(msg.users);
  } else if (msg.type === "message") {
    addMessage(msg.data);
  } else if (msg.type === "history") {
    msg.data.forEach(addMessage);
  } else if (msg.type === "new-room") {
    addRoomButton(msg.room);
  }
};

ws.onclose = () => {
  console.log("Disconnected from the server");
};

function createNewUser() {
  username = usernameInput.value.trim() || "Anonymous";
  usernameOverlay.style.display = "none";

  ws.send(JSON.stringify({ type: "new-user", username }));
  roomSelection.style.display = "block";
}

function addRoomButton(roomNameVar) {
  const roomButton = document.createElement("button");
  roomButton.textContent = roomNameVar;
  roomButton.className =
    "bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300";
  roomButton.addEventListener("click", () => joinRoom(roomNameVar));
  roomList.appendChild(roomButton);
}

function joinRoom(room) {
  currentRoom = room;
  roomSelection.style.display = "none";
  chatContainer.style.display = "block";
  userListContainer.style.display = "block";
  roomName.textContent = `Room: ${room}`;

  ws.send(JSON.stringify({ type: "join-room", room }));
}

function createRoom() {
  const newRoomName = newRoomNameInput.value.trim();
  if (newRoomName !== "") {
    ws.send(JSON.stringify({ type: "create-room", room: newRoomName }));
    newRoomNameInput.value = "";
  }
}

function leaveRoom() {
  ws.send(JSON.stringify({ type: "leave-room", room: currentRoom }));
  currentRoom = null;
  chatContainer.style.display = "none";
  roomSelection.style.display = "block";
  userListContainer.style.display = "none";
  chatBox.innerHTML = "";
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
  messageElement.className = `flex ${
    isCurrentUser ? "justify-end" : "justify-start"
  } p-3 border-b border-gray-300`; 

  const messageContent = document.createElement("div");
  messageContent.className =
    "flex flex-col max-w-[45%] min-w-[20%] p-2 break-words";

  const messageHeader = document.createElement("strong");
  messageHeader.className = "text-sm font-semibold"; 
  messageHeader.textContent = msg.username;

  const messageText = document.createElement("span");
  messageText.className = "text-base mt-1 break-words";
  messageText.textContent = msg.text;

  const messageTime = document.createElement("span");
  messageTime.className = "text-xs italic mt-2 self-end";
  messageTime.textContent = formatTimestamp(msg.time);

  messageContent.appendChild(messageHeader);
  messageContent.appendChild(messageText);
  messageContent.appendChild(messageTime);

  if (isCurrentUser) {
    messageContent.className += " bg-blue-500 text-white rounded-lg";
    messageHeader.className += " text-white";
    messageText.className += " text-white";
    messageTime.className += " text-white";
  } else {
    messageContent.className += " bg-gray-200 text-black rounded-lg"; 
    messageHeader.className += " text-gray-700";
    messageText.className += " text-gray-800";
    messageTime.className += " text-gray-500";
  }

  messageElement.appendChild(messageContent);
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString(undefined, options).replace(',', '');
}

function updateUserList(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.className = "flex items-center space-x-4 p-2 bg-white border rounded-lg shadow-sm";
    const userIcon = document.createElement("div");
    userIcon.className = "w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full";
    const userInitial = document.createElement("span");
    userInitial.className = "font-bold";
    userInitial.textContent = user.charAt(0).toUpperCase();
    userIcon.appendChild(userInitial);
    const userName = document.createElement("span");
    userName.className = "text-gray-800 font-medium";
    userName.textContent = user;
    userItem.appendChild(userIcon);
    userItem.appendChild(userName);
    userList.appendChild(userItem);
  });
}