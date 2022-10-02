// import { Quadstore } from "quadstore";
// import { DataFactory } from "rdf-data-factory";
// import { Engine } from "quadstore-comunica";
// import { BrowserLevel } from "browser-level";
import jsonld from "jsonld";
import { v4 as uuidv4 } from "uuid";

// const backend = new BrowserLevel("quadstore");
// const dataFactory = new DataFactory();
// const store = new Quadstore({ backend, dataFactory });
// const engine = new Engine(store);

const getPrimitiveTypeFromObject = (str: string) => {
    if (str.includes("<http://www.w3.org/2001/XMLSchema#integer>")) {
        const v = str.split("^^")[0];
        return parseInt(v.replace(/"/g, ""), 10);
    }
    return str.replace(/'/g, "\\'");
};

const graphToCypher = async (graph: any) => {
    const args = {};
    let query = `CREATE ( g:NamedGraph { uri: "${graph.id}" } )\n`;
    const nodesMerged = [];
    const nodeIdToNodeName: any = {};
    for (const nodeIndex in graph.nodes) {
        const node = graph.nodes[nodeIndex];
        const nodeName = `n${nodeIndex}`;
        const nodeRelationInGraph = `r${nodeIndex}`;

        nodeIdToNodeName[node.id] = nodeName;

        if (Object.keys(node).length > 2) {
            const { id, value, ...props } = node;
            const propKeys: any = Object.keys(props);
            const rdf_keys = [];
            const rdf_values = [];
            const rps = [];
            for (const ki in propKeys) {
                const k = propKeys[ki];
                const v = props[k];
                const niceName = k
                    .split("/")
                    .pop()
                    .split("#")
                    .pop()
                    .replace(">", "");
                rdf_keys.push(`'${k}'`);
                rdf_values.push(`'${v.replace(/'/g, "\\'")}'`);
                rps.push(`${niceName}: ${getPrimitiveTypeFromObject(v)}`);
            }
            const typedProperties = rps.join(", ");
            query += `MERGE ( ${nodeName} :Resource { uri: "${node.id}", ${typedProperties}, rdf_keys: [${rdf_keys}], rdf_values: [${rdf_values}] } )\n`;
        } else {
            query += `MERGE ( ${nodeName} :Resource { uri: "${node.id}" } )\n`;
        }
        query += `CREATE (g)-[${nodeRelationInGraph}: FROM_NAMED_GRAPH ]->(${nodeName})\n`;
        nodesMerged.push(nodeName);
    }

    for (const edgeIndex in graph.links) {
        const edge = graph.links[edgeIndex];
        const edgeName = `e${edgeIndex}`;
        const sourceName = nodeIdToNodeName[edge.source];
        const targetName = nodeIdToNodeName[edge.target];
        query += `CREATE (${sourceName})-[${edgeName}: FROM_NAMED_GRAPH_EDGE ]->(${targetName})\n`;
    }

    query += `RETURN ${nodesMerged}\n`;
    return { query, args };
};

const getTitle = (doc: any) => {
    if (doc.id) {
        return doc.id;
    }

    if (doc.type) {
        return doc.type;
    }

    if (doc.name) {
        return doc.name;
    }

    if (doc["@id"]) {
        return doc["@id"];
    }

    if (doc["@type"]) {
        return doc["@type"];
    }
};

const processItem = async (doc: any) => {
    const nquads = await jsonld.canonize(doc, {
        algorithm: "URDNA2015",
        format: "application/n-quads",
    });
    const graphId = `urn:uuid:${uuidv4()}`;
    const nodes: any = {};
    const links: any = [];
    await Promise.all(
        nquads.split("\n").map(async (row: string) => {
            const match = row.match(
                /^(?<subject>(<([^<>]+)>|^_:c14n\d+)) (?<predicate>(<([^<>]+)>)) (?<object>(.+))/,
            );
            if (match) {
                // eslint-disable-next-line prefer-const
                let { subject, predicate, object }: any = match.groups;

                if (subject.startsWith("_:c14n")) {
                    subject = `<${graphId}:${subject}>`;
                }
                if (object.startsWith("_:c14n")) {
                    object = `<${graphId}:${object}>`;
                }

                if (!nodes[subject]) {
                    // node does not yet exist, add it
                    nodes[subject] = {
                        id: subject,
                        value: subject,
                    };
                } else {
                    // node exists already, see its object has properties
                    if (!object.startsWith("<")) {
                        nodes[subject] = {
                            ...nodes[subject],
                            [predicate]: object,
                        };
                    }
                }

                if (predicate.startsWith("<")) {
                    if (!nodes[predicate]) {
                        nodes[predicate] = {
                            id: predicate,
                            value: predicate,
                        };
                    }
                } else {
                    console.error(
                        "Never expected a predicate like this",
                        predicate,
                    );
                }

                links.push({
                    source: subject,
                    target: predicate,
                });

                if (object.startsWith("<") || object.startsWith("_:c14n")) {
                    // object is another node (which contains properties)
                    if (!nodes[object]) {
                        nodes[object] = {
                            id: object,
                            value: object,
                        };
                    }

                    links.push({
                        source: predicate,
                        target: object,
                    });
                } else {
                    // object is properties... of a subject.
                }
            }
        }),
    );

    const jsonGraph = {
        id: graphId,
        nodes: Object.values(nodes),
        links,
    };
    const cypher = await graphToCypher(jsonGraph);

    const title = getTitle(doc).replace(/[\\'\\"]+/g, "");

    return { title, json: jsonGraph, nquads, cypher };
};

const processItems = async (items: any) => {
    const processedItems = await Promise.all(
        items.map(async (i: any, index: number) => {
            const item = await processItem(i);
            item.title = item.title + index;
            return item;
        }),
    );
    return processedItems;
};

const LinkedData = {
    processItems,
    // backend,
    // dataFactory,
    // store,
    // engine,
    // all: async (): Promise<any> => {
    //     return new Promise(async (resolve) => {
    //         await store.open();
    //         const { items } = await store.get({});
    //         const quads = items.map((i) => {
    //             return [
    //                 i.subject.value,
    //                 i.predicate.value,
    //                 i.object.value,
    //                 i.graph.value,
    //             ];
    //         });
    //         resolve(quads);
    //     });
    // },
    // add: async (doc: any, graph: string): Promise<any> => {
    //     return new Promise(async (resolve) => {
    //         await store.open();
    //         resolve({ json: jsonGraph, nquads, cypher });
    //     });
    // },
    // clear: async (): Promise<any> => {
    //     return new Promise(async (resolve) => {
    //         await store.open();
    //         await store.clear();
    //         resolve(true);
    //     });
    // },
};

export default LinkedData;
