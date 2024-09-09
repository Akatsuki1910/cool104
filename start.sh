bun i
cd server
bun run init
cd ..
ps u | grep "bun run" | grep "S " | awk '{print $2}' | xargs kill
ps u | grep " S " | awk '{print $2}' | xargs kill
