import * as React from "react";

import Box from "@mui/material/Box";

import { ViewAsVerifiableCredentialButton } from "./ViewAsVerifiableCredentialButton";

type PageItem = Record<string, unknown> & {
    title: string;
    cypher: { query: string };
};

export function PageItemTab({ pageItem }: { pageItem: PageItem }) {
    return (
        <Box
            sx={{
                marginLeft: "42px",
            }}
        >
            <ViewAsVerifiableCredentialButton pageItem={pageItem} />
        </Box>
    );
}
