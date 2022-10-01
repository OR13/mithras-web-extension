import React from "react";
import { Hello } from "@src/components/hello";
import browser, { Tabs } from "webextension-polyfill";
import { LinkedDataQuery } from "@src/components/LinkedDataQuery";

import css from "./styles.module.css";


import {
    Quadstore,
    Engine,
    BrowserLevel,
    DataFactory,
} from './bundle';


const backend = new BrowserLevel('quadstore');
const dataFactory = new DataFactory();
const store = new Quadstore({ backend, dataFactory });
const engine = new Engine(store);


export function Popup() {
    // Sends the `popupMounted` event
    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);

    const [items, setItems] = React.useState();

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
        // console.log('sender : ', sender);
        // console.log('request: ', request)
            if (request.items){
                // console.log(request.items)
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

               
                <button onClick={async ()=>{
                await store.open();
                await store.put(dataFactory.quad(dataFactory.namedNode('ex://s'), dataFactory.namedNode('ex://p'), dataFactory.namedNode('ex://o')));

                }}>Add Data</button>

                <button onClick={async ()=>{
                    await store.open();
                    const stream = await engine.queryBindings(`SELECT * WHERE { ?s ?p ?o }`);
                    stream.on('data', console.log);
                   
                }}>View Data</button>

                <button onClick={async ()=>{ 
                   await store.open();
                   await store.clear();
                }}>Delete Data</button>

                <pre>{JSON.stringify(items, null, 2)}</pre>

            </div>
        </div>
    );
}
