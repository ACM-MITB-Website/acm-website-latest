/**
 * SECURITY: Cloudinary Upload Proxy (Vercel Serverless Function)
 *
 * WHY THIS EXISTS:
 * Cloudinary requires an "upload preset" to authorise unsigned uploads.
 * If that preset is embedded in client-side JS (via VITE_CLOUDINARY_UPLOAD_PRESET),
 * anyone who reads the browser bundle can upload arbitrary files to our
 * Cloudinary account — bypassing any app-level guards.
 *
 * This API route keeps the upload preset and API secret server-side.
 * The client sends only the raw image binary; this function signs the
 * request with CLOUDINARY_API_SECRET and forwards it to Cloudinary.
 * The response returned to the client contains ONLY the secure_url —
 * never any credentials.
 *
 * REQUIRED ENVIRONMENT VARIABLES (set in Vercel dashboard, NOT prefixed VITE_):
 *   CLOUDINARY_CLOUD_NAME   — your Cloudinary cloud name
 *   CLOUDINARY_API_KEY      — your Cloudinary API key (not the secret)
 *   CLOUDINARY_API_SECRET   — your Cloudinary API secret (never expose client-side)
 *   CLOUDINARY_UPLOAD_PRESET — the upload preset name (kept server-side)
 */

import crypto from 'crypto';

// Vercel serverless functions use Node.js runtime by default.
// The Content-Type will be multipart/form-data sent from the browser.

export const config = {
  // Allow Vercel to parse the incoming body as a stream (needed for file uploads)
  api: {
    bodyParser: false,
  },
};

/**
 * Generate a Cloudinary signed upload signature.
 * @param {Record<string, string>} params  – parameters to sign (excluding api_key & file)
 * @param {string} apiSecret               – your CLOUDINARY_API_SECRET
 * @returns {string} hex SHA-1 signature
 */
function generateSignature(params, apiSecret) {
  // Sort params alphabetically and build the string to sign
  const sortedKeys = Object.keys(params).sort();
  const signString = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto
    .createHash('sha1')
    .update(signString + apiSecret)
    .digest('hex');
}

/**
 * Read the raw request body as a Buffer (needed since bodyParser is disabled).
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // SECURITY: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_UPLOAD_PRESET,
  } = process.env;

  // Validate that all required server-side env vars are present
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_UPLOAD_PRESET) {
    console.error(
      '[upload-image] Missing one or more required Cloudinary environment variables.',
    );
    return res.status(500).json({ error: 'Server misconfiguration: Cloudinary credentials missing.' });
  }

  try {
    // Read the raw multipart body forwarded from the client
    const rawBody = await readBody(req);
    const contentType = req.headers['content-type'] || '';

    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Build parameters for the signed request
    // Note: 'folder' is parsed from query string so the client can specify it
    const folder = (req.query && req.query.folder) ? req.query.folder : 'uploads';

    const paramsToSign = {
      folder,
      timestamp,
      upload_preset: CLOUDINARY_UPLOAD_PRESET,
    };

    const signature = generateSignature(paramsToSign, CLOUDINARY_API_SECRET);

    // Build a new multipart body to forward to Cloudinary, appending auth fields.
    // We reconstruct the FormData so we can inject api_key, signature, and timestamp
    // without them being visible to the browser.

    // Parse the incoming multipart boundary from content-type header
    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'Invalid multipart request: no boundary.' });
    }
    const boundary = boundaryMatch[1];

    // Append our auth fields as extra multipart parts after the raw body
    const CRLF = '\r\n';
    const authParts = [
      `--${boundary}${CRLF}Content-Disposition: form-data; name="api_key"${CRLF}${CRLF}${CLOUDINARY_API_KEY}`,
      `--${boundary}${CRLF}Content-Disposition: form-data; name="timestamp"${CRLF}${CRLF}${timestamp}`,
      `--${boundary}${CRLF}Content-Disposition: form-data; name="signature"${CRLF}${CRLF}${signature}`,
      `--${boundary}${CRLF}Content-Disposition: form-data; name="folder"${CRLF}${CRLF}${folder}`,
      `--${boundary}${CRLF}Content-Disposition: form-data; name="upload_preset"${CRLF}${CRLF}${CLOUDINARY_UPLOAD_PRESET}`,
    ];

    // The original body ends with --boundary--\r\n; strip the closing delimiter
    // and re-append after our extra fields
    const closingDelimiter = Buffer.from(`--${boundary}--${CRLF}`);
    let bodyWithoutClose = rawBody;
    if (rawBody.slice(-closingDelimiter.length).equals(closingDelimiter)) {
      bodyWithoutClose = rawBody.slice(0, rawBody.length - closingDelimiter.length);
    }

    const extraPartsBuffer = Buffer.from(
      CRLF + authParts.join(CRLF) + CRLF + `--${boundary}--${CRLF}`,
    );
    const finalBody = Buffer.concat([bodyWithoutClose, extraPartsBuffer]);

    // Forward the assembled request to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Content-Length': finalBody.length.toString(),
      },
      body: finalBody,
    });

    const data = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      console.error('[upload-image] Cloudinary rejected the upload:', data.error);
      return res.status(cloudinaryResponse.status).json({
        error: data.error?.message || 'Upload failed.',
      });
    }

    // SECURITY: Return ONLY the public URL — never echo back any credentials
    return res.status(200).json({ secure_url: data.secure_url });

  } catch (err) {
    console.error('[upload-image] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error during upload.' });
  }
}
