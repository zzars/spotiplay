lucide.createIcons();

async function reqlagu(title) {
    const a = await fetch("/getmusicdata?title=" + encodeURIComponent(title));
    return a.json();
}

const detail = document.getElementById("detail");
const coverImage = document.getElementById("cover");
const titleMusic = document.getElementById("title");
const artist = document.getElementById("artist");
const playBtn = document.getElementById("playBtn");
const input = document.getElementById("inp");
const sendBtn = document.getElementById("sendBtn");
const downBtn = document.getElementById("downBtn");
const modeBtn = document.getElementById("modeBtn");

let nowUrl = null;
const audio = new Audio();
let isPlaying = false;
let isLoading = false;
let loopMode = false;

audio.oncanplay = null;

function ddownload(url, name) {
  const d = document.createElement("a");
  d.href = url;
  d.download = name;
  document.body.appendChild(d);
  d.click();
  d.remove();
}

function loading() {
  isLoading = true;
  playBtn.disabled = true;
  detail.style.display = "none";
  sendBtn.innerHTML = `<i data-lucide="loader"></i>`
  lucide.createIcons()
}

function play() {
  if (!audio.src) return;
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = `<i data-lucide="circle-pause"></i>`
  lucide.createIcons()
}

function pause() {
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = `<i data-lucide="circle-play"></i>`
  lucide.createIcons()
}

modeBtn.addEventListener("click", () => {
    loopMode = !loopMode;
    modeBtn.style.background = loopMode ? "white" : "none";
    modeBtn.style.color = loopMode ? "black" : "white";
})

playBtn.addEventListener("click", () => {
  if (isPlaying) {
    pause();
  } else {
    play();
  };
})

downBtn.addEventListener("click", () => {
  ddownload(nowUrl, `${titleMusic.textContent}.mp3`)
})

sendBtn.addEventListener("click", async () => {
  if (isLoading) return;
  
  const val = input.value;
  if (!val) return;
  loading()
  const data = await reqlagu(val);
  if (data.success) {
    coverImage.src = data.cover;
    titleMusic.textContent = data.title;
    artist.textContent = data.artist;
    audio.pause()
    nowUrl = data.download_url;
    detail.style.display = "block";
    audio.src = nowUrl;
    audio.oncanplay = () => play();
    audio.load();
    isLoading = false;
    playBtn.disabled = false;
    input.value = "";
    sendBtn.innerHTML = `<i data-lucide="disc-3"></i>`
    lucide.createIcons()
  } else {
    isLoading = false;
    playBtn.disabled = false;
    sendBtn.innerHTML = `<i data-lucide="disc-3"></i>`
    lucide.createIcons()
  }
});

audio.addEventListener("ended", () => {
    if (loopMode) {
        audio.currentTime = 0;
        audio.play();
    } else {
        isPlaying = false;
        playBtn.innerHTML = `<i data-lucide="circle-play"></i>`;
        lucide.createIcons();
})
