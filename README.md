# miniproject

How to develop:
0. Clone repo
1. npm install
2. Checkout dev branch
3. Do your stuff
4. Run `npm run dev` to try running the code

How to run dummy test:

0. Only run this in a system that supports `crontab` command
1. Two modes: 
   1. Single-app mode: Run `npm run dummy`
   2. Multiple services mode: Run `cd tests && docker-compose up --build -d`
