# 🎁 Birthday Gift Website — React (Vite)

A beautiful, shareable birthday gift website built with **React + Vite + TypeScript**.
Each customer gets a personalized link like `yourdomain.com/gift/aya`.

---

## 🚀 Quick Start (Local)

```bash
npm install
npm run dev
# Open: http://localhost:3000/gift/aya
```

---

## 📁 Project Structure

```
birthday-gift/
├── index.html              # HTML entry template
├── vite.config.ts          # Vite configuration
├── src/
│   ├── main.tsx            # React application root
│   ├── App.tsx             # Routes configuration
│   ├── pages/
│   │   └── GiftPage.tsx    # Dynamic gift route (/gift/:id)
│   ├── components/
│   │   ├── GiftClient.tsx  # Main interactive component (Questions, Letter, Music Player)
│   │   └── NotFound.tsx    # 404 Not Found component
│   ├── lib/
│   │   └── giftData.ts     # ⭐ EDIT HERE — all customer data & messages
│   └── styles/
│       └── globals.css     # Dark theme styles, vinyl animation & fonts
└── public/
    ├── images/             # ⭐ PUT IMAGES HERE
    └── audio/              # ⭐ PUT AUDIO FILES HERE
```

---

## ✏️ Adding a New Customer

### Step 1 — Add their images
Place their images in `/public/images/`:
- `envelope-sara.png` — the intro envelope image
- `birthday-sara.png` — the main birthday card image

### Step 2 — Edit `src/lib/giftData.ts`
```ts
sara: {
  name: "Sara",
  envelopeImage: "/images/envelope-sara.png",
  birthdayImage: "/images/birthday-sara.png",
  accentColor: "#9ca3af",   // optional: theme color
  musicUrl: "",             // optional: link to an .mp3 file
  message: `Your message here...`,
},
```

### Step 3 — Share the link
```
yourdomain.com/gift/sara
```

That's it! 🎉

---

## 🌐 Deploy to Vercel (Step-by-Step)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOURUSERNAME/birthday-gift.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → Log in
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Framework: **Vite** (auto-detected)
   - Click **Deploy** ✅

---

## 🛠 Tech Stack

- **React 18**
- **Vite**
- **TypeScript**
- **React Router 6**
- **Pure CSS** (No heavy UI frameworks)
- **Canvas API** (Confetti)
- **Google Fonts** (Nunito, Tajawal, Caveat)
