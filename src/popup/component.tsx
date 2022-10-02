import React from "react";

import { PopupAppBar } from "@src/components/popup-app/component";

import { TransmuteLoading } from "@src/components/transmute-loading";

import css from "./styles.module.css";

import PageActor from "../services/PageActor";

export function Popup() {
    const [pageItems, setPageItems]: any = React.useState(null);
    React.useEffect(() => {
        PageActor.onPopup(setPageItems);
    }, []);

    return (
        <div className={css.popupContainer}>
            {pageItems ? (
                <PopupAppBar>
                    <pre>{JSON.stringify(pageItems, null, 2)}</pre>
                </PopupAppBar>
            ) : (
                <TransmuteLoading fullPage={true} />
            )}
        </div>
    );
}
