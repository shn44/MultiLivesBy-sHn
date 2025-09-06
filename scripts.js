const parentDomain = "shn44.github.io";

const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const chatToggle = document.getElementById("toggle-chats");
const dragToggle = document.getElementById("drag-mode-toggle");
const streamsWrap = document.querySelector(".streams-container");
const chatContainer = document.querySelector(".chat-container");
const chatTabs = document.querySelector(".chat-tabs");
const chatFrame = document.querySelector(".chat-frame");

let chats = {};
let streamCount = 0;
let zCounter = 1;

let isDragging = false;
let dragTarget = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

let isResizing = false;
let resizeTarget = null;
let resizeDir = null;
let startX = 0,
  startY = 0,
  startW = 0,
  startH = 0,
  startL = 0,
  startT = 0;

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.setAttribute("data-theme", savedTheme);
  themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
}
themeToggle.addEventListener("click", () => {
  if (body.getAttribute("data-theme") === "dark") {
    body.setAttribute("data-theme", "light");
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  }
});

if (chatToggle) {
  chatToggle.addEventListener("click", () => {
    if (chatContainer) chatContainer.classList.toggle("hidden");
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Alt") body.classList.add("drag-mode");
});
document.addEventListener("keyup", (e) => {
  if (e.key === "Alt") body.classList.remove("drag-mode");
});
if (dragToggle) {
  dragToggle.addEventListener("click", () => {
    body.classList.toggle("drag-mode");
    dragToggle.classList.toggle("active");
  });
}

document.getElementById("add-stream").addEventListener("click", addStream);
document.getElementById("stream-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addStream();
});

function addStream() {
  const streamInput = document.getElementById("stream-input").value.trim();
  if (!streamInput) return;
  const streamType = getStreamType(streamInput);
  if (streamType === "twitch") addTwitchStream(streamInput);
  else if (streamType === "youtube") addYouTubeStream(streamInput);
  else if (streamType === "kick") addKickStream(streamInput);
  else alert("URL inválido.");
  document.getElementById("stream-input").value = "";
}

function getStreamType(input) {
  if (input.includes("twitch.tv") || !input.includes("/")) return "twitch";
  if (input.includes("youtube.com") || input.includes("youtu.be"))
    return "youtube";
  if (input.includes("kick.com")) return "kick";
  return null;
}

function addChat(type, id, label) {
  const chatId = `${type}-${id}`;
  if (chats[chatId]) return;
  let src = "";
  if (type === "twitch")
    src = `https://www.twitch.tv/embed/${id}/chat?parent=${parentDomain}`;
  else if (type === "youtube")
    src = `https://www.youtube.com/live_chat?v=${id}&embed_domain=${parentDomain}`;
  else if (type === "kick") src = `https://kick.com/${id}/chatroom`;
  chats[chatId] = src;

  const tab = document.createElement("button");
  tab.textContent = label;
  tab.dataset.chat = chatId;
  tab.addEventListener("click", () => loadChat(chatId));
  if (chatTabs) chatTabs.appendChild(tab);

  if (Object.keys(chats).length === 1) loadChat(chatId);
}

function loadChat(chatId) {
  if (!chatFrame) return;
  chatFrame.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = chats[chatId];
  iframe.allowFullscreen = true;
  chatFrame.appendChild(iframe);
  document
    .querySelectorAll(".chat-tabs button")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.chat === chatId)
    );
}

function createStream(src, type, id, label) {
  const streamContainer = document.createElement("div");
  streamContainer.classList.add("stream");

  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.allow = "autoplay; encrypted-media";
  iframe.allowFullscreen = true;

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-stream");
  removeButton.textContent = "✖";
  removeButton.addEventListener("click", () => streamContainer.remove());

  const dragOverlay = document.createElement("div");
  dragOverlay.className = "drag-overlay";

  const dirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
  dirs.forEach((dir) => {
    const h = document.createElement("div");
    h.className = `handle ${dir}`;
    h.dataset.dir = dir;
    streamContainer.appendChild(h);
  });

  streamContainer.appendChild(iframe);
  streamContainer.appendChild(dragOverlay);
  streamContainer.appendChild(removeButton);
  streamsWrap.appendChild(streamContainer);

  const initW = 420,
    initH = 236;
  streamContainer.style.width = initW + "px";
  streamContainer.style.height = initH + "px";
  const maxL = Math.max(20, streamsWrap.clientWidth - initW - 20);
  const maxT = Math.max(20, streamsWrap.clientHeight - initH - 20);
  const left = Math.min(20 + streamCount * 30, maxL);
  const top = Math.min(20 + streamCount * 30, maxT);
  streamContainer.style.left = left + "px";
  streamContainer.style.top = top + "px";
  streamContainer.style.zIndex = ++zCounter;

  bindDrag(streamContainer, dragOverlay);
  bindResize(streamContainer);

  addChat(type, id, label);
  streamCount++;
}

function bindDrag(el, overlay) {
  overlay.addEventListener("mousedown", (e) => {
    if (!body.classList.contains("drag-mode")) return;
    isDragging = true;
    dragTarget = el;
    dragTarget.style.zIndex = ++zCounter;
    const rect = el.getBoundingClientRect();

    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
  });
}

function bindResize(el) {
  el.querySelectorAll(".handle").forEach((h) => {
    h.addEventListener("mousedown", (e) => {
      isResizing = true;
      resizeTarget = el;
      resizeDir = h.dataset.dir;
      const rect = el.getBoundingClientRect();
      const containerRect = streamsWrap.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startW = rect.width;
      startH = rect.height;
      startL = rect.left - containerRect.left;
      startT = rect.top - containerRect.top;
      resizeTarget.style.zIndex = ++zCounter;
      e.preventDefault();
      e.stopPropagation();
    });
  });
}

document.addEventListener("mousemove", (e) => {
  if (isDragging && dragTarget) {
    const containerRect = streamsWrap.getBoundingClientRect();
    let newLeft = e.clientX - containerRect.left - dragOffsetX;
    let newTop = e.clientY - containerRect.top - dragOffsetY;
    newLeft = newLeft;
    newTop = newTop;
    dragTarget.style.left = newLeft + "px";
    dragTarget.style.top = newTop + "px";
  } else if (isResizing && resizeTarget) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newW = startW;
    let newH = startH;
    let newL = startL;
    let newT = startT;
    const minW = 200,
      minH = 150;

    if (resizeDir.includes("e")) newW = Math.max(minW, startW + dx);
    if (resizeDir.includes("s")) newH = Math.max(minH, startH + dy);
    if (resizeDir.includes("w")) {
      newW = Math.max(minW, startW - dx);
      newL = startL + dx;
      if (newW === minW) newL = startL + (startW - minW);
    }
    if (resizeDir.includes("n")) {
      newH = Math.max(minH, startH - dy);
      newT = startT + dy;
      if (newH === minH) newT = startT + (startH - minH);
    }

    newL = newL;
    newT = newT;

    resizeTarget.style.width = newW + "px";
    resizeTarget.style.height = newH + "px";
    resizeTarget.style.left = newL + "px";
    resizeTarget.style.top = newT + "px";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  dragTarget = null;
  isResizing = false;
  resizeTarget = null;
  resizeDir = null;
});

function isDuplicate(id) {
  const existing = document.querySelectorAll(".stream iframe");
  for (const s of existing) if (s.src.includes(id)) return true;
  return false;
}

function addTwitchStream(input) {
  const channelName = extractTwitchChannel(input);
  if (!channelName) return alert("Nome inválido.");
  if (isDuplicate(channelName)) return alert("Este canal já foi adicionado!");
  createStream(
    `https://player.twitch.tv/?channel=${channelName}&parent=${parentDomain}`,
    "twitch",
    channelName,
    channelName
  );
}

function addYouTubeStream(url) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return alert("URL inválido.");
  if (isDuplicate(videoId)) return alert("Este vídeo já foi adicionado!");
  createStream(
    `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`,
    "youtube",
    videoId,
    "YouTube"
  );
}

function addKickStream(input) {
  const username = extractKickUsername(input);
  if (!username) return alert("Usuário inválido.");
  if (isDuplicate(username)) return alert("Este canal já foi adicionado!");
  createStream(
    `https://player.kick.com/${username}`,
    "kick",
    username,
    username
  );
}

function extractTwitchChannel(input) {
  if (input.includes("twitch.tv")) {
    const m = input.match(/twitch.tv\/([^\/\?]+)/);
    return m ? m[1] : null;
  }
  return input;
}

function extractYouTubeVideoId(url) {
  const m = url.match(/v=([^&]+)/) || url.match(/youtu.be\/([^\/\?]+)/);
  return m ? m[1] : null;
}

function extractKickUsername(input) {
  if (input.includes("kick.com")) {
    const m = input.match(/kick\.com\/([^\/\?]+)/);
    return m ? m[1] : null;
  }
  return input;
}
