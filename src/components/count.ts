import "./count.scss";
import van from "vanjs-core";

const { div, p } = van.tags;

export const Count = (num: number) => {
  return div({ class: "count-wrapper" }, p("COUNT:"), p(num));
};
