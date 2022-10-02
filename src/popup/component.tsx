import React from "react";

import css from "./styles.module.css";

import PageActor from "../services/PageActor";
import { TransmuteLoading } from "@src/components/transmute-loading";

import { PopupTabs } from "@src/components/popup-tabs";
import { createTheme } from "@mui/material/styles";
import { cyan, grey, purple, deepPurple } from "@mui/material/colors";
import { ThemeProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: deepPurple[200] },
        secondary: { main: cyan[200] },
    },
});

export function Popup() {
    const [pageItems, setPageItems]: any = React.useState(null);
    React.useEffect(() => {
        PageActor.onPopup(setPageItems);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <span className={css.popupContainer}>
                <ToastContainer position="bottom-right" />
                {pageItems ? (
                    <PopupTabs pageItems={pageItems} />
                ) : (
                    <TransmuteLoading fullPage={true} />
                )}
            </span>
        </ThemeProvider>
    );
}
