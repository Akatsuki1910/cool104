import van from "vanjs-core";
import {
  cardIcons,
  cardStr,
  CARD_VIEW_LIST,
  type CardIcon,
} from "../ts/cardUtil";
import type { Entries, LengthArray } from "../ts/libs";
import "./cardList.scss";

const { p, div, img } = van.tags;

export const CardList = (list: typeof CARD_VIEW_LIST) => {
  return div(
    (Object.entries(list) as Entries<typeof CARD_VIEW_LIST>).map(
      ([icon, viewList]) =>
        div(
          { class: "card-list" },
          img({ src: cardIcons[icon], class: "icon" }),
          viewList.map((view, i) =>
            p(
              {
                class: ["num", view === 1 && "view", view === 2 && "disabled"]
                  .filter(Boolean)
                  .join(" "),
              },
              cardStr[i]
            )
          ),
          img({ src: cardIcons[icon], class: "icon" })
        )
    )
  );
};
