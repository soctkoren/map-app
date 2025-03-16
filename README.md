# Momenti Maps

Create beautiful map prints with customizable text and icons. This interactive web application allows you to design custom map prints with various styles, text overlays, and icons.

## Features

- 🗺️ Interactive map with multiple style options
- 📝 Add and customize text overlays
- 🎨 Add and customize icons
- 📏 Multiple print size options
- 🖼️ Beautiful background options
- 📱 Responsive design
- 🔄 Real-time preview

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/soctkoren/map-app.git
cd map-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Deployment to GitHub Pages

The application is configured to deploy to GitHub Pages. Follow these steps to deploy:

1. Make sure your GitHub repository is set up:
   - The repository should be named `map-app`
   - Your GitHub username should match the one in package.json's homepage URL
   - The repository should be public

2. Configure GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" in the sidebar
   - Under "Source", select "Deploy from a branch"
   - Select the "gh-pages" branch and "/(root)" folder
   - Click "Save"

3. Deploy the application:
```bash
npm run deploy
```

This will:
- Build your application
- Create/update the gh-pages branch
- Push the built files to GitHub
- Deploy to GitHub Pages

Your application will be available at: `https://[your-github-username].github.io/map-app`

### Troubleshooting Deployment

If you encounter issues:

1. Check that your repository name matches the homepage URL in package.json
2. Ensure you have proper write permissions to the repository
3. Clear your browser cache after deployment
4. Wait a few minutes for GitHub Pages to update

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages

### Project Structure

```
map-app/
├── src/
│   ├── components/     # React components
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── package.json       # Project configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [Leaflet](https://leafletjs.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
