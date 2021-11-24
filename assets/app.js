import './styles/app.scss';
import './bootstrap';

const $ = require('jquery');
require('bootstrap');
require('bootstrap-star-rating');
require('bootstrap-star-rating/css/star-rating.css');
require('bootstrap-star-rating/themes/krajee-svg/theme.css');

$(document).ready(function() {
    $('[data-toggle="popover"]').popover();
});

document.addEventListener('DOMContentLoaded', () => {
    const applicationServerKey = 'BB4W1qfBi7MF_Lnrc6i2oL-glAuKF4kevy9T0k2vyKV4qvuBrN3T6o9-7-NR3mKHwzDXzD3fe7XvIqIU1iADpGQ';
    let isPushEnabled = false;

    const pushButton = document.querySelector('#push-subscription-button');
    if (!pushButton) {
        return;
    }

    pushButton.addEventListener('click', function() {
        if (isPushEnabled) {
            pushUnsubscribe();
        } else {
            pushSubscribe();
        }
    });

    if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported by this browser');
        changePushButtonState('incompatible');
        return;
    }

    if (!('PushManager' in window)) {
        console.warn('Push notifications are not supported by this browser');
        changePushButtonState('incompatible');
        return;
    }

    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        console.warn('Notifications are not supported by this browser');
        changePushButtonState('incompatible');
        return;
    }

    if (Notification.permission === 'denied') {
        console.warn('Notifications are denied by the user');
        changePushButtonState('incompatible');
        return;
    }

    navigator.serviceWorker.register('serviceWorker.js').then(
        () => {
            console.log('[SW] Service worker has been registered');
            push_updateSubscription();
        },
        e => {
            console.error('[SW] Service worker registration failed', e);
            changePushButtonState('incompatible');
        }
    );

    function changePushButtonState(state) {
        switch (state) {
            case 'enabled':
                pushButton.disabled = false;
                pushButton.textContent = 'Disable Push notifications';
                isPushEnabled = true;
                break;
            case 'disabled':
                pushButton.disabled = false;
                pushButton.textContent = 'Enable Push notifications';
                isPushEnabled = false;
                break;
            case 'computing':
                pushButton.disabled = true;
                pushButton.textContent = 'Loading...';
                break;
            case 'incompatible':
                pushButton.disabled = true;
                pushButton.textContent = 'Push notifications are not compatible with this browser';
                break;
            default:
                console.error('Unhandled push button state', state);
                break;
        }
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    function checkNotificationPermission() {
        return new Promise((resolve, reject) => {
            if (Notification.permission === 'denied') {
                return reject(new Error('Push messages are blocked.'));
            }

            if (Notification.permission === 'granted') {
                return resolve();
            }

            if (Notification.permission === 'default') {
                return Notification.requestPermission().then(result => {
                    if (result !== 'granted') {
                        reject(new Error('Bad permission result'));
                    } else {
                        resolve();
                    }
                });
            }

            return reject(new Error('Unknown permission'));
        });
    }

    function pushSubscribe() {
        changePushButtonState('computing');

        return checkNotificationPermission()
            .then(() => navigator.serviceWorker.ready)
            .then(serviceWorkerRegistration =>
                serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
                })
            )
            .then(subscription => subscription && changePushButtonState('enabled'))
            .catch(e => {
                if (Notification.permission === 'denied') {
                    console.warn('Notifications are denied by the user.');
                    changePushButtonState('incompatible');
                } else {
                    console.error('Impossible to subscribe to push notifications', e);
                    changePushButtonState('disabled');
                }
            });
    }

    function push_updateSubscription() {
        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
                changePushButtonState('disabled');

                return subscription;
            })
            .then(subscription => subscription && changePushButtonState('enabled'))
            .catch(e => {
                console.error('Error when updating the subscription', e);
            });
    }

    function pushUnsubscribe() {
        changePushButtonState('computing');
        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
                if (!subscription) {
                    changePushButtonState('disabled');
                    return;
                }

                return subscription;
            })
            .then(subscription => subscription.unsubscribe())
            .then(() => changePushButtonState('disabled'))
            .catch(e => {
                console.error('Error when unsubscribing the user', e);
                changePushButtonState('disabled');
            });
    }


    const sendPushButton = document.querySelector('#send-push-button');
    if (!sendPushButton) {
        return;
    }

    sendPushButton.addEventListener('click', () =>
        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
                if (!subscription) {
                    alert('Please enable push notifications');
                    return;
                }
                const supportedContentEncodings = PushManager.supportedContentEncodings || ['aesgcm'];
                const jsonSubscription = subscription.toJSON();
                fetch('/notify', {
                    method: 'POST',
                    body: JSON.stringify(Object.assign(jsonSubscription, { supportedContentEncodings })),
                });
            })
    );
});
