# Chicago Artist Guide

## Frontend App

This is a React and TypeScript application hosted by Next.js. The existing
React Router application is mounted as a client-rendered compatibility shell;
route-by-route server rendering is tracked separately in DEV-492.

### Local development

Use the pinned Node 22 release:

```bash
nvm install
nvm use
npm ci
npm run dev
```

The app is available at <http://localhost:3000>. Production commands are
`npm run build` and `npm start`. The previous Vite host remains available
during migration through `npm run start:legacy`, `npm run build:legacy`, and
`npm run preview:legacy`.

### Public environment variables

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_LGL_API_KEY
```

These values configure browser clients and are not secrets. Next.js embeds
`NEXT_PUBLIC_*` values into the client bundle at build time, so staging and
production images must be built with their environment's values. The legacy
Vite build also accepts the old `VITE_APP_*` names and maps them to this public
configuration boundary.

Firebase remains the backend and authentication provider during this phase.
No database or authentication migration is performed by the compatibility
host.

### Health and container contracts

- `GET /api/health/live` returns `{ "status": "ok" }`.
- `GET /api/health/ready` returns `{ "status": "ready" }`.
- Neither endpoint depends on Firebase or another external provider.

Build and exercise the production container with:

```bash
docker build --tag cag-frontend:local .
docker run --rm --publish 3000:3000 cag-frontend:local
BASE_URL=http://127.0.0.1:3000 npm run smoke:server
```

The image runs as a non-root user. Pull requests targeting `staging` or
`master` run lint, tests, the standalone build, the live smoke check, and a
credential-free Docker build. The workflow does not deploy or request AWS
credentials.

### Pull Requests (PRs)

We have standard guidelines for contributing code to the project.

1. Fork the repo to your own GitHub. You should now have a repo in your account called `<your-username>/frontend-cag`.
2. Clone that repo locally to your machine: `git clone git@github.com:<your-username>/frontend-cag.git` and then `cd frontend-cag`
3. Add the org's repo as `upstream`: `git remote add upstream git@github.com:Chicago-Artist-Guide/frontend-cag.git`
4. Create a branch off of `master` named after your JIRA ticket. For example, let's say you have JIRA ticket #125, you'd do: `git pull upstream master` on master, and then `git checkout -b dev125`
5. Contribute changes as commits to your local branch `dev125`. For new files, `git add .`, and then to add commit messages: `git commit -am "<your commit message here>"`. Your commit messages don't matter too much here because we're going to Squash and Merge later, anyway.
6. When you're ready to PR your changes, push: `git push origin dev125`
6. Go to the Chicago-Artist-Guide/frontend-cag repo in GitHub and a message should pop up recognizing your new branch. Click on `Compare & Pull Request`
7. Pull Requests must have:
	- A title formatted like so: `[DEV-XXX] Some Descriptive Title`
	- A description of the changes
	- Screenshots of the changes, if applicable
8. Your PR must be reviewed by one or both of the tech leads, depending on magnitude and/or who is available
9. Once you have your approval(s), all comments have been addressed, and tests are passing, you may click on, `Squash and Merge`. Please make sure the commit title is the same as the PR title

PR tips:
1. The smaller, the better. Smaller PRs help tech leads and team members do a better job of reviewing your code and is more respectful of everyone's time
2. Do not commit a package-lock.json file unless you've explicitly made changes to package.json
3. Do not commit and PR _any_ potentially sensitive or insecure information, keys, etc. Please confirm with the tech leads if you have a question about something being sensitive prior to it being in a commit
4. Please follow linting rules. Make sure indentation is 2 spaces, general code style is consistent/cohesive, attributes and properties are ordered alphabetically, and so forth
5. Please remind tech leads and team members in Slack if you need reviews and haven't received any

**Warning:** commits to master trigger a push and build on production in AWS. Do not merge if you have any concerns about the branch breaking something. In some cases, we may work off of specific feature branches as an extra layer of protection, so please pay attention in those situations to use the feature branches instead of master.
