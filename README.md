# SafeGig Working Model

A beginner-friendly working prototype of SafeGig:
- Micro-internship marketplace
- Rule-based opportunity risk scanner
- Student application flow
- Employer project posting
- Employer dashboard
- JSON persistence

## Requirements
- Node.js 18+ recommended

## Run

1. Open a terminal in this folder.
2. Run:

   npm install

3. Start:

   npm start

4. Open:

    https://safegig-1pjb.onrender.com/ add README.md

## Demo
The app starts with two sample projects.

Try the Risk Scanner with text such as:
"Earn ₹50,000 per week! Pay ₹2,000 registration fee and apply immediately."

It should produce a high-risk score.

## Important
The risk engine is a prototype rule-based indicator. It is not a definitive fraud detector and should not be used as proof that an employer is fraudulent.

## Suggested next upgrades
1. MongoDB
2. Real authentication/JWT
3. Employer verification workflow
4. Student skill matching
5. Admin moderation
6. URL/domain reputation checks
7. NLP/ML risk classifier
8. Email notifications
9. Resume/project portfolio
10. Deployment
