import * as React from "react";
import Tabs from "@mui/material/Tabs";

import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import { PageItemTab } from "../page-item-tab";

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <span
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 0, display: "flex" }}>{children}</Box>
            )}
        </span>
    );
}

type PageItem = Record<string, unknown> & {
    title: string;
    cypher: { query: string };
};
export function PopupTabs({ pageItems }: { pageItems: PageItem[] }) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box
            sx={{
                maxWidth: "780px",
                width: "100%",
            }}
        >
            <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="tabbed page items"
            >
                {pageItems.map((pageItem, i) => {
                    return (
                        <Tab
                            label={pageItem.title}
                            key={i}
                            sx={{
                                textTransform: "none",
                                margin: 0,
                            }}
                        />
                    );
                })}
            </Tabs>
            {pageItems.map((pageItem, i) => {
                return (
                    <TabPanel value={value} index={i} key={i}>
                        <PageItemTab pageItem={pageItem} />
                    </TabPanel>
                );
            })}
        </Box>
    );
}
