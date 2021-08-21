self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }
    console.log(event);
    const sendNotification = response => {
        const {title, options} = JSON.parse(response);
        console.log(title, options);

        return self.registration.showNotification(title, options);
    };

    if (event.data) {
        const message = event.data.text();
        event.waitUntil(sendNotification(message));
    }
});
