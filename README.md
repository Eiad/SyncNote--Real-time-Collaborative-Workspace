# SyncNote - Real-time Collaborative Workspace 🚀



> 🌟 **Try SyncNote now at [syncnote.devloom.net](https://syncnote.devloom.net)** 🌟

&nbsp;
&nbsp;
<img src="public/assets/syncnote-screenshot.png" alt="SyncNote" width="600"/>

SyncNote is a powerful real-time collaborative platform designed for seamless text and media sharing. Built with Next.js and Firebase, it offers a robust solution for teams and individuals who need to share and sync content instantly across devices.

## ✨ Key Features

- **Real-time Synchronization**: Instantly sync text and media across all connected devices
- **Smart Media Handling**: 
  - Drag & drop upload
  - Direct paste support (Ctrl/Cmd + V)
  - Multiple file uploads
  - Image preview and full-screen view
- **Secure Authentication**:
  - Google Sign-in
  - Custom authentication system
- **Responsive Design**: Seamless experience across all devices
- **Dark Mode Support**: Automatic theme switching based on system preferences

## 🛠 Tech Stack

- **Frontend**: Next.js 15.0
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Media Storage**: Cloudinary
- **Styling**: SCSS Modules
- **Icons**: React Icons

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/syncnote.git
cd syncnote
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your_api_secret
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3005](http://localhost:3005) to see your app.

## 📱 Mobile Support

SyncNote is fully responsive and provides a native-like experience on mobile devices:
- Optimized media grid layout
- Touch-friendly interface
- Adaptive UI components

## 🔒 Security

- Secure authentication flow
- Protected API routes
- Firestore security rules implementation
- Safe media upload handling

## 🎯 Use Cases

- **Team Collaboration**: Share notes and media in real-time
- **Personal Workspace**: Sync content across your devices
- **Project Management**: Keep track of ideas and visual assets
- **Content Creation**: Organize and share media efficiently

## 📄 License

Copyright © 2024 SyncNote. All rights reserved.

## 💼 Enterprise Support

For enterprise support, custom features, or dedicated hosting, please contact our team at [support@devloom.net](mailto:support@devloom.net)

---

<p align="center">Built with ❤️ by <a href="https://github.com/Eiad">Ash</a></p>