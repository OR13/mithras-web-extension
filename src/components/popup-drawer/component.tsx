import * as React from "react";

import List from "@mui/material/List";

import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import DatasetLinkedIcon from "@mui/icons-material/DatasetLinked";

type PageItem = Record<string, unknown> & { title: string };

export function PopUpDrawer({ pageItems }: { pageItems: PageItem[] }) {
    return (
        <List>
            {pageItems.map(({ title }: PageItem, index: number) => (
                <ListItem key={index} disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <DatasetLinkedIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary={title.substring(0, 16) + "..."}
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}
