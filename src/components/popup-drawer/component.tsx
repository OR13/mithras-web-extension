import * as React from "react";

import List from "@mui/material/List";

import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import DatasetLinkedIcon from "@mui/icons-material/DatasetLinked";

export function PopUpDrawer() {
    return (
        <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
                <ListItem key={text} disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <DatasetLinkedIcon />
                        </ListItemIcon>
                        <ListItemText primary={`Item ${index}`} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}
