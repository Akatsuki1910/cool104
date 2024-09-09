import van from "vanjs-core";
import * as vanX from "vanjs-ext";
import { Card } from "./components/card";
import { CardList } from "./components/cardList";
import "./index.scss";
import { CARD_VIEW_LIST, createCardList, type CardIcon } from "./ts/cardUtil";
import type { LengthArray } from "./ts/libs";

const { main, div, p } = van.tags;

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
      fieldState.forEach((_, i) => setCard(i));

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
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (!keyPress) return;
  if (keyPress === e.code) {
    keyPress = "";
  }
});

const wsState = van.state("");
const wsMessageState = van.state("");
const socket = new WebSocket("ws://127.0.0.1:8081");
socket.addEventListener("open", () => (wsState.val = "Hello Server!"));
socket.addEventListener(
  "error",
  (event) => (wsState.val = `WebSocket error ${event}`)
);
socket.addEventListener(
  "close",
  (event) => (wsState.val = `WebSocket close ${event}`)
);
socket.onopen = () => (wsState.val = "WebSocket onopen");
socket.onmessage = (event) => (wsMessageState.val = event.data);

const Main = () =>
  main(
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
      div(() => CardList(cardViewListState))
    ),
    vanX.list(div({ class: "card-wrapper" }), fieldState, (state) =>
      Card(state.val.num, state.val.suit)
    )
  );

van.add(document.body, Main());
