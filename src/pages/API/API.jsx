import React, { useState, useRef, useEffect } from 'react';
import { Image } from "react-bootstrap";
import { makeDroppable, callwebService, getTenant } from "../../utils/helpers";
import { fetchCsrfToken } from "../../services/api/fetchCsrfService";
import ExpandableTable from "./ExpandableTable";
import "../../index.css";
import useToast from "../../hooks/useToast";
import { ZIP_DATA_RETRIEVAL_SUCCESS } from "../../utils/toastMessages";
import Loader from "../../components/Loader/Loader";
const API = () => {
    const dropContainerRef = useRef(null);
    const [isDropped, setIsDropped] = useState(false);
    const [jsonData, setJsonData] = useState(null);

    const [loading, setLoading] = useState(false);
    const { showSuccessToast } = useToast();

    useEffect(() => {
        const dropContainer = dropContainerRef.current;
        if (dropContainer) {
            makeDroppable(dropContainer, handleDrop);
        }
    }, []);


    const  buildHierarchy1 = async (paths)=> {
        const root = { id: paths[0][0], level: 0, children: {} };

        paths.forEach(path => {
            let currentLevel = root;

            path.slice(1).forEach((id, index) => {
                const level = `level${index + 1}`;
                if (!currentLevel.children[level]) {
                    currentLevel.children[level] = [];
                }
                let child = currentLevel.children[level].find(child => child.id === id);
                if (!child) {
                    child = { id, level: index + 1, children: {} };
                    currentLevel.children[level].push(child);
                }
                currentLevel = child;
            });
        });

        return root;
    }

    const  buildHierarchy = async (paths)=> {
        const isObject = (item) => {
            return (item && typeof item === 'object' && !Array.isArray(item));
        }

        const mergeDeep = (target, ...sources) => {
            if (!sources.length) return target;
            const source = sources.shift();

            if (isObject(target) && isObject(source)) {
                for (const key in source) {
                    if (isObject(source[key])) {
                        if (!target[key]) Object.assign(target, { [key]: {} });
                        mergeDeep(target[key], source[key]);
                    } else {
                        Object.assign(target, { [key]: source[key] });
                    }
                }
            }

            return mergeDeep(target, ...sources);
        }

        const roots = paths.map(path => path.reduceRight((all, item) => ({[item]: all}), {}));

        return mergeDeep({}, ...roots);
    }


    const findMemberById = (id, members) => members.find(member => member.id === id);

    const appendInfo = (jsonNode, members) => {
        if (jsonNode.id) {
            const memberInfo = findMemberById(jsonNode.id, members);
            if (memberInfo) {
                jsonNode.info = memberInfo;
            }
        }
        if (jsonNode.children) {
            Object.values(jsonNode.children).forEach(level => {
                level.forEach(child => appendInfo(child, members));
            });
        }
    };
    const getRelatedItems = async (objectId) => {
        const baseUrl = await getTenant();
        await fetchCsrfToken(widget.getValue("Credentials"))
            .then(async (csrfToken) => {
                const headers = {
                    "Content-Type": "application/json",
                    ...csrfToken
                };
                const data = {
                    "expandDepth": -1,
                    "withPath": true,
                    "type_filter_bo": ["VPMReference"],
                };
                await callwebService('POST', `${baseUrl}/resources/v1/modeler/dseng/dseng:EngItem/` + objectId + `/expand`, JSON.stringify(data), headers)
                    .then(async (response) => {
                        console.log(response)
                        const filteredPaths = response.output.member.filter(member => member.Path && member.Path.length > 0) // Ensure Path exists and is not empty
                            .map(member => member.Path.filter((_, index) => index % 2 === 0));
                        console.log(filteredPaths);

                        const hierarchy = buildHierarchy(filteredPaths);
                        console.log(hierarchy);
                        appendInfo(hierarchy, response.output.member);


                        console.log(hierarchy);
                        setJsonData(hierarchy);
                        showSuccessToast(ZIP_DATA_RETRIEVAL_SUCCESS);
                    });
            });
    };

    const handleDrop = async (dropObject) => {
        const id = dropObject.data?.items[0]?.objectId;
        setIsDropped(true);
        setLoading(true);
        try {
            await getRelatedItems(id);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="api-container">
            {!isDropped && (
                <div
                    ref={dropContainerRef}
                    className="droppable-container mt-4"
                >
                    <Image
                        style={{ width: "90px", height: "90px" }}
                        src="https://thewhitechamaleon.github.io/testrapp/images/drag.png"
                        alt="Drag and Drop Physical Product"
                        className="search-icon"
                        onError={(e) => console.error("Error loading drag image:", e)}

                    />
                    <span className="drag-and-drop-text">Drag and Drop</span>
                </div>
            )}

            {loading && (
                <Loader />
            )}

            {!loading && jsonData && (
                <ExpandableTable originalData={jsonData} />
            )}
        </div>
    );
};

export default API;
