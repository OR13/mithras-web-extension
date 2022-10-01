import React from "react";

import css from "./scroller/styles.module.css";
// // // //

/**
 * Component that renders buttons to scroll to the top and bottom of the page
 */
export function Injector(props: {
    onInject: () => void
}) {
    return (
        <div className="grid gap-3 grid-cols-2 mt-3 w-full">
            <button
                className={css.btn}
                onClick={() => props.onInject()}
            >
                Inject
            </button>
           
        </div>
    );
}
