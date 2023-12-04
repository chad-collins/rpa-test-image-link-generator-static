// Regular expression for image pattern
const IMAGE_REGEX = /\b\d{4}_.*?image.*?\.png\b/;

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Help modal functionality
    const helpButton = document.getElementById('helpButton');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');

    // Event listeners for showing and hiding the help modal
    helpButton.addEventListener('click', () => showModal(modal));
    closeBtn.addEventListener('click', () => hideModal(modal));
    window.addEventListener('click', (event) => {
        // Hide modal if clicked outside the modal content
        if (event.target === modal) {
            hideModal(modal);
        }
    });

    // Initialize the year element in the copyright section
    const yearElement = document.getElementById('year');
    updateYear(yearElement);
});

// Function to update the year dynamically in the copyright section
function updateYear(yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = currentYear;
}

// Function to show a modal
function showModal(modal) {
    modal.style.display = 'block';
    modal.classList.add('fade-in');
}

// Function to hide a modal
function hideModal(modal) {
    modal.classList.remove('fade-in');
    modal.style.display = 'none';
}

// Function to show a temporary message/notification
function showTemporaryMessage(message, messageType, duration = 3000) {
    const messageElement = createMessageElement(message, messageType);
    document.body.appendChild(messageElement);

    // Force a reflow before applying the 'visible' class
    messageElement.offsetHeight;

    // Delay before applying the 'visible' class
    setTimeout(() => {
        messageElement.classList.add('visible');
    }, 10);

    // Remove the message after a specified duration
    setTimeout(() => {
        messageElement.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, duration);
}

// Function to create a message element for temporary messages/notifications
function createMessageElement(message, messageType) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;

    // Always assign the base class
    messageElement.className = 'temporary-message';

    // Add additional classes based on the message type
    if (messageType === 'success') {
        messageElement.classList.add('success');
    } else if (messageType === 'error') {
        messageElement.classList.add('error');
    }

    return messageElement;
}



function submitForm() {
    const inputElement = document.getElementById('textInput');
    const userInput = inputElement.value;

    if (validateUserInput(userInput)) {
        const generatedLink = generateURL(userInput);
        addTextToList(generatedLink);
        clearForm();

        // Focus on the input element after clearing the form
        inputElement.focus();

        // Get the focused window (if any) and bring it to focus
        const window = BrowserWindow.getFocusedWindow();
        if (window) {
            window.focus();
        }

        // Show success message
        showTemporaryMessage("Link generated successfully", 'success');
    } else {
        // Show error message
        showTemporaryMessage("Your text does not contain the image pattern. See help for details", 'error');
    }
}

function clearForm() {
    const inputElement = document.getElementById('textInput');
    inputElement.value = '';
}

function resetList() {
    // Ask for confirmation before clearing the list
    const confirmation = window.confirm('Are you sure you want to clear the list?');

    if (confirmation) {
        const resultList = document.getElementById('resultList');
        while (resultList.firstChild) {
            resultList.removeChild(resultList.firstChild);
        }

        // Show a temporary message indicating the list has been cleared
        showTemporaryMessage('List cleared', 'success');
    }
}

function validateUserInput(userInput) {
    return !!userInput.match(IMAGE_REGEX);
}

function generateURL(userInput) {
    try {
        // Extract image path from user input and create a URL
        const urlSuffix = userInput.match(IMAGE_REGEX)[0].replace(/_/g, '/');
        const urlPrefix = "http://papasubsvc000.recondo.vci:8111/";
        return urlPrefix + urlSuffix;
    } catch (e) {
        // Show error message for any issues in creating the link
        showTemporaryMessage("Error Creating Link", 'error');
    }
}

function copyToClipboard(text) {
    // Create a temporary textarea to facilitate copying to clipboard
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.className = 'copy-to-clipboard';
    document.body.appendChild(textArea);
    textArea.select();

    // Copy text to clipboard using the Clipboard API
    navigator.clipboard.writeText(text)
        .then(() => showTemporaryMessage('Link copied!', 'success'))
        .catch(err => console.error('Unable to copy text to clipboard', err))
        .finally(() => document.body.removeChild(textArea));
}

function addTextToList(text) {
    // Create a list item with a hyperlink and copy icon, and append it to the result list
    const listItem = document.createElement('li');
    
    // Create the hyperlink element
    const link = document.createElement('a');
    link.href = text;
    link.target = '_blank'; // Open in a new tab
    link.textContent = text;

    // Create the copy icon element
    const copyIcon = document.createElement('span');
    copyIcon.className = 'copy-icon';
    copyIcon.textContent = '📋';

    // Attach the click event listener to the copy icon
    copyIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click event from reaching the list item
        copyToClipboard(text);
    });

    // Append the hyperlink and copy icon to the list item
    listItem.appendChild(copyIcon);
    listItem.appendChild(link);

    // Append the list item to the result list
    const resultList = document.getElementById('resultList');
    resultList.appendChild(listItem);
}