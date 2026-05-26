# 🎓 Campus Farewell Board

A real-time, anonymous campus engagement platform built for graduating students. Leave a legacy, drop a confession, create interactive polls, and anonymously rate your peers on a unified, high-fidelity glassmorphic feed.

## 🚀 Features

- **Unified Live Feed**: A centralized scrolling feed that aggregates anonymous confessions, interactive polls, and peer ratings in real-time.
- **Ghost Identities**: Users adopt a permanent, session-based "Ghost Alias" ensuring complete anonymity while maintaining consistent interactions across the platform.
- **Anonymous Confessions**: Drop your deepest secrets, farewell messages, or shoutouts to classmates. 
- **Peer Ratings & Leaderboards**: Drop an anonymous score out of 5 stars for your classmates. View the aggregate averages and see who tops the leaderboard.
- **Interactive Polls**: Deploy custom polls to the timeline and let the campus vote.
- **Live Reactions & Comments**: Engage with the feed through dynamic emoji reactions and threaded comments.
- **Glassmorphic UI**: Premium "Dark Acid Glass" design utilizing Framer Motion micro-animations and Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: MongoDB (Mongoose ORM)
- **Styling**: Tailwind CSS & Framer Motion
- **Icons**: Lucide React

## 💻 Running Locally

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/Uzair42/Anonymous_Coffession_RatingGame-.git
cd farewell-web
npm install
```

Next, create a `.env.local` file in the root directory and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/farewell?retryWrites=true&w=majority
NEXTAUTH_SECRET=your_super_secret_string
NEXTAUTH_URL=http://localhost:3000
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the void.

## 🌐 Deploying to Vercel

1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Go to **Environment Variables** and add all the keys from your `.env.local` file.
5. Click **Deploy**.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
