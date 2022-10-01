import React from "react";
import { Hello } from "@src/components/hello";
import browser, { Tabs } from "webextension-polyfill";
import { Scroller } from "@src/components/scroller";
import { LinkedDataQuery } from "@src/components/LinkedDataQuery";

import css from "./styles.module.css";


// import {
//     Quadstore,
//     Engine,
//     BrowserLevel,
//     DataFactory,
// } from './bundle';


// // // //

// Scripts to execute in current tab
const scrollToTopPosition = 0;
const scrollToBottomPosition = 9999999;

function scrollWindow(position: number) {
    window.scroll(0, position);
}

/**
 * Executes a string of Javascript on the current tab
 * @param code The string of code to execute on the current tab
 */
function executeScript(position: number): void {
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

            // Executes the script in the current tab
            browser.scripting
                .executeScript({
                    target: {
                        tabId: currentTabId,
                    },
                    func: scrollWindow,
                    args: [position],
                })
                .then(() => {
                    console.log("Done Scrolling");
                });
        });
}




export function Popup() {
    // Sends the `popupMounted` event
    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);

    const [items, setItems] = React.useState();

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
        console.log('sender : ', sender);
        console.log('request: ', request)
            if (request.items){
                console.log(request.items)
                setItems(request.items)
                sendResponse({message: "thanks for submitting these items."});
            } 
        }
      );
    
    
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
                        func: function ({type}: any) {
                            let items = []
                            document.querySelectorAll('script[type="application/ld+json"]')
                                .forEach((s)=>{ 
                                    const i = JSON.parse(s.innerHTML)
                                    if (i['@type'] === type){
                                        items.push(i)
                                    }
    
                                 } )
                           chrome.runtime.sendMessage({ items }, function(response) {
                            console.log('sending message from page', {type})
                            console.log('received response from popup', response)
                          });
    
                        },
                        args: [args],
                    })
                    .then((data) => {
                        console.log("Done Injection", data);
                    });
            });  
    }

    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="mx-4 my-4">
                <Hello />
                <hr />
                <LinkedDataQuery query={()=> { getLinkedDataBy({type: "Product"}) }}/>
                <pre>{JSON.stringify(items, null, 2)}</pre>

                {/* <Scroller
                    onClickScrollTop={() => {
                        executeScript(scrollToTopPosition);
                    }}
                    onClickScrollBottom={() => {
                        executeScript(scrollToBottomPosition);
                    }}
                /> */}
            </div>
        </div>
    );
}
