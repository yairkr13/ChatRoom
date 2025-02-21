    'use strict';


(function () {
    const userUrl = `/api/userAds`;
    const adsType = 'user';

    // DOM elements
    const adsContainer = document.getElementById("ads-container");
    const spinner = document.getElementById("spinner-loader");
    const toastLive = document.getElementById('liveToast');


    // Messages
    const adErrorMessage = "Something went wrong, please try again.";

    /**
     * Event listener to ensure DOM content is fully loaded
     */
    document.addEventListener('DOMContentLoaded', async function () {
        await fetchAds();

    });

    /**
     * Retrieves all ads from the server and updates the UI.
     */
    const fetchAds = async function() {
        try {
            spinner.classList.remove('d-none');
            await utils.getUsersAds(userUrl, adsContainer, adsType, { deleteAd: deleteAd})
        } catch (e) {
            utils.showToast(toastLive, adErrorMessage, e.message);
        } finally {
            spinner.classList.add('d-none');
        }
    }


    /**
     * Handles the deletion of an ad.
     * @param {Event} btn - The click event object of the button clicked.
     */
    const deleteAd = async function (btn) {
        try {
            const res = await utils.fetchData(`/api/ads/${btn.srcElement.dataset.adId}`, "DELETE");
            utils.showToast(toastLive,"deleted", await res.text())
        } catch (e) {
            utils.showToast(toastLive,adErrorMessage, e.message);
        } finally {
            await fetchAds();
        }
    }

})();
