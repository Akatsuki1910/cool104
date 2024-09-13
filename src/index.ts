import van from "vanjs-core";
import * as vanX from "vanjs-ext";
import { Card } from "./components/card";
import { CardList } from "./components/cardList";
import "./index.scss";
import { CARD_VIEW_LIST, createCardList, type CardIcon } from "./ts/cardUtil";
import type { LengthArray } from "./ts/libs";
import { Count } from "./components/count";

const { main, div, p, dialog } = van.tags;

const uid = Math.random().toString(36).slice(-8);

interface CardState {
  num: Parameters<typeof Card>[0];
  suit: Parameters<typeof Card>[1];
}

const postState = vanX.reactive({ ok: 0, err: 0, text: "" });

const fullCardListState = vanX.reactive(createCardList(CARD_VIEW_LIST));
const gameState = van.state(true);
const cardViewListState = vanX.reactive(CARD_VIEW_LIST);
const count = van.state(0);
const nowState = van.state<CardState>({ num: -1, suit: "spades" });
const fieldState = vanX.reactive<LengthArray<CardState, 5>>(
  [] as unknown as LengthArray<CardState, 5>
);

const setCard = (i: number) => {
  if (!fullCardListState.length) {
    fieldState[i] = { num: -1, suit: "spades" };
    return;
  }
  while (true) {
    const c =
      fullCardListState[Math.floor(Math.random() * fullCardListState.length)];
    if (c) {
      fieldState[i] = c;
      cardViewListState[c.suit][c.num] = 1;
      fullCardListState.splice(fullCardListState.indexOf(c), 1);
      break;
    }
  }
};
[...Array(5)].forEach((_, i) => setCard(i));

const finishSearch = () =>
  !fieldState.some(
    ({ num, suit }) => num === nowState.val.num || suit === nowState.val.suit
  ) ||
  (fullCardListState.length === 0 &&
    fieldState.every((state) => state.num === -1));

let keyPress = "";

const pressKey = (code: KeyboardEvent["code"], key: KeyboardEvent["code"]) => {
  if (code === key) {
    keyPress = code;
    return true;
  }

  return false;
};

const onPressKey = (num: number) => {
  if (num === -1) return;

  if (
    nowState.val.num === -1 ||
    nowState.val.num === fieldState[num].num ||
    nowState.val.suit === fieldState[num].suit
  ) {
    count.val++;
    nowState.val = fieldState[num];
    cardViewListState[nowState.val.suit][nowState.val.num] = 2;
    setCard(num);

    if (finishSearch()) {
      gameState.val = false;
      const dialog = document.getElementById(
        "finish-dialog"
      ) as HTMLDialogElement;
      if (dialog) {
        dialog.showModal();
      }
    }
  }
};

window.addEventListener("keydown", async (e) => {
  if (keyPress) return;

  if (pressKey(e.code, "Enter")) {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/create", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      postState.ok++;
      postState.text = await res.text();
    } catch (e) {
      postState.err++;
    }
  }

  if (!gameState.val) {
    if (pressKey(e.code, "Space")) {
      gameState.val = true;
      count.val = 0;
      nowState.val = { num: -1, suit: "spades" };
      for (const key in cardViewListState) {
        cardViewListState[key as CardIcon].fill(0);
      }
      fullCardListState.length = 0;
      fullCardListState.push(...createCardList(CARD_VIEW_LIST));
      fieldState.forEach((_, i) => setCard(i));

      const dialog = document.getElementById(
        "finish-dialog"
      ) as HTMLDialogElement;
      if (dialog) {
        dialog.close();
      }

      return;
    }

    return;
  }

  let num = -1;

  for (let i = 0; i < 5; i++) {
    if (pressKey(e.code, `Digit${i + 1}`)) {
      num = i;
    }
  }

  onPressKey(num);
});

window.addEventListener("keyup", (e) => {
  if (!keyPress) return;
  if (keyPress === e.code) {
    keyPress = "";
  }
});

const wsState = van.state("");
const wsMessageState = van.state("");
let isSocketOpen = false;
let wsPressed = -1;
let canWsPress = true;

const Main = () => {
  const socket = new WebSocket("ws://127.0.0.1:8081");
  socket.addEventListener("open", () => {
    isSocketOpen = true;
    wsState.val = "Hello Server!";
  });
  socket.addEventListener(
    "error",
    (event) => (wsState.val = `WebSocket error ${JSON.stringify(event)}`)
  );
  socket.addEventListener("close", (event) => {
    isSocketOpen = false;
    wsState.val = `WebSocket close ${JSON.stringify(event)}`;
  });
  socket.onopen = () => (wsState.val = "WebSocket onopen");
  socket.onmessage = (event) => {
    const d = event.data;
    wsMessageState.val = d;

    if (d === "111111") {
      canWsPress = true;
      return;
    }

    let pressFlg = false;
    for (let i = 0; i < 5; i++) {
      if (d[i] === "0") {
        wsPressed = i;
        pressFlg = true;
      }
    }

    if (pressFlg) {
      onPressKey(wsPressed);
      canWsPress = false;
    } else {
      pressFlg = false;
      wsPressed = -1;
    }
  };

  setInterval(() => {
    if (isSocketOpen) {
      socket?.send(JSON.stringify({ message: "hello?" }));
    }
  }, 100);

  return main(
    div(
      { class: "top-wrapper" },
      div(
        p(() => `count: ${count.val}`),
        p(() => `gameState: ${gameState.val}`),
        p(() => `uid: ${uid}`),
        p(() => `postState: ${JSON.stringify(postState)}`),
        p(() => `wsState: ${wsState.val}`),
        p(() => `wsMessageState: ${wsMessageState.val}`)
      ),
      div({ class: "main-card" }, () =>
        Card(nowState.val.num, nowState.val.suit)
      ),
      div(
        () => CardList(cardViewListState),
        () => Count(count.val)
      )
    ),
    vanX.list(div({ class: "card-wrapper" }), fieldState, (state) =>
      Card(state.val.num, state.val.suit)
    ),
    dialog(
      {
        id: "finish-dialog",
        class: "finish-dialog",
      },
      div(
        { class: "finish-dialog-inner" },
        p("FINISH!"),
        p(() => `PAY: ${count.val}`),
        p({ class: "finish-dialog-press" }, "Press Space to restart")
      )
    )
  );
};

van.add(document.body, Main());
