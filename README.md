# Surveys of Consumers · Explainer review

A passphrase-protected draft explainer hosted on GitHub Pages.

Preview URL: https://stone-cid.github.io/surveyscon-explainer/

## Protection

The original self-contained HTML is encrypted with AES-256-GCM. The browser derives its decryption key from the entered passphrase using PBKDF2-HMAC-SHA-256 (600,000 iterations, a random 16-byte salt, and a random 12-byte IV). The passphrase and readable HTML are never committed. Only logos, the Work Sans font, entry-page code, and ciphertext are public.

The browser decrypts the explainer in memory after a correct entry. No passphrase or key is saved in cookies, local storage, or session storage. Reloading requires the passphrase again. The entry page requests no indexing; this is separate from the encryption.

This is shared-passphrase encryption, not server-side authentication. Anyone with the passphrase can open, save, and share the explainer. Public ciphertext can be used for offline password guessing; use a stronger passphrase or authenticated hosting for sensitive material.

## Update the explainer

Keep the readable source outside this repository. From this repository, run:

```sh
node scripts/encrypt.mjs /absolute/path/to/updated-explainer.html
```

Enter the passphrase at the hidden prompt. The script writes a new `content.enc.json` with fresh randomness. To change the passphrase, run the same command with a new one; this does not revoke copies already downloaded or earlier versions of the encrypted file.

Commit the updated ciphertext to `main`. GitHub Pages publishes from the repository root. Check wrong-passphrase rejection, correct-passphrase access, and refresh behavior after an update.

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/. HTTPS is required when hosted; localhost is permitted by browser Web Crypto implementations. The alias `CID-surveyscon-exp.html` displays the same protected entry page as the root URL.
