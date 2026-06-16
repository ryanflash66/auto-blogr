<?php

/**
 * Plugin Name:       AutoBlogr API
 * Description:        Custom REST API for AutoBlogr with Application Password plus HMAC request signing and asynchronous post processing.
 * Version:           1.0.0
 * Requires PHP:      8.1
 * License:           MIT
 *
 * @package AutoBlogr
 */

declare(strict_types=1);

namespace AutoBlogr;

use AutoBlogr\Auth\Authenticator;
use AutoBlogr\Hmac\Signer;
use AutoBlogr\Http\CallbackClient;
use AutoBlogr\Jobs\OptionJobStore;
use AutoBlogr\Jobs\PostProcessor;
use AutoBlogr\Rest\Controller;

if (!defined('ABSPATH')) {
    exit;
}

$autoload = __DIR__ . '/vendor/autoload.php';
if (is_readable($autoload)) {
    require $autoload;
}

/**
 * Build the object graph and register the plugin's hooks.
 */
function bootstrap(): void
{
    $signer = new Signer();
    $store = new OptionJobStore();
    $callback = new CallbackClient($signer);
    $processor = new PostProcessor($store, $callback);
    $authenticator = new Authenticator($signer);
    $controller = new Controller($authenticator, $processor, $store);

    add_action('rest_api_init', [$controller, 'register']);
    add_action(PostProcessor::HOOK, static function (string $jobId) use ($processor): void {
        $processor->run($jobId);
    }, 10, 1);
}

bootstrap();
