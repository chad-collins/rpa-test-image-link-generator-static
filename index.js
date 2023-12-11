const IMAGE_REGEX = /\b\d{4}_.*?image.*?\.png\b/g;
const URL_PREFIX = "http://papasubstr001.recondo.vci/";

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

});

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
function notifyBubble(message, messageType, duration = 3000) {
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
    messageElement.className = 'notify-bubble';

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
        const generatedUrls = generateURL(userInput);
        createUrlListItems(generatedUrls);
        clearForm();

        // Focus on the input element after clearing the form
        inputElement.focus();

        // Show success message
        notifyBubble("Link generated successfully", 'success');
    } else {
        // Show error message
        notifyBubble("Your text does not contain the image pattern. See help for details", 'error');
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
        notifyBubble('List cleared', 'success');
    }
}

function validateUserInput(userInput) {
    return !!userInput.match(IMAGE_REGEX);
}
function generateURL(userInput) {
    const urls = [];

    try {
        // Extract image paths from user input and create a URL
        const imageNames = Array.from(userInput.matchAll(IMAGE_REGEX), match => match[0].replace(/_/g, '/'));

        imageNames.forEach(imageName => {
            urls.push(`${URL_PREFIX}${imageName}`);
        });

    } catch (e) {
        console.error('Error:', e);
        notifyBubble("Error Creating Link", 'error');
    }
    console.log(urls)
    return urls;
}
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => notifyBubble('Link copied!', 'success'))
        .catch(err => notifyBubble('Unable to copy text to clipboard', 'error'));
}


function createUrlListItems(urls) {
    const resultList = document.getElementById('resultList');

    urls.forEach((url, index) => {

        // Create a list item with a hyperlink and copy icon
        const listItem = document.createElement('li');

        // Create the hyperlink element
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank'; // Open in a new tab
        link.textContent = url;

        // Create the copy icon element
        const copyIcon = document.createElement('span');
        copyIcon.className = 'copy-icon';
        copyIcon.textContent = '📋';

        // Attach the click event listener to the copy icon
        copyIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the click event from reaching the list item
            copyToClipboard(url);
        });

        // Append the hyperlink and copy icon to the list item
        listItem.appendChild(copyIcon);
        listItem.appendChild(link);

        // Append the list item to the result list after a delay
        setTimeout(() => {
            resultList.appendChild(listItem);
        }, index * 200); // Adjust the delay time (200 milliseconds in this example)
    });
}

