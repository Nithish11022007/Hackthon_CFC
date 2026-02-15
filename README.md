**The Source code is provided in the master branch of the repo.**


JoinIn — Real-Time Campus Belonging Network

JoinIn is a hyper-local, real-time peer connection platform designed specifically for university campuses. It enables students to discover and connect with others nearby based on their current activity, intent, and availability.

This platform is not social media, not a dating app, and not an event scheduler. Instead, it acts as a real-time digital layer over the physical campus, helping students form meaningful academic and social connections naturally.

Problem Statement

Despite being surrounded by thousands of peers, many students experience:

Studying alone
Eating alone
Social hesitation
Lack of peer collaboration
Existing platforms fail because they are either too formal, too noisy, or too performative. Students often want to connect but hesitate due to social friction and awkwardness.

Campus Connector solves this by enabling visible intent and permission-based interaction.

Core Concept — The Beacon System

The platform introduces a concept called a Beacon.

A Beacon is a temporary, real-time signal that shows:

Location (Library, Mess, Hostel, etc.)
Activity (Study, Eat, Discuss, Chill)
Duration
Mood or openness
Example Beacon:

Debugging Python at Library | Open till 4 PM | Need help

This allows others nearby to discover and join naturally without awkward introductions.

Key Features
Real-Time Beacon System

Users can create and view live Beacons
Helps discover nearby students with similar goals
Live Campus Radar

Shows nearby active Beacons
Enables location-based peer discovery
AI-Powered Smart Nudges

Generates contextual conversation starters
Reduces social hesitation
Secure and Trusted Environment

University-restricted access
No followers, likes, or vanity metrics
Temporary and privacy-focused interactions
Tech Stack

Frontend:

HTML
CSS
JavaScript
Backend:

Node.js
Express.js
Other Tools:

Git & GitHub
npm (Node Package Manager)
Project Structure

JoinIn/
│
├── frontend/
├── backend/
├── modules/
├── dist/ (optional build folder)
├── package.json
├── package-lock.json
└── README.md
Note: node_modules is not included in the repository as per Git best practices.

Important Setup Instructions (After Cloning)

Since node_modules and packages are not included in the repository, you must install dependencies manually.

Step 1: Clone the repository

git clone https://github.com/Manikanta-20-11/JoinIn.git
Step 2: Navigate into the project folder

cd JoinIn
Step 3: Install required packages

npm install
This will automatically install all required modules and recreate the node_modules folder.

Running the Project

Start the backend server:

npm start
or

node server.js
Required Node Packages

These packages will be installed automatically using npm install:

express
cors
body-parser
dotenv (if used)
nodemon (development)
Vision

Campus Connector aims to become the digital social infrastructure of campuses — enabling real-time collaboration, belonging, and peer support without social pressure or awkwardness.

It transforms physical presence into meaningful connection.

Contributors

Developed as part of a hackathon project to solve real campus social and academic connection challenges.

Note

Do NOT upload node_modules folder to GitHub.

Always run:

npm install
after cloning the repository.
