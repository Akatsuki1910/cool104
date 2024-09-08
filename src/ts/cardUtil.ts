import type { CardList } from "../components/cardList";
import clubs from "../img/clubs.png";
import diamonds from "../img/diamonds.png";
import hearts from "../img/hearts.png";
import spades from "../img/spades.png";
import type { LengthArray } from "./libs";

export type CardIcon = "clubs" | "diamonds" | "hearts" | "spades";

export const cardIcons = {
  clubs,
  diamonds,
  hearts,
  spades,
} as const satisfies { [key in CardIcon]: string };

export const cardStr = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

// 0 default 1 view 2 disabled
export const CARD_VIEW_LIST: Record<CardIcon, LengthArray<0 | 1 | 2, 13>> = {
  spades: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  hearts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  clubs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  diamonds: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // spades: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  // hearts: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  // clubs: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  // diamonds: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
};

export const createCardList = (cardViewList: typeof CARD_VIEW_LIST) =>
  Object.entries(cardViewList)
    .flatMap(([key, suit]) =>
      suit.flatMap((view, num) =>
        view !== 0 ? undefined : { num, suit: key as CardIcon }
      )
    )
    .filter(Boolean);
