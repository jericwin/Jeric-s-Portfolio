# Jeric Punay — Portfolio

Static portfolio (`index.html` + `assets/`) with a small Node backend (`api/contact.js`)
that emails contact-form messages to Gmail.

## Contact form setup (Gmail)

1. Turn on 2-Step Verification for the Gmail account:
   Google Account → Security → 2-Step Verification.
2. Create an App password: Google Account → Security → App passwords
   (or https://myaccount.google.com/apppasswords). Copy the 16-character password.
3. Set these environment variables wherever the site runs:
   - `GMAIL_USER` = `punay.jeric@gmail.com`
   - `GMAIL_APP_PASSWORD` = the App password from step 2
   - `CONTACT_TO` (optional) = inbox that receives messages, defaults to `GMAIL_USER`

## Run locally

```bash
npm install
cp .env.example .env   # then paste your App password into .env
npm start              # http://localhost:3000
```

## Deploy

- **Vercel (recommended):** import the GitHub repo, framework preset "Other", add the
  environment variables above, deploy. Vercel serves `index.html` and runs `api/contact.js`.
- **Render:** create a Web Service from the repo, build command `npm install`,
  start command `npm start`, add the environment variables.
- **GitHub Pages** can't run the backend. The site still works there, but the form falls back
  to opening the visitor's email app.
