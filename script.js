const toggleThemeButton = document.getElementById('toggleTheme');
const processButton = document.getElementById('processLogs');
const clearAllButton = document.getElementById('clearAll');
const inputArea = document.getElementById('logInput');
const outputArea = document.getElementById('linkOutput');

const IMAGE_REGEX = /(\b|=)\d{4}_.*?image.*?\.png\b/g
const URL_PREFIX = "http://papasubstr001.recondo.vci/";

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  toggleThemeButton.innerText = newTheme === 'light' ? '☀️' : '🌙';
  localStorage.setItem('theme', newTheme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  toggleThemeButton.innerText = savedTheme === 'light' ? '☀️' : '🌙';
}

function showError(message) {
  const errorBubble = document.createElement('div');
  errorBubble.className = 'error-bubble';
  errorBubble.innerText = message;
  inputArea.parentElement.appendChild(errorBubble);

  setTimeout(() => {
    errorBubble.style.opacity = '0';
    setTimeout(() => errorBubble.remove(), 500);
  }, 3000);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showError('Link copied to clipboard!');
  }).catch(() => {
    showError('Failed to copy link.');
  });
}

function processLogs() {
  const logs = inputArea.value.split('\n');
  let linksFound = [];

  logs.forEach(line => {
    const imageMatches = line.match(IMAGE_REGEX);

    if (imageMatches) {
      imageMatches.forEach(imageName => {
        const formattedImageName = imageName.replace(/_/g, '/');
        const fullURL = `${URL_PREFIX}${formattedImageName}`;
        linksFound.push(fullURL);
      });
    }
  });

  if (linksFound.length > 0) {
    const logGroup = document.createElement('div');
    logGroup.className = 'log-group';

    linksFound.forEach((fullURL, index) => {
      const linkWrapper = document.createElement('div');
      linkWrapper.style.display = 'flex';
      linkWrapper.style.alignItems = 'center';
      linkWrapper.style.justifyContent = 'space-between';

      const link = document.createElement('a');
      link.href = fullURL;
      link.innerText = fullURL;
      link.target = '_blank';

      const copyButton = document.createElement('button');
      copyButton.className = 'copy-btn';
      copyButton.innerText = '📋';
      copyButton.onclick = () => copyToClipboard(fullURL);

      linkWrapper.appendChild(link);
      linkWrapper.appendChild(copyButton);
      logGroup.appendChild(linkWrapper);

      if (index < linksFound.length - 1) {
        const divider = document.createElement('div');
        divider.className = 'link-divider';
        logGroup.appendChild(divider);
      }
    });

    outputArea.prepend(logGroup);
  } else {
    showError('No valid URLs found in the logs.');
  }

  inputArea.value = '';
}

function clearAllLinks() {
  outputArea.innerHTML = '';
}

processButton.addEventListener('click', processLogs);
clearAllButton.addEventListener('click', clearAllLinks);
toggleThemeButton.addEventListener('click', toggleTheme);

window.addEventListener('DOMContentLoaded', loadTheme);
