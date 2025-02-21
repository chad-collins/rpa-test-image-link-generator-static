const IMAGE_REGEX = /\b\d{4}_.*?image.*?\.png\b/g;
const URL_PREFIX = "http://papasubstr001.recondo.vci/";

// ===== ICON LINKS (LOCAL) WITH UPDATED ATTRIBUTIONS =====
const ICONS = {
    copy: './assets/icons/layers.png',
    daylight: './assets/icons/badge.png',
    nightMode: './assets/icons/moon.png',
    download: './assets/icons/download.png'
};

let submitBtnTimeout; // Global timeout for submit button messages

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    buildAppLayout();
    setupThemeToggle();
    loadSavedGroups();
    toggleResultsVisibility();
});

// ================== BUILD LAYOUT ===================
function buildAppLayout() {
    const appContainer = createElement('div', 'app-container');

    const header = createHeader();
    const main = createMain();
    const footer = createElement('footer', 'app-footer');

    appContainer.append(header, main, footer);
    document.body.appendChild(appContainer);
}

function createHeader() {
    const header = createElement('header', 'app-header');

    const title = createElement('h1');
    title.textContent = 'Substantiation Link Generator';

    const themeToggle = createElement('button', 'theme-toggle', { id: 'themeToggle', title: 'Toggle Light/Dark Mode' });
    const themeIcon = createIcon(ICONS.nightMode, 'Toggle Theme', 24);

    themeToggle.appendChild(themeIcon);
    themeToggle.addEventListener('click', toggleTheme);

    header.append(title, themeToggle);
    return header;
}

function createMain() {
    const main = createElement('main', 'app-main');

    const form = createElement('form', 'input-form', { id: 'myForm' });

    const textarea = createElement('textarea', 'text-input', { 
        id: 'textInput', 
        rows: 10, 
        placeholder: 'Paste your run log here, or just the snippet with the image path. This will extract as many as it finds without duplicating', 
        required: true 
    });
    
    textarea.addEventListener('keydown', function (event) {
        if ((event.key === 'Enter' || event.key === 'Return') && !event.shiftKey) {
            event.preventDefault(); // Prevents new line
            submitForm(); // Calls the submit function
        }
    });
    

    const buttonsContainer = createElement('div', 'buttons-container');
    const submitBtn = createElement('input', 'btn submit-btn', { type: 'button', value: 'Submit' });
    submitBtn.addEventListener('click', submitForm);

    const secondaryButtons = createElement('div', 'secondary-buttons');
    const clearBtn = createElement('input', 'btn secondary-btn', { type: 'button', value: 'Clear Results' });
    clearBtn.addEventListener('click', resetList);

    const exportBtn = createElement('button', 'btn secondary-btn', { title: 'Export List', type: 'button' });
    exportBtn.addEventListener('click', exportList);
    exportBtn.appendChild(createIcon(ICONS.download, 'Download', 20));

    secondaryButtons.append(clearBtn, exportBtn);
    buttonsContainer.append(submitBtn, secondaryButtons);
    form.append(textarea, buttonsContainer);

    const resultSection = createElement('section', 'results-section', { id: 'resultDiv' });
    const resultHeader = createElement('h2');
    resultHeader.textContent = 'Results';

    const resultList = createElement('div', 'result-list', { id: 'resultList' });
    resultSection.append(resultHeader, resultList);

    main.append(form, resultSection);
    return main;
}

// ================== CORE FUNCTIONS ===================


function createGroupedUrlListItems(urls) {
    const resultList = document.getElementById('resultList');
    const groupContainer = createElement('div', 'result-group');

    const headerContainer = createElement('div', 'group-header');
    const timestamp = new Date().toLocaleString();
    const timestampElement = createElement('small', 'group-timestamp');
    timestampElement.textContent = timestamp;

    const groupCopyBtn = createElement('button', 'btn secondary-btn', { title: 'Copy all links, formatted for jira!' });
    groupCopyBtn.appendChild(createIcon(ICONS.copy, 'Copy Group', 20));
    groupCopyBtn.addEventListener('click', () => copyGroupLinks(groupContainer));

    headerContainer.append(timestampElement, groupCopyBtn);

    const noteInput = createElement('input', 'group-note', { type: 'text', placeholder: 'Add a note...' });
    noteInput.addEventListener('input', saveGroupToStorage);

    groupContainer.append(headerContainer, noteInput);

    urls.forEach(url => {
        const listItem = createElement('div', 'result-item');

        const link = createElement('a', null, { href: url, target: '_blank' });
        link.textContent = url;

        const copyIcon = createIcon(ICONS.copy, 'Copy Link', 16);
        copyIcon.className = 'copy-icon';
        copyIcon.addEventListener('click', () => copyToClipboard(url));

        listItem.append(copyIcon, link);
        groupContainer.appendChild(listItem);
    });

    resultList.prepend(groupContainer);
    saveGroupToStorage();
    toggleResultsVisibility();
}

function toggleResultsVisibility() {
    const resultSection = document.querySelector('.results-section');
    const secondaryButtons = document.querySelector('.secondary-buttons');
    const hasResults = document.querySelectorAll('.result-group').length > 0;

    resultSection.classList.toggle('visible', hasResults);
    secondaryButtons.classList.toggle('visible', hasResults);
}

function setupThemeToggle() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.className = currentTheme;
    const themeIcon = document.querySelector('#themeToggle img');
    themeIcon.src = currentTheme === 'dark' ? ICONS.daylight : ICONS.nightMode;
}

function toggleTheme() {
    const currentTheme = document.body.className === 'dark' ? 'light' : 'dark';
    document.body.className = currentTheme;
    localStorage.setItem('theme', currentTheme);
    const themeIcon = document.querySelector('#themeToggle img');
    themeIcon.src = currentTheme === 'dark' ? ICONS.daylight : ICONS.nightMode;
}

function copyGroupLinks(groupContainer) {
    const links = Array.from(groupContainer.querySelectorAll('a')).map(link => link.href);
    copyToClipboard(links.join('\n'));
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => triggerSubmitSuccess('Copied!', 1500))
        .catch(() => triggerSubmitError('Copy failed', 1500));
}

function validateUserInput(userInput) {
    return !!userInput.match(IMAGE_REGEX);
}

function generateURL(userInput) {
    const imageNames = Array.from(new Set(Array.from(userInput.matchAll(IMAGE_REGEX), match => match[0].replace(/_/g, '/'))));
    return imageNames.map(imageName => `${URL_PREFIX}${imageName}`);
}

function submitForm() {
    const inputElement = document.getElementById('textInput');
    const userInput = inputElement.value;

    if (validateUserInput(userInput)) {
        const generatedUrls = generateURL(userInput);
        createGroupedUrlListItems(generatedUrls);
        inputElement.value = '';
        inputElement.focus();
        triggerSubmitSuccess('Success!', 1500);
    } else {
        triggerSubmitError('Invalid pattern', 1500);
    }
}

function saveGroupToStorage() {
    const groups = Array.from(document.querySelectorAll('.result-group')).map(group => ({
        timestamp: group.querySelector('.group-timestamp').textContent,
        note: group.querySelector('.group-note').value,
        links: Array.from(group.querySelectorAll('a')).map(link => link.href)
    }));
    localStorage.setItem('savedGroups', JSON.stringify(groups));
}

function loadSavedGroups() {
    const savedGroups = JSON.parse(localStorage.getItem('savedGroups')) || [];
    savedGroups.reverse().forEach(group => createGroupedUrlListItems(group.links));
}

function resetList() {
    if (confirm('Clear the list?')) {
        const resultList = document.getElementById('resultList');
        resultList.innerHTML = '';
        localStorage.removeItem('savedGroups');
        toggleResultsVisibility();
        triggerSubmitSuccess('Cleared', 1500);
    }
}

function exportList() {
    const savedGroups = JSON.parse(localStorage.getItem('savedGroups')) || [];
    let exportText = 'Exported Image Links\n\n';

    savedGroups.forEach((group, index) => {
        exportText += `Group ${index + 1}: ${group.timestamp}\n`;
        if (group.note) exportText += `Note: ${group.note}\n`;
        group.links.forEach(link => exportText += `${link}\n`);
        exportText += '\n';
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_links.txt';
    a.click();
    URL.revokeObjectURL(url);

    triggerSubmitSuccess('Exported!', 1500);
}

function triggerSubmitError(message = "Error", duration = 1500) {
    const submitBtn = document.querySelector('.submit-btn');
    clearTimeout(submitBtnTimeout);
    const originalText = 'Submit';

    submitBtn.classList.add('error');
    submitBtn.disabled = true;
    submitBtn.value = message;

    submitBtnTimeout = setTimeout(() => {
        submitBtn.classList.remove('error');
        submitBtn.disabled = false;
        submitBtn.value = originalText;
    }, duration);
}

function triggerSubmitSuccess(message, duration = 1500) {
    const submitBtn = document.querySelector('.submit-btn');
    clearTimeout(submitBtnTimeout);
    const originalText = 'Submit';

    submitBtn.classList.add('success');
    submitBtn.value = message;

    submitBtnTimeout = setTimeout(() => {
        submitBtn.classList.remove('success');
        submitBtn.value = originalText;
    }, duration);
}

// ================== UTILITY FUNCTIONS ===================
function createElement(tag, className = '', attributes = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
}

function createIcon(src, alt, size) {
    return createElement('img', '', { src, alt, width: size, height: size });
}
