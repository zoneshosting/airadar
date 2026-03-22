# AIRadar — Daily AI Intelligence Hub

AIRadar is a standalone, client-side dashboard that aggregates the latest signals from the AI frontier. 

## 🚀 Features

- **GitHub AI Projects**: Tracks trending AI repositories, filtering by stars, languages, and specific AI categories.
- **Hugging Face Hub**: Showcases top trending AI models, spaces, and datasets directly from the Hugging Face API.
- **AI News Aggregator**: Scrapes the latest updates and announcements from major AI providers, including OpenAI, Anthropic, Google AI, Meta AI, Mistral, and Hugging Face.
- **Trending Skills**: Analyzes repository topics and models to provide insights into top trending development skills and momentum.
- **100% Client-Side**: Operates entirely in the browser using free public APIs, without needing a backend server or database. It caches snapshots in LocalStorage to operate seamlessly and quickly.
- **Futuristic UI/UX**: Built with a sleek dark aesthetic, glassmorphism, smooth animations, and interactive graphics without using any frameworks.

## 🛠️ Tech Stack

- **HTML5:** Semantic structure with single-file architecture.
- **Vanilla CSS:** Custom design system without Tailwind or preprocessors. Features CSS variables for theming, responsive grids, and keyframe animations.
- **Vanilla JavaScript:** Zero unneeded dependencies, Native DOM APIs, Web Workers for smooth heavy filtering, local storage for offline support and daily snapshots.
  
## ⚡ Getting Started

1. Clone the repository.
   ```bash
   git clone https://github.com/zoneshosting/airadar.git
   ```
2. Simply open `index.html` in your favorite modern browser, or serve it via a local static server. For development with Netlify functions:
   ```bash
   netlify dev
   ```

Deploying to Netlify automatically configures the GitHub API token proxy using the `netlify/functions/github-proxy.js` to ensure stability and reduce GitHub API rate limits.
