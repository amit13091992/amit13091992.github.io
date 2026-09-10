const ALLOWED_ORIGIN =
    'https://amit13091992.github.io';

const RESEND_API_URL =
    'https://api.resend.com/emails';

const TO_EMAIL = env.TO_EMAIL;

const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

function jsonResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: corsHeaders
        }
    );
}

function clean(value, maxLength) {
    return String(value || '')
        .trim()
        .slice(0, maxLength);
}

export default {
    async fetch(request, env) {

        /*
         * CORS preflight
         */
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        /*
         * Only POST is allowed
         */
        if (request.method !== 'POST') {
            return jsonResponse(
                {
                    message: 'Method not allowed.'
                },
                405
            );
        }

        /*
         * Verify request origin
         */
        const origin =
            request.headers.get('Origin');

        if (origin !== ALLOWED_ORIGIN) {
            return jsonResponse(
                {
                    message: 'Unauthorized origin.'
                },
                403
            );
        }

        /*
         * Parse request
         */
        let body;

        try {
            body = await request.json();
        } catch {
            return jsonResponse(
                {
                    message: 'Invalid request.'
                },
                400
            );
        }

        const name = clean(body.name, 100);
        const email = clean(body.email, 160);
        const subject = clean(body.subject, 180);
        const message = clean(body.message, 5000);

        /*
         * Validation
         */
        if (
            name.length < 2 ||
            email.length < 5 ||
            subject.length < 2 ||
            message.length < 5
        ) {
            return jsonResponse(
                {
                    message:
                        'Please provide valid form details.'
                },
                400
            );
        }

        /*
         * Basic email validation
         */
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return jsonResponse(
                {
                    message:
                        'Please provide a valid email address.'
                },
                400
            );
        }

        /*
         * Send through Resend
         */
        const resendResponse = await fetch(
            RESEND_API_URL,
            {
                method: 'POST',

                headers: {
                    'Authorization':
                        `Bearer ${env.RESEND_API_KEY}`,

                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    from: env.RESEND_FROM_EMAIL,
                    to: [TO_EMAIL],

                    reply_to: email,

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
                Sent from amit13091992.github.io
              </p>

            </div>
          `
                })
            }
        );

        if (!resendResponse.ok) {

            const errorText =
                await resendResponse.text();

            console.error(
                'Resend error:',
                errorText
            );

            return jsonResponse(
                {
                    message:
                        'Email service failed.'
                },
                502
            );
        }

        return jsonResponse({
            success: true,
            message: 'Message sent successfully.'
        });
    }
};


/*
 * Prevent user-entered HTML from being
 * inserted into the email HTML.
 */
function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}