# 🚀 PairUp

**PairUp** is a smart teammate matchmaking platform that helps developers find the right people to build projects or team up for hackathons — based on skills, compatibility, and goals.

---

## 🌟 Problem

Finding the right teammates for projects or hackathons is difficult:

* People have mismatched skills
* Availability is unclear
* Communication starts randomly
* No structured way to evaluate compatibility

---

## 💡 Solution

PairUp solves this by providing a **smart, swipe-based platform** where users can:

* Discover potential teammates
* Match based on compatibility
* Communicate efficiently
* Build stronger, more balanced teams

---

## ✨ Features

### 🔥 1. Swipe-Based Discovery

* Tinder-style interface for browsing profiles
* Like (match) or skip users quickly
* Clean and intuitive UX

---

### 🧠 2. Compatibility Score

* Each profile shows a **compatibility percentage**
* Based on:

  * Skills
  * Tech stack
  * Availability
  * Experience

---

### 💬 3. Real-Time Chat

* Chat instantly after matching
* Messages sync across devices
* Structured communication flow

---

### ⚡ 4. Quick Pitch Questions

* Predefined questions like:

  * “What role will you take?”
  * “How many hours can you commit?”
  * “Have you worked on projects before?”
* Eliminates random and inefficient conversations

---

### 🛠️ 5. Project Mode

* Find teammates for:

  * Side projects
  * Startups
  * Long-term collaboration

---

### 🏆 6. Hackathon Mode

* Select a hackathon from dropdown
* See only users participating in that event
* Form teams specifically for competitions

---

### 🌍 7. Location-Based Matching

* Filter users by location
* Build teams locally or globally

---

### 👤 8. Profile Creation

Users can create and edit their profile with:

* Name
* Bio / Description
* Skills
* Availability
* Location
* Hackathon preference

---

### 🖼️ 9. Image Upload (Live Preview)

* Upload profile picture
* Instant preview without backend

---

### 📄 10. Resume Integration

* Attach resume to profile
* “View Resume” button opens file instantly
* Helps evaluate teammates professionally

---

### 🔐 11. Authentication

* Secure login system using Firebase:

  * Email & Password
  * Google Sign-In
* Persistent login sessions

---

### ☁️ 12. Real-Time Multi-User System

* Profiles visible across devices
* Live updates using Firebase
* Multi-user interaction supported

---

### 🤖 13. Smart Auto Replies (Demo Profiles)

* Demo profiles respond intelligently
* Based on keywords (role, time, experience)
* Simulates AI-like interaction

---

### 🎨 14. Modern UI/UX

* Light cyan theme
* Clean card layout
* Smooth interactions
* Red shadow highlights for emphasis

---

## 🧰 Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Firebase (Auth + Firestore)
* **Design:** Tailwind-inspired styling
* **Architecture:** Modular JS structure

---

## 📦 Project Structure

```
PairUp/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── chat.js
│   ├── profile.js
├── firebase/
│   ├── config.js
│   ├── auth.js
│   ├── db.js
├── assets/
│   ├── images/
├── README.md
```

---

## 🚀 How It Works

1. User signs up / logs in
2. Creates a profile
3. Selects project mode or hackathon mode
4. Swipes through potential teammates
5. Matches with compatible users
6. Starts chatting instantly
7. Builds a team

---

## 🎯 Demo Flow

* Login → Create profile
* Select hackathon
* Filter by location
* Swipe → Match
* Open chat → Send quick question
* View resume

---

## 🔒 Security

* Firebase Authentication for secure login
* Firestore rules restrict access to authenticated users
* Sensitive data handled responsibly

---

## 🌍 Future Scope

* AI-powered matching algorithm
* Video profile pitches
* Team auto-generation
* Skill verification system
* Mobile app version

---

## 🏆 Built For

Hackathons, developers, and builders who want to **find the right people and build faster together**.

---

## 💬 Tagline

**“Find your perfect build partner.”**
