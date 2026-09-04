<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Di server, TLS diterminasi oleh Cloudflare/reverse proxy dan header
        // X-Forwarded-Proto tidak selalu sampai utuh ke aplikasi. Selama APP_URL
        // memang HTTPS, paksa seluruh URL (route(), url(), asset(), fetch dari JS)
        // memakai skema https agar tidak kena blokir mixed content.
        if (str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            return rtrim((string) config('app.public_url'), '/')
                .'/reset-password/'.rawurlencode($token)
                .'?email='.rawurlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
