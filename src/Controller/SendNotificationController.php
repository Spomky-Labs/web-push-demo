<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use WebPush\Action;
use WebPush\Message;
use WebPush\Notification;
use WebPush\Subscription;
use WebPush\WebPush;

final class SendNotificationController
{
    private WebPush $webpushService;

    public function __construct(WebPush $webpushService)
    {
        $this->webpushService = $webpushService;
    }


    /**
     * @Route(path="/notify", name="app_notify")
     */
    public function __invoke(Request $request): Response
    {
        $message = Message::create('Hello World!')
            ->withLang('en-GB')
            ->interactionRequired()
            ->withTimestamp(time())
            ->addAction(Action::create('accept', 'Accept'))
            ->addAction(Action::create('cancel', 'Cancel'))
        ;
        $notification = Notification::create()
            ->lowUrgency()
            ->withPayload($message->toString());
        $subscription = Subscription::createFromString($request->getContent());

        $statusReport = $this->webpushService->send($notification, $subscription);
        $statusResponse = $statusReport->getResponse();

        return  new Response(
            $statusResponse->getBody()->getContents(),
            $statusResponse->getStatusCode(),
            $statusResponse->getHeaders()
        );
    }
}
