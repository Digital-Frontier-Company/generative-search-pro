# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4a5a0399-25bc-4569-b471-eaf5f8a075be

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4a5a0399-25bc-4569-b471-eaf5f8a075be) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4a5a0399-25bc-4569-b471-eaf5f8a075be) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## New Features

### Progressive Web App (PWA)
This project now ships a Web App Manifest (`public/manifest.webmanifest`) with icons, theme and background colours. When you "Add to Home Screen" you’ll get a stand-alone experience with the brand colours applied.

### Accessibility – Skip Link
A `<SkipLink />` component is mounted near the top of the DOM (see `src/App.tsx`).   It’s hidden off-screen until focused, then becomes visible so keyboard users can jump directly to the `#main-content` landmark.

### Optimized Images
Use the `OptimizedImage` wrapper (`src/components/ui/OptimizedImage.tsx`) instead of raw `<img>` tags.  It adds lazy-loading and can be extended later for src-set, placeholders, etc.
