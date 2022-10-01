import React from "react";

import browser, { Tabs } from "webextension-polyfill";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import css from "./styles.module.css";

import LinkedData from "../services/LinkedData";

export function Popup() {
    // Sends the `popupMounted` event
    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);

    const [items, setItems]: any = React.useState([]);

    chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse,
    ) {
        console.log("sender : ", sender);
        // console.log('request: ', request)

        sendResponse({ message: "thanks for submitting these items." });
        if (request.items) {
            // console.log(request.items)
            Promise.all(
                request.items.map(async (i: any) => {
                    const data = await LinkedData.add(i, sender.url || "");
                    console.log(data);
                }),
            );
        }
    });

    function getLinkedDataBy(args: any): void {
        // Query for the active tab in the current window
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs: Tabs.Tab[]) => {
                // Pulls current tab from browser.tabs.query response
                const currentTab: Tabs.Tab | number = tabs[0];

                // Short circuits function execution is current tab isn't found
                if (!currentTab) {
                    return;
                }
                const currentTabId: number = currentTab.id as number;
                // // Executes the script in the current tab
                browser.scripting
                    .executeScript({
                        target: {
                            tabId: currentTabId,
                        },
                        func: function ({ type }: any) {
                            const items: any = [];
                            document
                                .querySelectorAll(
                                    'script[type="application/ld+json"]',
                                )
                                .forEach((s) => {
                                    const i = JSON.parse(s.innerHTML);
                                    if (i["@type"] === type) {
                                        items.push(i);
                                    }
                                });
                            chrome.runtime.sendMessage(
                                { items },
                                function (response) {
                                    console.log("sending message from page", {
                                        type,
                                    });
                                    console.log(
                                        "received response from popup",
                                        response,
                                    );
                                },
                            );
                        },
                        args: [args],
                    })
                    .then((data) => {
                        console.log("Done Injection", data);
                    });
            });
    }
    return (
        <div className={css.popupContainer}>
            <div className="mx-4 my-4">
                <Stack spacing={2} direction="row">
                    <Button
                        variant="text"
                        onClick={async () => {
                            getLinkedDataBy({ type: "Product" });
                        }}
                    >
                        Scrape Linked Data
                    </Button>

                    <Button
                        variant="contained"
                        onClick={async () => {
                            const data = await LinkedData.all();
                            setItems(data);
                        }}
                    >
                        View Data
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={async () => {
                            await LinkedData.clear();
                        }}
                    >
                        Delete Data
                    </Button>
                </Stack>

                <pre>{JSON.stringify(items, null, 2)}</pre>
            </div>
        </div>
    );
}
