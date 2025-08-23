#compile eva to out.js
node --trace-uncaught __tests__/run.js &&

#run the out.js
node out.js

echo ""