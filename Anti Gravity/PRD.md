🚀 Project Name: JoinIn

Hackathon Track: Code For Connection (Web/Mobile Development) Tagline: The "Just-in-Time" Connection Layer for SRM AP Campus. 
+1

1. The Problem (Why this exists)

Context: Students at SRM AP are surrounded by thousands of peers but often eat alone, study alone, or struggle to find teammates. 


The Pain Point: The social friction of asking "Can I join you?" is too high. 

The Solution: JoinIn allows students to broadcast a temporary "Beacon" of intent (e.g., "Studying C++ @ Library"). Others can see these beacons and "Join In" instantly. 

2. Target Audience

Primary: SRM AP Students (Undergrad/Postgrad). 


Constraint: Must have a valid @srmap.edu.in email address to access. 

3. Core Features (The 12-Hour MVP Scope)
A. Authentication (The "Velvet Rope")

Mechanism: Google Sign-In via Firebase Auth. 

Critical Rule: Domain restriction. Only emails ending in @srmap.edu.in are allowed. 


Error State: If a user tries @gmail.com, show: "Sorry! JoinIn is exclusive to SRM AP Students." 


Profile Generation: Auto-pull Display Name and Photo URL from Google. 

B. The "Live Radar" (Dashboard)

View: A card-based feed showing active "Beacons." 


Filtering: Filter by Category: Study 📚, Food 🍔, Chill 🎮, Sports 🏏. 

Actions:


Create Beacon: FAB (+) opens a modal. 


Join Beacon: Button on cards to enter the chat. 

C. Creating a Beacon (The Input)
Fields:


Activity: (e.g., "Debugging Python Code") 


Location: (Dropdown: Library, Adarsh Mess, Admin Block, Hostel) 


Party Size: (e.g., "Looking for 2 more") 


Expires In: (1 hour, 2 hours - auto-deletes after time). 

D. The "Lobby" (Chat & Connection)

Mechanism: When a user clicks "Join," they enter a temporary group chat specific to that Beacon. 


The GenAI Hook: Upon joining, the system posts an automatic icebreaker based on the Activity. 

Implementation Strategy:

API: Use Google Gemini Flash API (Client-side call via GoogleGenerativeAI SDK).

Trigger: Fire the API call only once when the Join action is confirmed.

Prompt: "Generate a 1-sentence icebreaker for students doing [Activity]. Keep it short and funny."

4. Technical Stack (AI-Optimized)

Frontend: React + Vite (Fast, reliable). 


Styling: Tailwind CSS. 


Backend/DB: Firebase (Firestore + Authentication). 


Icons: Lucide React. 


State Management: React Context API. 

Required Configuration
Environment Variables: Do not hardcode keys. Use a .env file for:

VITE_FIREBASE_API_KEY

VITE_FIREBASE_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID

VITE_GEMINI_API_KEY

Routing Structure
/ -> Landing Page (Login)

/dashboard -> Main Feed (The Live Radar)

/create -> Create Beacon Modal/Page

/beacon/:id -> The Lobby (Chat Room)

5. Data Structure (Schema)

Collection: users 

JSON
{
  "uid": "user_123",
  "email": "jaffer_cse@srmap.edu.in",
  "displayName": "Jaffer Jani",
  "photoURL": "google_link...",
  "createdAt": "timestamp"
}

Collection: beacons 

JSON
{
  "id": "beacon_abc",
  "hostId": "user_123",
  "hostName": "Jaffer Jani",
  "activity": "Hackathon Grind",
  "location": "Library 4th Floor",
  "category": "Study",
  "maxParticipants": 4,
  "currentParticipants": ["user_123", "user_456"],
  "expiresAt": "timestamp",
  "status": "active"
}

Collection: chats (Subcollection inside beacons) 

JSON
{
  "senderId": "user_456",
  "senderName": "Rahul",
  "text": "Hey! I'm coming in 5 mins.",
  "timestamp": "timestamp"
}
6. User Flow (The Script)
Landing: User sees "JoinIn". Button: "Login with Student Mail". 

Auth: User authenticates via Google. System checks for @srmap.edu.in. 


Home: User sees list of active beacons. 


Creation: User taps +, types details, sets timer. 


Result: Card appears on feed. 


Connection: User taps "Join," chat opens, AI posts icebreaker. 

7. Future Scope
Geo-fencing validation. 

Reputation System. 

Calendar Sync.