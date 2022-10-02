import * as React from "react";
import Button from "@mui/material/Button";

import SendIcon from "@mui/icons-material/Send";

import CopyAllIcon from "@mui/icons-material/CopyAll";

import AccountTreeIcon from "@mui/icons-material/AccountTree";

import Stack from "@mui/material/Stack";

import method from "@or13/did-jwk";
import { toast } from "react-toastify";
import PageActor from "../../services/PageActor";
import { CopyToClipboard } from "react-copy-to-clipboard";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Buffer = require("buffer/").Buffer;

const privateKeyJwk = {
    kid: "urn:ietf:params:oauth:jwk-thumbprint:sha-256:-JHL9Tbsc5BpkeR6amgD10gTNU7n7z2075-zSITUNvQ",
    kty: "EC",
    crv: "P-256",
    alg: "ES256",
    x: "QRN6DjSWfvYoQhqQPMLX6mS0qglltfBiRqFtCQGmjDw",
    y: "z__QKGsBn8tLollHC2pCdMD8qk1iTImjDiUSPD1T9WA",
    d: "Klyjp68stKiESv1m61wDDQZZs3oSfI0QAosRnIgmrWE",
};

const t = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        { "@vocab": "https://www.w3.org/ns/credentials#" },
    ],
    id: {},
    type: ["VerifiableCredential", "PageContentCredential"],
    issuer: {
        id: "did:example:123",
        type: ["WebExtensionObserver"],
    },
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialSubject: {},
};

const issueAndOpenLink = async (pageItem: any) => {
    const did = await method.toDid(privateKeyJwk);
    const clone = JSON.parse(JSON.stringify(pageItem.document));
    delete clone["@context"];
    const tc = JSON.parse(JSON.stringify(t));
    tc.id = pageItem.json.id;
    tc.credentialSubject = clone;
    tc.issuer.id = did;
    tc.issuanceDate = new Date().toISOString();
    const message = Buffer.from(JSON.stringify({ vc: tc }));
    const jws = await method.signAsDid(message, privateKeyJwk);
    PageActor.openNewTab(`https://lucid.did.cards/credentials/${jws}`);
};

export function ViewAsVerifiableCredentialButton({ pageItem }: any) {
    return (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
                color={"secondary"}
                endIcon={<AccountTreeIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => {
                    issueAndOpenLink(pageItem);
                }}
            >
                View Credential
            </Button>

            <CopyToClipboard
                text={pageItem.nquads}
                onCopy={() => {
                    toast("Copied application/n-quads to clipboard!");
                }}
            >
                <Button
                    endIcon={<CopyAllIcon />}
                    sx={{ textTransform: "none" }}
                >
                    n-quads
                </Button>
            </CopyToClipboard>

            <CopyToClipboard
                text={pageItem.cypher.query}
                onCopy={() => {
                    toast("Copied cypher query to clipboard!");
                }}
            >
                <Button
                    endIcon={<CopyAllIcon />}
                    sx={{ textTransform: "none" }}
                >
                    cypher query
                </Button>
            </CopyToClipboard>
        </Stack>
    );
}
