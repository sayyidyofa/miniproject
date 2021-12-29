# miniproject

How to develop:
0. Clone repo
1. npm install
2. Checkout dev branch
3. Do your stuff
4. Run `npm run dev` to try running the code

How to run dummy test:

0. Only run this in a system that supports `crontab` command (currently does not support manual troubleshoot scenario)
1. Two modes: 
   - Single-app mode: Run `npm run dummy` (will listen in port 4444)
   - Multiple services mode: Run `cd tests` then `docker-compose up --build -d` (will listen in port 3001, 3002, 3003)

How to run controlled failure of testApp:
 - Heal-on-restart mode: click the "Break me" button (or hit the `/break` endpoint) to break the app. Restart the app to get it healthy again
 - Manual troubleshooting mode: click the "Break me (solve manually)" button (or hit the `/breakManual` endpoint) to break the app. Set the value of `manual_config` in important_file to `valid` to get the app healthy again
