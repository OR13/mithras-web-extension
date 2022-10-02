import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";

import { PopUpDrawer } from "../popup-drawer";

const drawerWidth = 196;

export function PopupAppBar({ pageItems, children }: any) {
    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: "background.default", p: 1 }}
            >
                {children}
            </Box>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
                variant="permanent"
                anchor="right"
            >
                <PopUpDrawer pageItems={pageItems} />
            </Drawer>
        </Box>
    );
}
