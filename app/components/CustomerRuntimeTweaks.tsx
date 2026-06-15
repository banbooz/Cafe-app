"use client";

import { useEffect } from "react";
import { menuItems } from "../lib/menu";

const dealItems = menuItems.filter((item) => item.popular);

function findSpecialDealButton() {
  return Array.from(document.querySelectorAll("button")).find((button) => {
    const text = button.textContent || "";
    return text.includes("Special Deals") && text.includes("Order Now");
  }) as HTMLButtonElement | undefined;
}

function findImagePanel(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>("div")).find((element) => element.style.backgroundImage.includes("url("));
}

function hideBottomMenuButtons() {
  Array.from(document.querySelectorAll("nav")).forEach((nav) => {
    const buttons = Array.from(nav.querySelectorAll("button"));
    const menuButton = buttons.find((button) => (button.textContent || "").trim() === "Menu") as HTMLElement | undefined;
    if (!menuButton) return;
    menuButton.style.display = "none";
    const wrapper = menuButton.parentElement as HTMLElement | null;
    if (wrapper) wrapper.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
  });
}

export default function CustomerRuntimeTweaks() {
  useEffect(() => {
    if (!dealItems.length) return undefined;

    function applyDeal(index: number) {
      const item = dealItems[index % dealItems.length];
      const button = findSpecialDealButton();
      if (!button) return;

      const eyebrow = button.querySelector("p");
      const heading = button.querySelector("h1");
      const cta = button.querySelector("span");
      const imagePanel = findImagePanel(button);

      if (eyebrow) eyebrow.textContent = `${item.category} deal`;
      if (heading) heading.textContent = `${item.name} Special Deals`;
      if (cta) cta.textContent = "Order Now";
      if (imagePanel) imagePanel.style.backgroundImage = `url(${item.image})`;
    }

    let index = 0;
    const syncTimer = window.setInterval(() => {
      hideBottomMenuButtons();
      applyDeal(index);
    }, 700);

    const dealTimer = window.setInterval(() => {
      index = (index + 1) % dealItems.length;
      applyDeal(index);
    }, 4200);

    hideBottomMenuButtons();
    applyDeal(index);

    return () => {
      window.clearInterval(syncTimer);
      window.clearInterval(dealTimer);
    };
  }, []);

  return null;
}
