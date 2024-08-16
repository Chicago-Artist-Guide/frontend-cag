# Chicago Artist Guide
## Frontend App

This is a React application using TypeScript, Bootstrap, and Styled-Components.

### Instructions

Before you run this app, make sure you're using Node Version Manager (NVM) and are using at least Node v18.13.0 (`nvm install 18.13.0` and `nvm use 18.13.0`)

**Running this app:**
1. `npm install`
2. `npm run start`
3. Now access the app at http://localhost:3000 (should open automatically). Editing files should automatically build and hot-reload the page

**Environment Variables:**

```
VITE_APP_FIREBASE_API_KEY
VITE_APP_FIREBASE_PROJECT_ID
VITE_APP_FIREBASE_SENDER_ID
VITE_APP_FIREBASE_APP_ID
VITE_APP_FIREBASE_MID
VITE_APP_LGL_API_KEY
```

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
