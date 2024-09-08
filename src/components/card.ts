import van from "vanjs-core";
import { type CardIcon, cardIcons, cardStr } from "../ts/cardUtil";
import "./card.scss";
const { p, div, img } = van.tags;

export const Card = (num: number, icon: CardIcon) =>
  div(
    { class: "card", "data-disabled": num === -1 },
    num === -1
      ? undefined
      : [
          p({ class: "num" }, cardStr[num]),
          img({ src: cardIcons[icon], class: "img" }),
          img({ src: cardIcons[icon], class: "l-img" }),
        ]
  );
