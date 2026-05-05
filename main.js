import { auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "./firebase/auth.js";
import { db, doc, setDoc, updateDoc, collection, getDocs, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit } from "./firebase/db.js";

// Maintain global exposure for any legacy code (non-module) if necessary
window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.updateDoc = updateDoc;
window.collection = collection;
window.getDocs = getDocs;
window.addDoc = addDoc;
window.query = query;
window.where = where;
window.orderBy = orderBy;
window.onSnapshot = onSnapshot;
window.serverTimestamp = serverTimestamp;
window.limit = limit;
window.auth = auth;

console.log("Main module loaded");

const authView = document.getElementById('auth-view');
const mainApp = document.getElementById('main-app');

// Auth UI elements
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const btnAuthAction = document.getElementById('btn-auth-action');
const btnAuthGoogle = document.getElementById('btn-auth-google');
const btnAuthSkip = document.getElementById('btn-auth-skip');
const btnAuthToggle = document.getElementById('btn-auth-toggle');
const authSubtitle = document.getElementById('auth-subtitle');
const authToggleText = document.getElementById('auth-toggle-text');

let isLoginMode = true;

// Toggle Login / Signup UI
btnAuthToggle.addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  if (isLoginMode) {
    btnAuthAction.textContent = "Sign In";
    authSubtitle.textContent = "Sign in to find your dev match";
    authToggleText.textContent = "Don't have an account?";
    btnAuthToggle.textContent = "Sign up";
  } else {
    btnAuthAction.textContent = "Sign Up";
    authSubtitle.textContent = "Create an account to start pairing";
    authToggleText.textContent = "Already have an account?";
    btnAuthToggle.textContent = "Sign in";
  }
});

// Handle Email/Password Action
btnAuthAction.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Please enter email and password");

  try {
    if (isLoginMode) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // Save basic profile to Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        email: userCred.user.email,
        name: email.split('@')[0], // placeholder name
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    alert("Auth Error: " + error.message);
  }
});

// Handle Google Sign-In
btnAuthGoogle.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    const userCred = await signInWithPopup(auth, provider);
    await setDoc(doc(db, "users", userCred.user.uid), {
      uid: userCred.user.uid,
      email: userCred.user.email,
      name: userCred.user.displayName,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    alert("Google Sign-In Error: " + error.message);
  }
});

// Skip Login (Demo Mode)
btnAuthSkip.addEventListener('click', () => {
  authView.classList.add('hidden');
  mainApp.classList.remove('hidden');
  mainApp.classList.add('flex');
});

const SEED_USERS = [
  { uid: 'demo_arjun', name: 'Arjun Mehta', bio: 'Full-Stack Engineer building scalable SaaS products.', image: 'assets/avatar_arjun.png', skills: ['React', 'Node.js', 'AWS'], location: 'India', selectedHackathon: 'Smart India Hackathon', resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { uid: 'demo_priya', name: 'Priya Sharma', bio: 'AI Researcher & Data Scientist. Loves Python.', image: 'assets/avatar_priya.png', skills: ['Python', 'TensorFlow', 'SQL'], location: 'India', selectedHackathon: 'Devfolio Hackathon', resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { uid: 'demo_rohan', name: 'Rohan Das', bio: 'Mobile Dev passionate about Flutter and UI.', image: 'assets/avatar_rohan.png', skills: ['Flutter', 'Dart', 'Firebase'], location: 'India', selectedHackathon: 'HackMIT', resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { uid: 'demo_meera', name: 'Meera Iyer', bio: 'Cloud Architect focused on serverless infra.', image: 'assets/avatar_meera.png', skills: ['Go', 'Kubernetes', 'GCP'], location: 'USA', selectedHackathon: 'ETHGlobal', resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { uid: 'demo_dev', name: 'Dev Patel', bio: 'Cybersecurity Analyst & Ethical Hacker.', image: 'assets/avatar_dev.png', skills: ['C++', 'Rust', 'Linux'], location: 'Europe', selectedHackathon: 'Smart India Hackathon', resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { uid: 'demo_ananya', name: 'Ananya Rao', bio: 'UI/UX Designer who loves clean, bold aesthetics.', image: 'assets/avatar_ananya.png', skills: ['Figma', 'CSS', 'Tailwind'], location: 'Remote', selectedHackathon: 'Devfolio Hackathon', resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
];

async function seedDemoUsers() {
  console.log("Ensuring demo users are seeded in Firestore...");
  try {
    for (const user of SEED_USERS) {
      // Use setDoc with merge:true to avoid overwriting or duplicates
      await setDoc(doc(db, "users", user.uid), {
        ...user,
        isDemo: true,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.error("Error seeding demo users:", err);
  }
}

// Listen to Auth State
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authView.classList.add('hidden');
    mainApp.classList.remove('hidden');
    mainApp.classList.add('flex');
    window.currentUserUid = user.uid;
    
    // Seed demo users before loading profiles
    await seedDemoUsers();
    if (window.initAppAfterLogin) window.initAppAfterLogin();
  } else {
    mainApp.classList.remove('flex');
    mainApp.classList.add('hidden');
    authView.classList.remove('hidden');
    window.currentUserUid = null;
  }
});

// Global logout function
window.logoutFirebase = () => {
  signOut(auth);
};

// ── Main App Logic ─────────────────────────────
let allProfiles = [];
let profiles = [];
let currentMode = 'project';
let currentIndex = 0;

window.initAppAfterLogin = async () => {
  console.log("Fetching users from Firestore...");
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const fetchedUsers = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.uid !== window.currentUserUid) {
        fetchedUsers.push({
          uid: data.uid,
          name: data.name || 'Anonymous Developer',
          role: 'Developer',
          avatar: data.image || 'assets/avatar_arjun.png',
          skills: data.skills || ['JavaScript', 'HTML', 'CSS'],
          techStack: ['Firebase', 'Web'], 
          bio: data.bio || 'Ready to build something amazing!',
          match: Math.floor(Math.random() * 20) + 80, 
          location: data.location || 'Remote',
          experience: 'Dev',
          availability: 'Flexible',
          selectedHackathon: data.selectedHackathon || '',
          resumeLink: data.resumeLink || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          compat: { skill: 85, availability: 90, techStack: 88 },
          likedYou: Math.random() > 0.5, 
        });
      }
    });
    
    console.log(`Fetched ${fetchedUsers.length} other users from Firestore.`);
    allProfiles = fetchedUsers;
    profiles = fetchedUsers; 
    currentIndex = 0;
    renderCard(currentIndex);
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};

// ── Match & like tracking ────────────────────
const likedProfiles = new Set();   // names you swiped right on
const matchedProfiles = new Set(); // names with mutual match

function getProfileByName(name) {
  return allProfiles.find(p => p.name === name);
}
const cardArea = document.getElementById('card-area');
const btnSkip = document.getElementById('btn-skip');
const btnMatch = document.getElementById('btn-match');
const btnStar = document.getElementById('btn-star');
const matchOverlay = document.getElementById('match-overlay');
const matchName = document.getElementById('match-name');
const matchClose = document.getElementById('match-close');

// ── Modal elements ──────────────────────────
const profileModal = document.getElementById('profile-modal');
const modalSheet = document.getElementById('modal-sheet');
const modalClose = document.getElementById('modal-close');

// ── Render card ─────────────────────────────
function renderCard(index) {
  if (index >= profiles.length) {
    cardArea.innerHTML = `
      <div class="empty-state flex flex-col items-center gap-4 text-center">
        <span class="text-6xl">🚀</span>
        <h2 class="text-2xl font-bold text-[#800000]">You're all caught up!</h2>
        <p class="text-gray-400 max-w-xs">No more devs to discover right now. Check back later for fresh matches.</p>
      </div>`;
    document.getElementById('action-buttons').style.visibility = 'hidden';
    return;
  }

  const p = profiles[index];
  const matchColor = p.match >= 90 ? 'from-emerald-500 to-cyan-400' :
                      p.match >= 80 ? 'from-cyan-400 to-cyan-600' :
                                      'from-orange-400 to-rose-500';
  const card = document.createElement('div');
  card.id = 'active-card';
  card.className = 'card-enter w-full rounded-[28px] glass overflow-hidden shadow-xl shadow-cyan-900/5';
  card.innerHTML = `
    <!-- Avatar -->
    <div class="relative">
      <img src="${p.avatar}" alt="${p.name}" class="w-full h-64 object-cover object-top" />
      <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
      <!-- Match badge -->
      <div class="badge-pulse absolute top-4 right-4 px-4 py-1.5 rounded-full bg-gradient-to-r ${matchColor} text-[#800000] text-sm font-bold shadow-lg flex items-center gap-1.5">
        🔥 ${p.match}% Match
      </div>
      <!-- Location -->
      <div class="absolute bottom-4 left-5 flex items-center gap-1.5 text-slate-500 text-xs font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        ${p.location}
      </div>
    </div>
    <!-- Info -->
    <div class="px-5 pt-4 pb-5 flex flex-col gap-3">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-xl font-bold text-slate-900">${p.name}</h2>
          <p class="text-sm text-cyan-600 font-medium">${p.selectedHackathon || p.role}</p>
        </div>
        <button onclick="window.open('${p.resumeLink}', '_blank')" class="px-3 py-1.5 glass text-[10px] font-bold text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors">CV</button>
      </div>
      <div class="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span>📍 ${p.location}</span>
      </div>
      <p class="text-sm text-slate-500 leading-relaxed line-clamp-2">${p.bio}</p>
      <div class="flex flex-wrap gap-2 mt-1">
        ${p.skills.map(s => `<span class="skill-tag px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600">${s}</span>`).join('')}
      </div>
    </div>`;

  cardArea.innerHTML = '';
  cardArea.appendChild(card);

  // Click card to open detail modal
  card.addEventListener('click', (e) => {
    // Don't open modal if user is swiping
    if (e.target.closest('button')) return;
    openProfileModal(index);
  });
  card.style.cursor = 'pointer';
}

// ── Profile detail modal ─────────────────────
function openProfileModal(index) {
  const p = profiles[index];
  if (!p) return;

  // Populate content
  document.getElementById('modal-avatar').src = p.avatar;
  document.getElementById('modal-avatar').alt = p.name;
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-role').textContent = p.role;
  document.getElementById('modal-location').textContent = p.location;
  document.getElementById('modal-bio').textContent = p.bio;
  document.getElementById('modal-experience').textContent = p.experience;
  document.getElementById('modal-availability').textContent = p.availability;
  document.getElementById('modal-match').textContent = p.match + '%';

  // Resume button update
  const resumeBtn = document.getElementById('modal-resume-btn');
  if (resumeBtn) resumeBtn.onclick = () => window.open(p.resumeLink, '_blank');

  // Skills
  document.getElementById('modal-skills').innerHTML = p.skills.map(s =>
    `<span class="skill-tag px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-700">${s}</span>`
  ).join('');

  // Tech stack
  document.getElementById('modal-techstack').innerHTML = p.techStack.map(t =>
    `<span class="skill-tag px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/20 text-teal-700">${t}</span>`
  ).join('');

  // Compatibility values
  document.getElementById('compat-skill-val').textContent = p.compat.skill + '%';
  document.getElementById('compat-avail-val').textContent = p.compat.availability + '%';
  document.getElementById('compat-tech-val').textContent = p.compat.techStack + '%';

  // Reset progress bars
  const skillBar = document.getElementById('compat-skill-bar');
  const availBar = document.getElementById('compat-avail-bar');
  const techBar = document.getElementById('compat-tech-bar');
  skillBar.style.width = '0%';
  availBar.style.width = '0%';
  techBar.style.width = '0%';

  // Show modal
  profileModal.classList.remove('hidden');
  profileModal.classList.add('entering');
  modalSheet.classList.add('entering');

  // Trigger reflow then animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      profileModal.classList.remove('entering');
      profileModal.classList.add('visible');
      modalSheet.classList.remove('entering');
      modalSheet.classList.add('visible');

      // Animate progress bars with stagger
      setTimeout(() => { skillBar.style.width = p.compat.skill + '%'; }, 200);
      setTimeout(() => { availBar.style.width = p.compat.availability + '%'; }, 400);
      setTimeout(() => { techBar.style.width = p.compat.techStack + '%'; }, 600);
    });
  });
}

function closeProfileModal() {
  profileModal.classList.remove('visible');
  profileModal.classList.add('entering');
  modalSheet.classList.remove('visible');
  modalSheet.classList.add('entering');
  setTimeout(() => {
    profileModal.classList.add('hidden');
  }, 350);
}

modalClose.addEventListener('click', closeProfileModal);

// Close on backdrop click
profileModal.addEventListener('click', (e) => {
  if (e.target === profileModal) closeProfileModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !profileModal.classList.contains('hidden')) {
    closeProfileModal();
  }
});

// ── Swipe logic ──────────────────────────────
function swipe(direction) {
  const card = document.getElementById('active-card');
  if (!card || currentIndex >= profiles.length) return;

  const swiped = profiles[currentIndex];
  card.classList.remove('card-enter');
  card.classList.add(direction === 'left' ? 'card-exit-left' : 'card-exit-right');

  if (direction === 'right') {
    // Store the like
    likedProfiles.add(swiped.name);

    // Check for mutual match
    if (swiped.likedYou && !matchedProfiles.has(swiped.name)) {
      matchedProfiles.add(swiped.name);
      createChatForMatch(swiped);

      setTimeout(() => {
        matchName.textContent = `You and ${swiped.name} want to build together!`;
        matchOverlay.classList.remove('hidden');
        matchOverlay.classList.add('flex');
      }, 300);
    }
  }

  setTimeout(() => {
    currentIndex++;
    renderCard(currentIndex);
  }, 460);
}

// ── Create chat entry on match ───────────────
function createChatForMatch(profile) {
  if (chatData[profile.name]) return; // already exists
  chatData[profile.name] = {
    lastSeen: 'Online',
  };
}

// ── Event listeners ──────────────────────────
btnSkip.addEventListener('click', () => swipe('left'));
btnMatch.addEventListener('click', () => swipe('right'));
btnStar.addEventListener('click', () => swipe('right'));

matchClose.addEventListener('click', () => {
  matchOverlay.classList.add('hidden');
  matchOverlay.classList.remove('flex');
});

// ── Keyboard shortcuts ──────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') swipe('left');
  if (e.key === 'ArrowRight') swipe('right');
});

// ── Touch / drag-to-swipe ───────────────────
let touchStartX = 0;
let touchCurrentX = 0;
let isDragging = false;

cardArea.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  isDragging = true;
});

cardArea.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  touchCurrentX = e.touches[0].clientX;
  const diff = touchCurrentX - touchStartX;
  const card = document.getElementById('active-card');
  if (card) {
    const rotate = diff * 0.08;
    card.style.transform = `translateX(${diff}px) rotate(${rotate}deg)`;
    card.style.transition = 'none';
    card.style.opacity = Math.max(1 - Math.abs(diff) / 500, 0.5);
  }
});

cardArea.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  const diff = touchCurrentX - touchStartX;
  const card = document.getElementById('active-card');
  if (Math.abs(diff) > 100) {
    swipe(diff > 0 ? 'right' : 'left');
  } else if (card) {
    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    card.style.transform = '';
    card.style.opacity = '';
  }
});

// ── Chat data store (keyed by profile name) ──
const chatData = {};

let activeChatName = null;

// ── View management ─────────────────────────
const views = {
  discover: document.getElementById('view-discover'),
  chats: document.getElementById('view-chats'),
  chatConvo: document.getElementById('view-chat-convo'),
  profile: document.getElementById('view-profile'),
};
const bottomNav = document.getElementById('bottom-nav');
const header = document.querySelector('header');

function showView(name) {
  Object.values(views).forEach(v => {
    v.classList.remove('active-view');
  });
  views[name].classList.add('active-view');

  // Show/hide header, nav, based on view
  if (name === 'chatConvo') {
    bottomNav.style.display = 'none';
    header.style.display = 'none';
  } else {
    bottomNav.style.display = '';
    header.style.display = '';
  }
}

// ── Nav tab switching ────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => {
      i.classList.remove('active');
      i.classList.replace('text-[#800000]', 'text-gray-500');
    });
    item.classList.add('active');
    item.classList.replace('text-gray-500', 'text-[#800000]');

    const id = item.id;
    if (id === 'nav-discover') showView('discover');
    else if (id === 'nav-chats') { renderChatList(); showView('chats'); }
    else if (id === 'nav-profile') { loadMyProfile(); showView('profile'); }
  });
});

// ── Chat list rendering ─────────────────────
function renderChatList() {
  const list = document.getElementById('chats-list');
  const chatNames = Object.keys(chatData);
  if (chatNames.length === 0) {
    list.innerHTML = `<div class="empty-state flex flex-col items-center gap-3 pt-20 text-center">
      <span class="text-5xl">💬</span>
      <h3 class="text-lg font-bold text-[#800000]">No matches yet</h3>
      <p class="text-gray-400 text-sm max-w-[240px]">Swipe right on devs you'd like to work with. Mutual likes become matches!</p>
    </div>`;
    return;
  }
  list.innerHTML = chatNames.map(name => {
    const p = getProfileByName(name);
    if (!p) return '';
    const isOnline = Math.random() > 0.3;
    return `<button class="chat-list-item w-full flex items-center gap-3 px-3 py-3 rounded-2xl" data-chat-name="${name}" aria-label="Chat with ${name}">
      <div class="relative flex-shrink-0">
        <img src="${p.avatar}" alt="${name}" class="w-12 h-12 rounded-full object-cover object-top border border-white/10"/>
        <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full online-dot ${isOnline ? 'bg-emerald-400' : 'bg-gray-600'}"></span>
      </div>
      <div class="flex-1 min-w-0 text-left">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-[#800000] truncate">${name}</p>
          <span class="text-[10px] text-gray-500 flex-shrink-0 ml-2">Now</span>
        </div>
        <p class="text-xs text-gray-400 truncate mt-0.5 text-cyan-300/70">Click to start chatting!</p>
      </div>
    </button>`;
  }).join('');

  list.querySelectorAll('.chat-list-item').forEach(btn => {
    btn.addEventListener('click', () => {
      openChatByName(btn.dataset.chatName);
    });
  });
}

let chatUnsubscribe = null;
let activeMatchId = null;

// ── Open a chat conversation ─────────────────
function openChatByName(name) {
  activeChatName = name;
  const p = getProfileByName(name);
  if (!p) return;

  document.getElementById('chat-header-avatar').src = p.avatar;
  document.getElementById('chat-header-name').textContent = p.name;
  document.getElementById('chat-header-status').textContent = 'Online';
  document.getElementById('chat-header-status').className = 'text-[10px] font-medium text-emerald-400';

  // Deterministic Match ID
  const uid1 = window.currentUserUid;
  const uid2 = p.uid;
  activeMatchId = uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

  // Clean up previous listener
  if (chatUnsubscribe) chatUnsubscribe();

  // Setup Real-time Listener
  const chatRef = collection(db, "messages", activeMatchId, "chat");
  const q = query(chatRef, orderBy("timestamp", "asc"), limit(50));
  
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    const msgs = [];
    snapshot.forEach(doc => msgs.push(doc.data()));
    renderMessages(msgs);
    scrollToBottom();
  });

  showView('chatConvo');
}

// ── Render messages ─────────────────────────
function renderMessages(msgs) {
  const container = document.getElementById('chat-messages');
  if (msgs.length === 0) {
    container.innerHTML = `<div class="flex flex-col items-center justify-center py-10 opacity-50"><p class="text-xs text-gray-400">Say hi to start the conversation!</p></div>`;
    return;
  }
  container.innerHTML = msgs.map(m => {
    const isMine = m.senderId === window.currentUserUid;
    const time = m.timestamp ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
    return `<div class="msg-bubble flex ${isMine ? 'justify-end' : 'justify-start'}">
      <div class="${isMine
        ? 'bg-gradient-to-br from-cyan-500/90 to-cyan-600/90 text-[#800000] rounded-2xl rounded-br-md'
        : 'glass text-slate-800 rounded-2xl rounded-bl-md'
      } px-3.5 py-2.5 text-sm leading-relaxed max-w-[80%] shadow-sm">
        <p>${m.text}</p>
        <p class="text-[10px] ${isMine ? 'text-[#800000]/60' : 'text-slate-400'} mt-1 text-right">${time}</p>
      </div>
    </div>`;
  }).join('');
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

const DEMO_PROFILES = ['Arjun Mehta', 'Priya Sharma', 'Rohan Das', 'Meera Iyer', 'Dev Patel', 'Ananya Rao'];
const AUTO_REPLIES = {
  role: [
    "I usually handle the frontend and UI, but I'm comfortable with full-stack stuff too!",
    "I'd love to take on the architecture and backend logic. What about you?",
    "I'm flexible! I can do design or coding, whichever fits the project best."
  ],
  hours: [
    "I can commit around 4-6 hours daily. Does that work for our timeline?",
    "I'm pretty free this week, so I can put in 8+ hours if we need to ship fast!",
    "I've got about 15-20 hours a week to dedicate to this."
  ],
  experience: [
    "I've built several hackathon projects before and even won a couple of 'Best Design' awards!",
    "I've worked on 3 major SaaS products in the past. Check out my portfolio if you have a sec.",
    "I've been coding for about 5 years now, mostly focusing on scalable web apps."
  ],
  generic: [
    "That sounds like a plan! Let's build something awesome.",
    "Nice! I'm really excited to collaborate with you on this.",
    "I'm totally in! When do we start diving into the code?"
  ]
};

function getAutoReply(text) {
  const lower = text.toLowerCase();
  let category = 'generic';
  
  if (lower.includes('role') || lower.includes('task') || lower.includes('handle')) category = 'role';
  else if (lower.includes('hour') || lower.includes('time') || lower.includes('commit')) category = 'hours';
  else if (lower.includes('experience') || lower.includes('build') || lower.includes('won') || lower.includes('project')) category = 'experience';
  
  const options = AUTO_REPLIES[category];
  return options[Math.floor(Math.random() * options.length)];
}

async function handleDemoAutoReply(userMessage) {
  if (!DEMO_PROFILES.includes(activeChatName)) return;
  
  const p = getProfileByName(activeChatName);
  if (!p) return;

  // Simulate typing delay
  setTimeout(async () => {
    const reply = getAutoReply(userMessage);
    const chatRef = collection(db, "messages", activeMatchId, "chat");
    await addDoc(chatRef, {
      senderId: p.uid, 
      text: reply,
      timestamp: serverTimestamp()
    });
  }, 2000);
}

// ── Send message ────────────────────────────
async function sendMessage(text) {
  if (!text.trim() || !activeMatchId) return;
  
  const userText = text.trim();
  try {
    const chatRef = collection(db, "messages", activeMatchId, "chat");
    await addDoc(chatRef, {
      senderId: window.currentUserUid,
      text: userText,
      timestamp: serverTimestamp()
    });

    // Trigger auto-reply for demo profiles
    handleDemoAutoReply(userText);
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

// ── Chat event listeners ────────────────────
document.getElementById('chat-send').addEventListener('click', () => {
  const input = document.getElementById('chat-input');
  sendMessage(input.value);
  input.value = '';
});

document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage(e.target.value);
    e.target.value = '';
  }
});

document.getElementById('chat-back').addEventListener('click', () => {
  activeChatName = null;
  renderChatList();
  showView('chats');
});

// Quick pitch buttons
document.querySelectorAll('.quick-pitch-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sendMessage(btn.dataset.msg);
  });
});

// ── Mode toggle ──────────────────────────────
const modeSlider = document.getElementById('mode-slider');
const modeProjectBtn = document.getElementById('mode-project');
const modeHackBtn = document.getElementById('mode-hackathon');

function setMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;
  
  // Animate slider
  if (mode === 'hackathon') {
    modeSlider.classList.add('right');
    modeHackBtn.classList.add('active-mode');
    modeProjectBtn.classList.remove('active-mode');
    hackathonFilters.classList.remove('hidden');
    hackathonFilters.classList.add('flex');
  } else {
    modeSlider.classList.remove('right');
    modeProjectBtn.classList.add('active-mode');
    modeHackBtn.classList.remove('active-mode');
    hackathonFilters.classList.add('hidden');
    hackathonFilters.classList.remove('flex');
  }

  applyFilters();
}

modeProjectBtn.addEventListener('click', () => setMode('project'));
modeHackBtn.addEventListener('click', () => setMode('hackathon'));

const filterHackathon = document.getElementById('filter-hackathon');
const filterLocation = document.getElementById('filter-location');
const hackathonFilters = document.getElementById('hackathon-filters');

function applyFilters() {
  const hVal = filterHackathon.value;
  const lVal = filterLocation.value;
  
  if (currentMode === 'project') {
    profiles = allProfiles;
  } else {
    profiles = allProfiles.filter(p => {
      let match = true;
      if (hVal && p.selectedHackathon !== hVal) match = false;
      if (lVal && p.location !== lVal) match = false;
      return match;
    });
  }
  
  currentIndex = 0;
  renderCard(0);
  document.getElementById('action-buttons').style.visibility = profiles.length > 0 ? 'visible' : 'hidden';
}

filterHackathon.addEventListener('change', applyFilters);
filterLocation.addEventListener('change', applyFilters);

// ── My Profile Logic ─────────────────────────
const defaultProfile = {
  uid: window.currentUserUid,
  name: 'Arjun Mehta',
  bio: 'Dev looking for cool projects.',
  skills: ['JavaScript', 'HTML', 'CSS'],
  image: 'assets/avatar_arjun.png',
  location: 'India',
  selectedHackathon: '',
  resumeDataUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  resumeName: 'Sample_Resume.pdf'
};

let myProfileData = JSON.parse(localStorage.getItem('myPairUpProfile')) || defaultProfile;
let isEditingProfile = false;

// Elements
const profileDisplayMode = document.getElementById('profile-display-mode');
const profileEditMode = document.getElementById('profile-edit-mode');
const btnEditProfile = document.getElementById('btn-edit-profile');
const btnSaveProfile = document.getElementById('btn-save-profile');

const dispName = document.getElementById('my-profile-name-display');
const dispBio = document.getElementById('my-profile-bio-display');
const dispSkills = document.getElementById('my-profile-skills-display');
const dispImg = document.getElementById('my-profile-img-display');
const btnViewResume = document.getElementById('btn-view-resume');
const noResumeText = document.getElementById('no-resume-text');

const inpName = document.getElementById('my-profile-name-input');
const inpBio = document.getElementById('my-profile-bio-input');
const inpSkills = document.getElementById('my-profile-skills-input');
const inpLocation = document.getElementById('my-profile-location-input');
const inpHackathon = document.getElementById('my-profile-hackathon-input');
const inpImgPrev = document.getElementById('my-profile-img-preview');
const inpImgFile = document.getElementById('my-profile-img-input');
const inpResumeFile = document.getElementById('my-profile-resume-input');
const resumeFilenameDisp = document.getElementById('resume-filename-display');

function renderMyProfileDisplay() {
  dispName.textContent = myProfileData.name || 'Your Name';
  dispBio.textContent = myProfileData.bio || 'Your bio will appear here.';
  dispImg.src = myProfileData.image || 'assets/avatar_arjun.png';
  
  const skillsArray = Array.isArray(myProfileData.skills) ? myProfileData.skills : [];
  dispSkills.innerHTML = skillsArray.map(s => `<span class="skill-tag px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300">${s}</span>`).join('');

  if (myProfileData.resumeDataUrl) {
    btnViewResume.classList.remove('hidden');
    btnViewResume.href = myProfileData.resumeDataUrl;
    noResumeText.classList.add('hidden');
  } else {
    btnViewResume.classList.add('hidden');
    noResumeText.classList.remove('hidden');
  }
}

function populateEditForm() {
  inpName.value = myProfileData.name || '';
  inpBio.value = myProfileData.bio || '';
  inpSkills.value = (myProfileData.skills || []).join(', ');
  inpLocation.value = myProfileData.location || 'India';
  inpHackathon.value = myProfileData.selectedHackathon || '';
  inpImgPrev.src = myProfileData.image || 'assets/avatar_arjun.png';
  resumeFilenameDisp.textContent = myProfileData.resumeName || 'Click to upload PDF/Doc';
}

function loadMyProfile() {
  renderMyProfileDisplay();
  if (isEditingProfile) {
    toggleProfileEditMode(); // ensure it starts in display mode
  }
}

function toggleProfileEditMode() {
  isEditingProfile = !isEditingProfile;
  if (isEditingProfile) {
    populateEditForm();
    profileDisplayMode.classList.add('hidden');
    profileEditMode.classList.remove('hidden');
    profileEditMode.classList.add('flex');
    btnEditProfile.textContent = 'Cancel';
    btnEditProfile.classList.replace('bg-white/10', 'bg-red-500/20');
    btnEditProfile.classList.replace('hover:bg-white/20', 'hover:bg-red-500/30');
    btnEditProfile.classList.add('text-red-300');
  } else {
    profileEditMode.classList.add('hidden');
    profileEditMode.classList.remove('flex');
    profileDisplayMode.classList.remove('hidden');
    btnEditProfile.textContent = 'Edit';
    btnEditProfile.classList.replace('bg-red-500/20', 'bg-white/10');
    btnEditProfile.classList.replace('hover:bg-red-500/30', 'hover:bg-white/20');
    btnEditProfile.classList.remove('text-red-300');
  }
}

btnEditProfile.addEventListener('click', toggleProfileEditMode);

btnSaveProfile.addEventListener('click', async () => {
  myProfileData.name = inpName.value.trim();
  myProfileData.bio = inpBio.value.trim();
  myProfileData.skills = inpSkills.value.split(',').map(s => s.trim()).filter(s => s);
  myProfileData.location = inpLocation.value;
  myProfileData.selectedHackathon = inpHackathon.value;
  
  localStorage.setItem('myPairUpProfile', JSON.stringify(myProfileData));
  renderMyProfileDisplay();
  
  if (window.currentUserUid && db) {
    try {
      await updateDoc(doc(db, "users", window.currentUserUid), {
        name: myProfileData.name,
        bio: myProfileData.bio,
        skills: myProfileData.skills,
        location: myProfileData.location,
        selectedHackathon: myProfileData.selectedHackathon,
        image: myProfileData.image || null,
        resumeLink: myProfileData.resumeDataUrl || null
      });
      console.log("Profile updated in Firestore");
    } catch (err) {
      console.error("Error updating profile in Firestore:", err);
    }
  }
  
  toggleProfileEditMode();
});

// Image upload handler
inpImgFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      myProfileData.image = event.target.result;
      inpImgPrev.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Resume upload handler
inpResumeFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    resumeFilenameDisp.textContent = file.name;
    myProfileData.resumeName = file.name;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      myProfileData.resumeDataUrl = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Initialize display immediately in case data already exists in localstorage
renderMyProfileDisplay();
