import asyncio
import websockets
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
# 1
GPIO.setup(21, GPIO.IN, pull_up_down=GPIO.PUD_UP)
# 2
GPIO.setup(20, GPIO.IN, pull_up_down=GPIO.PUD_UP)
# 3
GPIO.setup(16, GPIO.IN, pull_up_down=GPIO.PUD_UP)
# 4
GPIO.setup(26, GPIO.IN, pull_up_down=GPIO.PUD_UP)
# 5
GPIO.setup(19, GPIO.IN, pull_up_down=GPIO.PUD_UP)
# 6
GPIO.setup(13, GPIO.IN, pull_up_down=GPIO.PUD_UP)


async def echo(websocket, _path):
    async for _ in websocket:
        sw1 = GPIO.input(21)
        sw2 = GPIO.input(20)
        sw3 = GPIO.input(16)
        sw4 = GPIO.input(26)
        sw5 = GPIO.input(19)
        sw6 = GPIO.input(13)
        mm = f"{sw1}{sw2}{sw3}{sw4}{sw5}{sw6}"
        print(mm)
        await websocket.send(mm)


async def main():
    async with websockets.serve(echo, "127.0.0.1", 8081):
        await asyncio.Future()


asyncio.run(main())
