from smartcard.util import toHexString
from smartcard.System import readers
from time import sleep
from fastapi import FastAPI

app = FastAPI()


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
