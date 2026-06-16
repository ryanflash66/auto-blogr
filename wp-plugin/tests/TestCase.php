<?php

declare(strict_types=1);

namespace AutoBlogr\Tests;

use Brain\Monkey;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use PHPUnit\Framework\TestCase as PHPUnitTestCase;

/**
 * Base test case that boots and tears down Brain Monkey so WordPress core
 * functions can be mocked in isolation.
 *
 * MockeryPHPUnitIntegration bridges Mockery expectations into PHPUnit's
 * assertion counter, so a verified expectation counts as the assertion it is.
 */
abstract class TestCase extends PHPUnitTestCase
{
    use MockeryPHPUnitIntegration;

    protected function setUp(): void
    {
        parent::setUp();
        Monkey\setUp();
    }

    protected function tearDown(): void
    {
        Monkey\tearDown();
        parent::tearDown();
    }
}
