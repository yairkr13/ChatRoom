'use strict';

const utils = (function () {
    /**
     * Creates a toast notification body.
     * @param {string} header - The header text for the toast notification.
     * @param {string} msg - The message text for the toast notification.
     * @returns {string} - The HTML string for the toast body.
     */
    const toastBodyCreator = (header, msg) => {
        const success = header.toLowerCase() === "approved" || header.toLowerCase() === "deleted";
        const colorClass = success ? 'bg-success' : 'bg-danger';
        const iconClass = success ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill';

        return `
        <div class="toast-header ${colorClass} text-white">
            <i class="${iconClass} me-2"></i>
            <strong class="me-auto">${header}!</strong>
            <small class="text-muted">Now</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${msg}
        </div>
    `;
    };

    /**
     * Displays a toast notification with the specified header and message.
     * @param {string} header - The header text for the toast notification.
     * @param {string} msg - The message text for the toast notification.
     */
    const showToast = (toastLive, header, msg) => {
        toastLive.innerHTML = toastBodyCreator(header, msg);

        const toastInstance = new bootstrap.Toast(toastLive, {
            animation: true,
            delay: 3000 // Adjust the delay as needed
        });

        toastInstance.show();
    }

    /**
     * Creates a button element with specified text, class, and event listener.
     * @param {string} text - The text content of the button.
     * @param {string} className - The class name(s) to apply to the button.
     * @param {string} dataId - The ID or data attribute value for the button.
     * @param {Function} eventListener - The event listener function for the button click event.
     * @returns {HTMLElement} - The button element.
     */
    const createButton = function (text, className, dataId, eventListener) {
        const button = document.createElement('button');
        button.classList.add('btn', className, 'me-2', 'col-3', 'fs-5');
        button.textContent = text;
        button.setAttribute('data-ad-id', dataId);
        button.addEventListener('click', eventListener);
        return button;
    }


    /**
     * Creates a list item for displaying ad details.
     * @param {string} label - The label for the ad detail.
     * @param {string} value - The value of the ad detail.
     * @returns {HTMLElement} - The list item element.
     */
    const createListItem = function (label, value) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'border-0', 'py-1');
        listItem.innerHTML = `<strong>${label}:</strong> ${value}`;
        return listItem;
    }

    /**
     * Generates HTML template for displaying a message when no ads are available.
     * @param {string} adType - The type of ads ('readonly', 'user', 'pending', or 'approved').
     * @returns {string} - The HTML template for the message.
     */
    function generateNoAdsTemplate(adType) {
        const adStatus = adType === 'readonly' || adType === 'user' ? '' : adType === 'pending' ? 'Pending' : 'Approved';

        let message = '';
        if (adType === 'user') {
            message = `It seems you haven't published any ads yet. Why not publish your first ad now?`;
        } else {
            message = `Oops!${adStatus ? ` There are no ${adStatus.toLowerCase()} ads to show right now.` : ` It seems there are no ads to display at the moment.`}`;
        }

        return `
        <div class="container mt-5">
            <div class="row">
                <div class="col-lg-6 mx-auto">
                    <div class="card rounded shadow-lg">
                        <div class="card-body">
                            <h2 class="card-title text-primary mb-4">No ${adStatus ? `${adStatus} ` : ''}Ads Available</h2>
                            <p class="card-text text-muted">${message}</p>
                            ${adStatus ? '' : `<p class="card-text text-muted">Don't worry, new ads are added all the time. Please check back later for updates.</p>`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    }



    /**
     * Fetches data from the server using the specified URL and method.
     * @param {string} url - The URL to fetch data from.
     * @param {string} [method=GET] - The HTTP method to use for the request (default is GET).
     * @returns {Promise<Response>} - The response from the server.
     */
    const fetchData = async function (url, method) {
        try {
            const response = await fetch(url, { method: method || "GET" });
            if (!response.ok)
                throw new Error(response.statusText);
            return response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Creates a custom card element to display an ad with options to approve or delete.
     * @param {Object} ad - The ad object containing information like title, description, etc.
     * @param {string} adType - The type of ad ('user' or 'pending').
     * @param {Object} funcs - Object containing functions for handling actions.
     * @returns {HTMLElement} - The custom card element representing the ad.
     */
    const createCustomCard = function (ad, adType, funcs) {

        // Create column div
        const colDiv = createColDiv();

        // Create card div
        const cardDiv = createCardDiv();

        // Create card body div
        const cardBodyDiv = createCardBodyDiv();

        // Create card title element
        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title', 'mb-3');
        cardTitle.textContent = ad.title;

        // Create card text element
        const cardText = document.createElement('p');
        cardText.classList.add('card-text', 'mb-4');
        cardText.textContent = ad.description;

        // Create list group element
        const listGroup = createListGroup(ad);

        // Create card footer div
        const cardFooterDiv = createCardFooterDiv(ad, adType);

        // Create buttons group
        const buttonGroup = createButtonGroup(ad, adType, funcs); // Create button group div

        // Append elements to card
        appendElementsToCard(cardBodyDiv, cardTitle, cardText, listGroup, cardFooterDiv, buttonGroup);

        // Append card to column
        cardDiv.appendChild(cardBodyDiv);
        cardDiv.appendChild(listGroup);
        cardDiv.appendChild(cardFooterDiv);
        cardDiv.appendChild(buttonGroup);
        colDiv.appendChild(cardDiv);

        return colDiv;
    }

    /**
     * Creates a list group element.
     * @returns {HTMLUListElement} - The list group element.
     */
    const createListGroup = function (ad) {
        const listGroup = document.createElement('ul');
        listGroup.classList.add('list-group', 'list-group-flush');
        listGroup.appendChild(utils.createListItem('Price', ad.price));
        listGroup.appendChild(utils.createListItem('Phone Number', ad.phone));
        return listGroup;
    }

    /**
     * Creates a column div for the card.
     * @returns {HTMLDivElement} - The column div element.
     */
    const createColDiv = function () {
        const colDiv = document.createElement('div');
        colDiv.classList.add('col', 'mb-4');
        return colDiv;
    }

    /**
     * Creates a card div for the ad.

     * @returns {HTMLDivElement} - The card div element.
     */
    const createCardDiv = function () {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card', 'h-100', 'border-0', 'shadow');
        return cardDiv;
    }

    /**
     * Creates a card body div for the ad.
     * @returns {HTMLDivElement} - The card body div element.
     */
    const createCardBodyDiv = function () {
        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.classList.add('card-body');
        return cardBodyDiv;
    }

    /**
     * Creates a card footer div for the ad.
     * @param {Object} ad - The ad object containing information about the ad.
     * @param {string} adType - The type of ad ('user' or 'pending').
     * @returns {HTMLDivElement} - The card footer div element.
     */
    const createCardFooterDiv = function (ad, adType) {
        const cardFooterDiv = document.createElement('div');
        cardFooterDiv.classList.add('card-footer', 'text-muted');
        const smallText = document.createElement('small');
        smallText.textContent = `Last updated ${Math.floor((new Date() - new Date(ad.updatedAt)) / (1000 * 60))} mins ago`;
        cardFooterDiv.appendChild(smallText);

        if (adType === 'user') {
            const isApprovedText = document.createElement('p');
            isApprovedText.textContent = ad.isApproved ? '✅ Approved' : '⌛ Not yet approved';
            isApprovedText.style.fontWeight = 'bold';
            isApprovedText.style.marginBottom = '0';
            cardFooterDiv.appendChild(isApprovedText);
        }

        return cardFooterDiv;
    }

    /**
     * Creates a button group for the card actions.
     * @param {Object} ad - The ad object containing information about the ad.
     * @param {string} adType - The type of ad ('user' or 'pending').
     * @param {Object} funcs - Object containing functions for handling actions.
     * @returns {HTMLDivElement} - The button group div element.
     */
    const createButtonGroup = function (ad, adType, funcs) {
        if(adType === 'readonly') {
            return document.createElement('div');
        }
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('d-flex', 'justify-content-center');

        if (adType === 'pending') {
            const buttonV = utils.createButton('V', 'btn-success', ad.id, funcs.approveAd);
            buttonGroup.appendChild(buttonV);
        }

        const buttonX = utils.createButton('X', 'btn-danger', ad.id, funcs.deleteAd);
        buttonGroup.appendChild(buttonX);

        return buttonGroup;
    }

    /**
     * Appends elements to the card.
     * @param {HTMLElement} cardBodyDiv - The card body div element.
     * @param {HTMLElement} cardTitle - The card title element.
     * @param {HTMLElement} cardText - The card text element.
     * @param {HTMLElement} listGroup - The list group element.
     * @param {HTMLElement} cardFooterDiv - The card footer div element.
     * @param {HTMLElement} buttonGroup - The button group element.
     */
    const appendElementsToCard = function (cardBodyDiv, cardTitle, cardText, listGroup, cardFooterDiv, buttonGroup) {
        cardBodyDiv.appendChild(cardTitle);
        cardBodyDiv.appendChild(cardText);
        cardBodyDiv.appendChild(listGroup);
        cardBodyDiv.appendChild(cardFooterDiv);
        cardBodyDiv.appendChild(buttonGroup);
    }

    /**
     * Retrieves ads of a specific type (pending or approved) from the server and updates the UI.
     * @param {string} url - The type of ads to retrieve (pending or approved).
     */
    const getUsersAds = async function (url, adsContainer ,adType, funcs) {
        try {
            const res = await fetchData(url);
            const ads = await res.json();
            updateAdsContainer(ads, adsContainer, adType, funcs);
        } catch (e) {
            throw e

        }
    }

    /**
     * Updates the ads container with the provided ads.
     * @param {Array} ads - An array of ad objects
     */
    const updateAdsContainer = function(ads, adsContainer, adType, funcs) {
        if (ads && ads.length !== 0) {
            adsContainer.innerHTML = '';
            ads.forEach(ad => adsContainer.appendChild(createCustomCard(ad, adType, funcs)));
        } else {
            adsContainer.innerHTML = generateNoAdsTemplate(adType);
        }
    }

    /**
     * Resets error messages for the given input element.
     * @param {Element} element - The input element to reset errors for
     */
    function resetError(element) {
        element.classList.remove("is-invalid");
        element.nextElementSibling.textContent = '';
    }

    /**
     * Displays an error message for the given input element.
     * @param {HTMLElement} element - The input element.
     * @param {string} message - The error message to display.
     */
    function showError(element, message) {
        element.classList.add("is-invalid");
        element.nextElementSibling.textContent = message;

    }



    return {
        showToast: showToast,
        createButton: createButton,
        createListItem: createListItem,
        fetchData: fetchData,
        getUsersAds: getUsersAds,
        resetError: resetError,
        showError: showError,
    }
})();