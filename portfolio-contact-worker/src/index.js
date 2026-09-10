const ALLOWED_ORIGINS = new Set([
    'https://amitpandyaportfolio.vercel.app',
    'https://amit13091992.github.io'
]);

const RESEND_API_URL =
    'https://api.resend.com/emails';


function getCorsHeaders(origin) {

    const headers = {
        'Access-Control-Allow-Methods':
            'POST, OPTIONS',

        'Access-Control-Allow-Headers':
            'Content-Type',

        'Content-Type':
            'application/json',

        'Vary':
            'Origin'
    };

    if (
        ALLOWED_ORIGINS.has(origin)
    ) {
        headers[
            'Access-Control-Allow-Origin'
        ] = origin;
    }

    return headers;
}


function jsonResponse(
    data,
    status = 200,
    origin = ''
) {

    return new Response(
        JSON.stringify(data),
        {
            status,

            headers:
                getCorsHeaders(origin)
        }
    );
}


function clean(
    value,
    maxLength
) {

    return String(value || '')
        .trim()
        .slice(0, maxLength);
}


function escapeHtml(value) {

    return String(value)
        .replaceAll(
            '&',
            '&amp;'
        )
        .replaceAll(
            '<',
            '&lt;'
        )
        .replaceAll(
            '>',
            '&gt;'
        )
        .replaceAll(
            '"',
            '&quot;'
        )
        .replaceAll(
            "'",
            '&#039;'
        );
}


export default {

    async fetch(
        request,
        env
    ) {

        console.log(
            '========== WORKER REQUEST =========='
        );

        const origin =
            request.headers.get(
                'Origin'
            ) || '';

        console.log(
            'Request method:',
            request.method
        );

        console.log(
            'Request origin:',
            origin
        );


        /*
         * Verify origin
         */

        if (
            origin &&
            !ALLOWED_ORIGINS.has(
                origin
            )
        ) {

            console.warn(
                'Unauthorized origin:',
                origin
            );

            return jsonResponse(
                {
                    message:
                        'Unauthorized origin.'
                },
                403,
                origin
            );
        }


        /*
         * CORS preflight
         */

        if (
            request.method ===
            'OPTIONS'
        ) {

            console.log(
                'Handling CORS preflight.'
            );

            return new Response(
                null,
                {
                    status: 204,

                    headers:
                        getCorsHeaders(
                            origin
                        )
                }
            );
        }


        /*
         * Only POST allowed
         */

        if (
            request.method !==
            'POST'
        ) {

            console.warn(
                'Method not allowed:',
                request.method
            );

            return jsonResponse(
                {
                    message:
                        'Method not allowed.'
                },
                405,
                origin
            );
        }


        /*
         * Check environment variables
         */

        console.log(
            'Environment configuration:',
            {
                hasResendApiKey:
                    Boolean(
                        env.RESEND_API_KEY
                    ),

                resendFromEmail:
                    env.RESEND_FROM_EMAIL
                        ? 'configured'
                        : 'missing',

                hasToEmail:
                    Boolean(
                        env.TO_EMAIL
                    )
            }
        );


        if (
            !env.RESEND_API_KEY ||
            !env.RESEND_FROM_EMAIL ||
            !env.TO_EMAIL
        ) {

            console.error(
                'Missing Worker secrets.'
            );

            return jsonResponse(
                {
                    message:
                        'Server configuration is incomplete.'
                },
                500,
                origin
            );
        }


        /*
         * Parse request
         */

        let body;

        try {

            body =
                await request.json();

        } catch (error) {

            console.error(
                'Invalid JSON:',
                error
            );

            return jsonResponse(
                {
                    message:
                        'Invalid request.'
                },
                400,
                origin
            );
        }


        console.log(
            'Request body received:',
            {
                name:
                    body.name,

                email:
                    body.email,

                subject:
                    body.subject,

                messageLength:
                    String(
                        body.message || ''
                    ).length
            }
        );


        /*
         * Clean input
         */

        const name =
            clean(
                body.name,
                100
            );

        const email =
            clean(
                body.email,
                160
            );

        const subject =
            clean(
                body.subject,
                180
            );

        const message =
            clean(
                body.message,
                5000
            );


        /*
         * Validate
         */

        if (
            name.length < 2 ||
            email.length < 5 ||
            subject.length < 2 ||
            message.length < 5
        ) {

            console.warn(
                'Validation failed:',
                {
                    nameLength:
                        name.length,

                    emailLength:
                        email.length,

                    subjectLength:
                        subject.length,

                    messageLength:
                        message.length
                }
            );

            return jsonResponse(
                {
                    message:
                        'Please provide valid form details.'
                },
                400,
                origin
            );
        }


        /*
         * Email validation
         */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailPattern.test(
                email
            )
        ) {

            console.warn(
                'Invalid email:',
                email
            );

            return jsonResponse(
                {
                    message:
                        'Please provide a valid email address.'
                },
                400,
                origin
            );
        }


        /*
         * Send through Resend
         */

        console.log(
            'Sending email through Resend...'
        );

        console.log(
            'From:',
            env.RESEND_FROM_EMAIL
        );

        console.log(
            'To:',
            env.TO_EMAIL
        );


        let resendResponse;

        try {

            resendResponse =
                await fetch(
                    RESEND_API_URL,
                    {
                        method:
                            'POST',

                        headers: {

                            Authorization:
                                `Bearer ${env.RESEND_API_KEY}`,

                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({

                                from:
                                    env.RESEND_FROM_EMAIL,

                                to: [
                                    env.TO_EMAIL
                                ],

                                reply_to:
                                    email,

                                subject:
                                    `[Portfolio] ${subject}`,

                                html: `
                  <div style="
                    font-family: Arial, sans-serif;
                    max-width: 680px;
                    margin: 0 auto;
                    color: #0b1b3a;
                  ">

                    <h2>
                      New portfolio message
                    </h2>

                    <p>
                      Someone contacted you through
                      your portfolio.
                    </p>

                    <hr />

                    <p>
                      <strong>Name:</strong>
                      ${escapeHtml(name)}
                    </p>

                    <p>
                      <strong>Email:</strong>
                      ${escapeHtml(email)}
                    </p>

                    <p>
                      <strong>Subject:</strong>
                      ${escapeHtml(subject)}
                    </p>

                    <p>
                      <strong>Message:</strong>
                    </p>

                    <div style="
                      padding: 16px;
                      background: #f5f7fb;
                      border-radius: 8px;
                      white-space: pre-wrap;
                    ">
                      ${escapeHtml(message)}
                    </div>

                    <hr />

                    <p style="
                      color: #667085;
                      font-size: 12px;
                    ">
                      Sent from Amit Pandya portfolio.
                    </p>

                  </div>
                `
                            })
                    }
                );

        } catch (error) {

            console.error(
                'Resend request failed:',
                error
            );

            return jsonResponse(
                {
                    message:
                        'Unable to reach email service.'
                },
                502,
                origin
            );
        }


        /*
         * Read Resend response
         */

        const resendText =
            await resendResponse.text();

        console.log(
            'Resend status:',
            resendResponse.status
        );

        console.log(
            'Resend response:',
            resendText
        );


        /*
         * Resend error
         */

        if (
            !resendResponse.ok
        ) {

            console.error(
                'Resend rejected email:',
                resendText
            );

            return jsonResponse(
                {
                    message:
                        'Email service failed.'
                },
                502,
                origin
            );
        }


        /*
         * Success
         */

        console.log(
            'Email successfully accepted by Resend.'
        );

        console.log(
            '========== WORKER SUCCESS =========='
        );


        return jsonResponse(
            {
                success: true,

                message:
                    'Message sent successfully.'
            },
            200,
            origin
        );
    }
};