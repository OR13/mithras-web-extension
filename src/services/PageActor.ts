import browser, { Tabs } from "webextension-polyfill";

import LinkedData from "./LinkedData";

interface HarvestDataConfig {
    type: string;
}

type LinkedDataFragment = {
    "@content":
        | string
        | Array<string | Record<string, unknown>>
        | Record<string, unknown>;
};

function pageFunction({ type }: HarvestDataConfig) {
    const items: LinkedDataFragment[] = [];
    document
        .querySelectorAll('script[type="application/ld+json"]')
        .forEach((s) => {
            const i = JSON.parse(s.innerHTML);
            // disable limit on time.
            // if (type) {
            //     if (i["@type"] === type) {
            //         items.push(i);
            //     }
            // }
            items.push(i);
        });
    chrome.runtime.sendMessage({ items }, function (response) {
        // no need to handle a response here.
        console.log(response);
    });
    chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse,
    ) {
        console.log("page message sender : ", sender);
        console.log("page message request: ", request);
        sendResponse({ message: "page message received" });
    });

    console.log("pageFunction completed.");
}

function harvestData(args: any): void {
    browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs: Tabs.Tab[]) => {
            const currentTab: Tabs.Tab | number = tabs[0];
            if (!currentTab) {
                return;
            }
            const currentTabId: number = currentTab.id as number;
            browser.scripting
                .executeScript({
                    target: {
                        tabId: currentTabId,
                    },
                    func: pageFunction,
                    args: [args],
                })
                .then((data) => {
                    console.log("Page script execution complete", data);
                });
        });
}

const onPopup = (setPageItems: any) => {
    browser.runtime.sendMessage({ popupMounted: true });
    chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse,
    ) {
        // console.log("sender : ", sender);
        // console.log("request: ", request);
        if (request.items) {
            // console.log(request.items);
            setTimeout(async () => {
                const items = await LinkedData.processItems(request.items);
                setPageItems(items);
            }, 0);

            sendResponse({ message: "extension has received items." });
        }
    });
    harvestData({ type: "Product" });
};

const openNewTab = (url: string) => {
    browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs: Tabs.Tab[]) => {
            const currentTab: Tabs.Tab | number = tabs[0];
            if (!currentTab) {
                return;
            }
            const currentTabId: number = currentTab.id as number;
            browser.scripting
                .executeScript({
                    target: {
                        tabId: currentTabId,
                    },
                    func: function pageFunction(url: any) {
                        console.log("pageFunction called.", url);
                        if (url.startsWith("https://lucid.did.cards/")) {
                            window.open(url);
                        } else {
                            throw new Error("Unsafe url..." + url);
                        }
                    },
                    args: [url],
                })
                .then((data) => {
                    console.log("Page script execution complete", data);
                });
        });
};

const PageActor = { onPopup, harvestData, openNewTab };

export default PageActor;
