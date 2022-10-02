import React from "react";

import { PopupAppBar } from "@src/components/popup-app/component";

import { TransmuteLoading } from "@src/components/transmute-loading";

import css from "./styles.module.css";

import PageActor from "../services/PageActor";

import { PopupTabs } from "@src/components/popup-tabs";

export function Popup() {
    const [pageItems, setPageItems]: any = React.useState(null);
    React.useEffect(() => {
        PageActor.onPopup(setPageItems);
    }, []);

    return (
        <div className={css.popupContainer}>
            {pageItems ? (
                <PopupTabs pageItems={pageItems} />
            ) : (
                <TransmuteLoading fullPage={true} />
            )}
        </div>
    );
}
