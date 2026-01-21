import React, {
    useMemo,
    useState,
    useEffect,
    useRef,
    forwardRef,
    useCallback,
} from "react";
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from "@tanstack/react-table";
import { callwebService, getTenant } from "../../utils/helpers";
import { fetchCsrfToken } from "../../services/api/fetchCsrfService";
import {initializeWidget} from "../../index";
import useToast from "../../hooks/useToast";

import Zip from "./Zip.jsx";

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef(null);
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
        if (resolvedRef.current) {
            resolvedRef.current.indeterminate = indeterminate ?? false;
        }
    }, [resolvedRef, indeterminate]);

    return <input type="checkbox" ref={resolvedRef} {...rest} />;
});

function transformNode(node) {
    let childrenArray = [];
    if (node.children && typeof node.children === "object") {
        childrenArray = Object.values(node.children)
            .flat()
            .map(transformNode);
    }

    const { info = {} } = node;

    return {
        id: node.id,
        level: node.level,
        title: info.title || "No Title",
        owner: info.owner || "",
        created: info.created || "",
        state: info.state || "",
        children: childrenArray.length > 0 ? childrenArray : undefined,
    };
}

export default function HierarchicalTable({ originalData }) {
    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState({});
    const [levelInput, setLevelInput] = useState("");
    const [downloadableFiles, setDownloadableFiles] = useState([]);
    const [csvContent, setCsvContent] = useState('');
    const companyName = "Emerson";
    const loginUser = "RAhuja";
    const downloadedOn = new Date().toUTCString();
    const description = "ASSY, MODULE 9-WIRE, 4700 CNFG";
    let urls = { "urls" :[ ],"zip-name": originalData.info.title}
    const { showSuccessToast,showWarningToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const summaryCsv = `Summary Report
Type,Assembly Number,Revision
MMIAssemblyTransmitterPeripheral,="MMI-20075070",'AF'
State,Release
Description,"${description}"

Company Name,"${companyName}"
Login User,"${loginUser}"
Downloaded On,"${downloadedOn}"
Result,Sucess

File Name,Description
`;

    useEffect(() => {
        const fileSection = downloadableFiles
            .map(file => `"${file.filename}",`)
            .join("\n");

        setCsvContent(summaryCsv + fileSection);
    }, [downloadableFiles]);


    const transformedData = useMemo(() => {
        if (!originalData) return [];
        return [transformNode(originalData)];
    }, [originalData]);

    const columns = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <IndeterminateCheckbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
            },
            {
                accessorKey: "title",
                header: "Title",
                cell: ({ row, getValue }) => {
                    const canExpand = row.getCanExpand();
                    return (
                        <div
                            className={`d-flex align-items-center title-cell ${canExpand ? "cursor-pointer" : ""}`}

                            onClick={canExpand ? row.getToggleExpandedHandler() : undefined}
                        >
                            {canExpand ? (
                                <span className="me-1">{row.getIsExpanded() ? "▼" : "▶"}</span>
                            ) : (
                                <span className="me-1" />
                            )}
                            <span>{getValue()}</span>
                        </div>
                    );
                },
            },
            { accessorKey: "owner", header: "Owner" },
            { accessorKey: "created", header: "Created" },
            { accessorKey: "state", header: "State" },

        ],
        []
    );


    const table = useReactTable({
        data: transformedData,
        columns,
        state: {
            rowSelection,
            expanded,
        },
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        enableRowSelection: true,
        getRowId: (row) => row.id,
        getSubRows: (row) => row.children,
    });

    const collectExpandedIdsUpToLevel = useCallback((rows, maxLevel) => {
        let expandedIds = {};
        rows.forEach((row) => {
            if (row.level < maxLevel) {
                expandedIds[row.id] = true;
                if (row.children) {
                    Object.assign(
                        expandedIds,
                        collectExpandedIdsUpToLevel(row.children, maxLevel)
                    );
                }
            }
        });
        return expandedIds;
    }, []);

    const collectAllExpandedIds = useCallback((rows) => {
        let expandedIds = {};
        rows.forEach((row) => {
            if (row.children) {
                expandedIds[row.id] = true;
                Object.assign(expandedIds, collectAllExpandedIds(row.children));
            }
        });
        return expandedIds;
    }, []);

    const handleExpandInputChange = (e) => setLevelInput(e.target.value);

    const handleExpandInputBlur = () => {
        const val = levelInput.trim().toUpperCase();
        const data = [...transformedData]; // ensure fresh reference

        if (val === "N") {
            const allExpanded = collectAllExpandedIds(data);
            setExpanded(allExpanded);
        } else {
            const levelNum = Number(val);
            if (!isNaN(levelNum) && levelNum > 0) {
                const levelExpanded = collectExpandedIdsUpToLevel(data, levelNum);
                setExpanded(levelExpanded);
            } else {
                setExpanded({});
            }
        }
    };


    const findRowById = (data, id) => {
        for (const row of data) {
            if (row.id === id) {
                return {
                    title: row.info.title,
                    level: row.level,
                    owner: row.info.owner,
                    state: row.info.state,
                    revision: row.info.revision,
                    id:id
                };
            }
            if (row.children && Object.keys(row.children).length > 0) {
                const childrenLevels = Object.values(row.children).flat();
                const found = findRowById(childrenLevels, id);
                if (found) {
                    return found;
                }
            }
        }
        return "";
    };

    const getMei = async (baseURL,details,csvRows)=>{
        for (const detail of details) {
            let mei_title = "";
            console.log(detail);
            if (detail) {
                await fetchCsrfToken(widget.getValue("Credentials")).then(
                    async (csrfToken) => {
                        const headers = {
                            "Content-Type": "application/json",
                            ...csrfToken,
                        };
                        const data = {
                            "data": [
                                {
                                    "source": baseURL,
                                    "type": "VPMReference",
                                    "id": detail.id,
                                    "relativePath": "/resource/v1/dseng/dseng:EngItem/"+detail.id,
                                }
                            ]
                        };

                        return  await callwebService(
                            "POST",
                            baseURL.replace("space","sourcing")+`/resources/v1/modeler/dssrc/qualifications/contextLocate`,
                            JSON.stringify(data),
                            headers
                        ).then(async (response) => {
                            const mei =  response.output?.data?.find(item => item.type === "Engineering Equivalent Qualification")?.target.id;
                            if(mei){
                                await callwebService(
                                    "GET",
                                    baseURL+`/resources/v1/modeler/dseng/dseng:EngItem/`+mei,
                                    null,
                                    headers
                                ).then(async (response) => {
                                    return  mei_title =   response.output?.member[0].title;
                                })
                            } else {
                                return mei_title = "";
                            }

                        });
                    }

                );
                const row = [detail.title, detail.level, detail.owner, detail.state, detail.revision, mei_title];
                csvRows.push(row.join(','));
            }
        }
        return csvRows.join('\n');
    };


    const convertToCSV = async (baseURL,details) => {
        const header = ['title', 'level', 'owner', 'state','revision','Manufacturer Equivalent  Item'];
        const csvRows = [header.join(',')];
        return  await getMei(baseURL,details,csvRows);
    };

    const downloadCSV = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const selectedIds = Object.keys(rowSelection);
        const selectedDetails = selectedIds.map(id => findRowById([originalData], id));
        const baseUrl = await getTenant();
        const csvContent = await convertToCSV(baseUrl,selectedDetails);



        await Promise.all(selectedIds.map(id => download(baseUrl, id)))
        try {
            if (!urls.urls.length <= 0) {

                downloadCSV(csvContent, 'BomReport.csv');
                const progressBar = document.getElementById("progressBar");

                await Zip.getZipFileBlob(urls.urls, (completed, total) => {
                    progressBar.value = (completed / total) * 100;
                }).then(async blob => {
                    await Zip.downloadFile(blob, originalData.info.title);
                    progressBar.value = 100;
                    await initializeWidget();
                });


            } else {
                showSuccessToast("There are no derived outputs for selected object(s)")

            }
        }catch (e) {
            showSuccessToast("There are no derived outputs for selected object(s)")
        }
        finally {
            setIsLoading(false);
        }

    };

    const download = async (baseUrl, id) => {
        return  await getDerivedOutputs(id, baseUrl,setDownloadableFiles)
    };

    const getDerivedOutputs = async (PPId, baseUrl, setDownloadableFiles) => {
        await fetchCsrfToken(widget.getValue("Credentials")).then(
            async (csrfToken) => {
                const headers = {
                    "Content-Type": "application/json",
                    ...csrfToken,
                };
                const data = {
                    "referencedObject": [
                        {
                            "source": "3DSpace",
                            "type": "VPMReference",
                            "id": PPId,
                            "relativePath": "/resource/v1/dseng/dseng:EngItem/"+PPId
                        }
                    ]
                };

                return  await callwebService(
                    "POST",
                    `${baseUrl}/resources/v1/modeler/dsdo/dsdo:DerivedOutputs/Locate?$mask=dsmvdo:DerivedOutputsMask.Details`,
                    JSON.stringify(data),
                    headers
                ).then(async (response) => {
                    const files = response.output?.member?.flatMap(member =>
                        member.derivedOutputs?.derivedOutputfiles
                            ?.filter(file => file.downloadable)
                            .map(file => ({ id: file.id, filename: file.filename }))
                    ) || [];
                    const fileNames = files.map(file => file.filename);
                    setDownloadableFiles(prev => [...prev, ...fileNames]);
                    return  await getDerivedOutputTickets(PPId,baseUrl,files.map(file => file.id));
                });
            }
        );
    };

    const getDerivedOutputTickets = async (PPId,baseUrl, fileNames) => {
        try {
            const credentials = widget.getValue("Credentials");
            const csrfToken = await fetchCsrfToken(credentials);

            const headers = {
                "Content-Type": "application/json",
                ...csrfToken,
            };


            const requests = fileNames.map( async fileName => {
                const payload = "";

                await callwebService(
                    "POST",
                    `${baseUrl}/resources/v1/modeler/dsdo/dsdo:DerivedOutputs/`+PPId+`/dsdo:DerivedOutputFiles/`+fileName+`/DownloadTicket`,
                    "",
                    headers
                ).then(async response => {
                    //console.log(`✅ Success for "${fileName}":`, response);
                    const ticket = response.output.data?.dataelements?.ticket;
                    const ticketURL = response.output.data?.dataelements?.ticketURL;
                    if (ticket && ticketURL) {
                        const encodedTicket = encodeURIComponent(ticket);
                        const fullUrl = `${ticketURL}?__fcs__jobTicket=${encodedTicket}`;
                        const newUrlObject = {
                            url: fullUrl,
                            fileName: `${fileName}`
                        };
                        urls.urls.push(newUrlObject);
                    }
                }).catch(error => {
                    console.error(`❌ Error for "${fileName}":`, error?.message || error);

                });
            });

            const results = await Promise.all(requests);

            console.log("📦 All requests completed:", results);
            return results;

        } catch (err) {
            console.error("❗ Initialization failed:", err?.message || err);
            throw err;
        }
    };


    return (
        <div  className="container py-4"
              style={{
                  maxHeight: '100vh',
                  overflowY: 'auto',
                  overflowX: 'auto',
                  border: '1px solid #ccc',
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
              }}
        >
            {isLoading && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            <div className="d-flex justify-content-end align-items-center mb-3 gap-3">
                <input
                    type="text"
                    className="form-control w-auto"
                    placeholder="Enter level (e.g. 2) or N for all"
                    value={levelInput}
                    onChange={handleExpandInputChange}
                    onBlur={handleExpandInputBlur}
                    onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                />
                <progress id="progressBar" value="0" max="100"></progress>
                <button onClick={handleSubmit} className="btn btn-primary">
                    Download
                </button>
            </div>
            <table className="table table-bordered"  style={{ fontSize: "1.1rem" }}>
                <thead className="table-light">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr
                        key={row.id}
                        className={row.getIsSelected() ? "table-info" : ""}
                        onClick={row.getToggleSelectedHandler()}
                        style={{ cursor: "pointer" }}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
