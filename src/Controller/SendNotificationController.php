<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
    public function __invoke(Request $request): JsonResponse
    {
        $message = Message::create('My super Application', 'Hello World!')
            //->rtl()
            //->renotify()
            ->vibrate(200, 300, 200, 300)
            ->withImage('https://placebear.com/1024/512')
            ->withIcon('https://placebear.com/512/512')
            ->withBadge('https://placebear.com/256/256')
            //->withData(['foo' => 'BAR'])
            //->withTag('tag1')
            ->withLang('fr_FR')
            //->mute()
            ->withTimestamp(time())
            ->addAction(Action::create('accept', 'Accept'))
            ->addAction(Action::create('cancel', 'Cancel'))
        ;
        $notification = Notification::create()
            //->highUrgency()
            ->withPayload($message->toString());
        $subscription = Subscription::createFromString($request->getContent());

        $statusReport = $this->webpushService->send($notification, $subscription);

        return new JsonResponse([
            'error' => !$statusReport->isSuccess(),
            'links' => $statusReport->getLinks(),
            'location' => $statusReport->getLocation(),
            'expired' => $statusReport->isSubscriptionExpired(),
        ],
            $statusReport->isSuccess() ? 200: 400,
        );
    }
}
