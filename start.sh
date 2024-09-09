nohup bun run card &
nohup bun run ws &
nohup bun run server &
nohup bun run dev &

sudo systemctl start display-manager
export DISPLAY=:0
chromium-browser http://localhost:5173 --kiosk

sudo systemctl stop display-manager
