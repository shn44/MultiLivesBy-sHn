const parentDomain = "shn44.github.io"; // Substitua pelo seu domínio (ex: shn44.github.io)

// Alternar entre modo escuro e claro
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Verifica o tema salvo no localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.setAttribute("data-theme", savedTheme);
  themeToggle.textContent =
    savedTheme === "dark" ? "Modo Claro" : "Modo Escuro";
}

themeToggle.addEventListener("click", () => {
  if (body.getAttribute("data-theme") === "dark") {
    body.setAttribute("data-theme", "light");
    themeToggle.textContent = "Modo Escuro";
    localStorage.setItem("theme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    themeToggle.textContent = "Modo Claro";
    localStorage.setItem("theme", "dark");
  }
});

// Adicionar streams ao clicar no botão ou pressionar Enter
document.getElementById("add-stream").addEventListener("click", addStream);

document
  .getElementById("stream-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addStream();
    }
  });

function addStream() {
  const streamInput = document.getElementById("stream-input").value.trim();
  if (streamInput) {
    const streamType = getStreamType(streamInput);
    if (streamType === "twitch") {
      addTwitchStream(streamInput);
    } else if (streamType === "youtube") {
      addYouTubeStream(streamInput);
    } else {
      alert("URL inválido. Insira um link do Twitch ou YouTube.");
    }
    document.getElementById("stream-input").value = ""; // Limpa o campo de entrada
  }
}

function getStreamType(input) {
  if (input.includes("twitch.tv") || !input.includes("/")) {
    return "twitch";
  } else if (input.includes("youtube.com") || input.includes("youtu.be")) {
    return "youtube";
  }
  return null;
}

function addTwitchStream(input) {
  const channelName = extractTwitchChannel(input);
  if (!channelName) {
    alert("Nome do canal ou URL do Twitch inválido.");
    return;
  }

  const existingStreams = document.querySelectorAll(".stream iframe");
  for (const stream of existingStreams) {
    if (stream.src.includes(channelName)) {
      alert("Este canal já foi adicionado!");
      return;
    }
  }

  const streamContainer = document.createElement("div");
  streamContainer.classList.add("stream");

  const iframe = document.createElement("iframe");
  iframe.src = `https://player.twitch.tv/?channel=${channelName}&parent=${parentDomain}`;
  iframe.allowFullscreen = true;

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-stream");
  removeButton.innerHTML = "&times;";
  removeButton.addEventListener("click", () => {
    streamContainer.remove();
  });

  streamContainer.appendChild(iframe);
  streamContainer.appendChild(removeButton);
  document.querySelector(".streams-container").appendChild(streamContainer);
}

function addYouTubeStream(url) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    alert("URL do YouTube inválido.");
    return;
  }

  const existingStreams = document.querySelectorAll(".stream iframe");
  for (const stream of existingStreams) {
    if (stream.src.includes(videoId)) {
      alert("Este vídeo já foi adicionado!");
      return;
    }
  }

  const streamContainer = document.createElement("div");
  streamContainer.classList.add("stream");

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`; // Autoplay e mute
  iframe.allow = "autoplay; encrypted-media"; // Permissão para autoplay
  iframe.allowFullscreen = true;

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-stream");
  removeButton.innerHTML = "&times;";
  removeButton.addEventListener("click", () => {
    streamContainer.remove();
  });

  streamContainer.appendChild(iframe);
  streamContainer.appendChild(removeButton);
  document.querySelector(".streams-container").appendChild(streamContainer);
}

function extractTwitchChannel(input) {
  // Se for um URL, extrai o nome do canal
  if (input.includes("twitch.tv")) {
    const match = input.match(/twitch.tv\/([^\/\?]+)/);
    return match ? match[1] : null;
  }
  // Se for um username/NICK, retorna o próprio valor
  return input;
}

function extractYouTubeVideoId(url) {
  const match = url.match(/v=([^&]+)/) || url.match(/youtu.be\/([^\/\?]+)/);
  return match ? match[1] : null;
}
