<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

final class HomepageController extends AbstractController
{
    #[Route(path: '/', name: 'app_homepage')]
    public function __invoke(): Response
    {
        return $this->render('page/homepage.html.twig');
    }
}
