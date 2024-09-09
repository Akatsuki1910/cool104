from smartcard.util import toHexString
from smartcard.System import readers
from time import sleep
from fastapi import FastAPI
import asyncio
import websockets
import RPi.GPIO as GPIO

app = FastAPI()

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


@app.get("/")
async def getUid():
    print("Read UID/ATS from smart card ( use smartcard.System )")

    try:
        while True:
            ReaderList = readers()
            if len(ReaderList) < 1:
                print("Can't get readers' list\n")
                return
            print(str(len(ReaderList)) + " reader detected . ", end="")
            if len(ReaderList) > 1:
                print("this script use first reader .")
            else:
                print("\n")
            print("target reader : " + str(ReaderList[0]))

            try:
                conn = ReaderList[0].createConnection()
                conn.connect()
            except Exception as message:
                print("Exception : " + str(message))

            try:
                SendApduList = [0xFF, 0xCA, 0x00, 0x00, 0x00]
                RecvApduList, sw1, sw2 = conn.transmit(SendApduList)
                uid = toHexString(RecvApduList) + \
                    hex(sw1)[2:] + hex(sw2)[2:]
                uid = uid.replace(" ", "")

                SendApduList = [0xFF, 0xCA, 0x01, 0x00, 0x00]
                RecvApduList, sw1, sw2 = conn.transmit(SendApduList)
                ats = toHexString(RecvApduList) + \
                    hex(sw1)[2:] + hex(sw2)[2:]
                ats = ats.replace(" ", "")

                if ats == "6a81":
                    break

            except Exception as message:
                print("Exception : " + str(message))
            sleep(0.1)
    except KeyboardInterrupt:
        print("finished")
        conn.disconnect()

    return {"uid": uid}


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


if __name__ == "__main__":
    asyncio.run(main())
