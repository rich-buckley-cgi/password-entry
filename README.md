# Password Entry Proof of Concept

This project is a proof of concept for a new, innovative password entry technique.

It is **not** intended to be used to protect anything secure at this stage. A real system would validate the entered password using a backend API rather than a hard-coded value in the client.

## Run locally

Serve the static files with a simple server, for example:

```sh
npx serve .
```

## GitHub Pages

Push to the `main` branch, then in your repository settings enable GitHub Pages to deploy from GitHub Actions. The workflow in `.github/workflows/pages.yml` will publish the site.
