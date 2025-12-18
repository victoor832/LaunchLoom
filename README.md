<div align="center">
<img width="1200" height="475" alt="LaunchLoom" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LaunchLoom - Your 30-Day SaaS Launch Plan

Generate personalized, AI-powered launch checklists for your SaaS product. Get a day-by-day roadmap from positioning to Product Hunt.

[View Live Demo](https://launchloom.ai)

## Features

- 🎯 **30-Day Personalized Checklists** - AI-powered launch timelines tailored to your product
- 📧 **Email & Tweet Templates** - Pre-written content ready to customize
- 🚀 **Product Hunt Playbook** - Specific tactics for maximum visibility
- 📊 **Multiple Tiers** - Free, Standard, and Pro+ plans for every stage
- 🎨 **PDF Export** - Download your plan and share with your team

## Quick Start

### Prerequisites
- Node.js 16+ 
- pnpm (or npm/yarn)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/launchloom.git
   cd launchloom
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   - Copy `.env.example` to `.env.local`
   - Get your Gemini API key from [Google AI Studio](https://ai.google.dev/)
   - Add it to your `.env.local`:
   ```bash
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

## Project Structure

```
├── components/           # React components
│   ├── Header.tsx
│   ├── TierSelector.tsx
│   ├── FeatureComparison.tsx
│   ├── FAQSection.tsx
│   ├── PersonalizationForm.tsx
│   ├── SuccessView.tsx
│   └── ...
├── services/            # Business logic
│   ├── geminiService.ts # AI integration
│   └── pdfService.ts    # PDF generation
├── types.ts             # TypeScript definitions
├── constants.ts         # Configuration
└── App.tsx              # Main app component
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `VITE_STRIPE_PUBLIC_KEY` | No | Stripe public key (future implementation) |
| `VITE_API_BASE_URL` | No | Backend API URL |
| `VITE_APP_ENV` | No | `development` or `production` |

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally

## Pricing Tiers

| Feature | Free | Standard | Pro+ |
|---------|------|----------|------|
| Price | $0 | $9/mo | $15/mo |
| Checklist Items | 20 | 50 | Unlimited |
| Custom Templates | ❌ | ✅ | ✅ |
| Email Templates | ❌ | 5 | Unlimited |
| Tweet Templates | ❌ | 15 | Unlimited |
| Team Seats | 1 | 1 | 3 |
| Support | Community | Email | 24/7 Chat |

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **AI**: Google Gemini API
- **PDF**: jsPDF
- **Forms**: React Hook Form
- **Build**: Vite

## API Integration

### Gemini API

The app uses Google's Gemini API to generate personalized launch plans. Make sure you have:
- A valid Gemini API key
- Appropriate API quotas enabled

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
vercel
```

### Netlify

1. Connect your GitHub repo
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify settings
5. Deploy!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "preview"]
```

## Roadmap

- [ ] Stripe payment integration
- [ ] User authentication & database
- [ ] Chat support for Pro+ tier
- [ ] Team collaboration features
- [ ] Analytics dashboard
- [ ] API for custom integrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

- 📧 Email: support@launchloom.ai
- 🐦 Twitter: [@launchloom](https://twitter.com/launchloom)
- 💬 Discord: [Join our community](https://discord.gg/launchloom)

---

Made with 🚀 by the LaunchLoom team
# LaunchLoom
