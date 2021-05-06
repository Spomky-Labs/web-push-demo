# Web Push Demo

This is a simple demo application that can be used as a base for bigger projects.
The application is configured to send web push notifications.

# Online demo

To test this application online, please visit https://quiet-caverns-28842.herokuapp.com/ (may need few seconds to start up).

# Compatible Browsers

This demo is compatible with Firefox, Chrome and Edge.
Issues have been detected with Brave and Opera.

# Build your Own

## Prerequisites

Please make sure you install the following applications:

* yarn
* symfony
* composer

## Usage

First, clone the demo

```shell
gh repo clone Spomky-Labs/web-push-demo
cd web-push-demo
```

Then install the dependencies and build the project

```shell
composer install
yarn install
yarn build
```

And serve the application

```shell
symfony serve
```

You can visit your application at URL showed in your terminal (usually https://127.0.0.1:8000).

# Troubleshooting

Some browsers seem to refuse Service Workers when application are served with self-signed certificates.
You can either use trusted certificates or disable the Symfony ones as a temporary solution.
