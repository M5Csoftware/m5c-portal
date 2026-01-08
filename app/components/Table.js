import React, { useEffect, useState } from 'react'
import Image from 'next/image';

export default function Table({ register, setValue, name, value = [], columns = [], rowData = [] }) {
    useEffect(() => {
        setValue(`${name}Table`, rowData);
    }, [rowData]);

    return (
        <div className='h-64 w-full overflow-auto  rounded-lg border border-battleship-gray text-xs'>
            <table className="w-full">
                <TableHeader columns={columns} />
                <tbody>
                    {rowData.map((item, index) => (
                        <TableRow key={index} rowData={item} columns={columns} />
                    ))}
                </tbody>
            </table>
            <input type="hidden"  {...register(`${name}Table`)} />
        </div>
    );
}

function TableHeader({ columns }) {
    return (
        <thead className="sticky top-0 bg-white border-b">
            <tr className="h-12">
                {columns.map((column, index) => (
                    <th
                        key={column.key}
                        className={` ${index !== columns.length - 1 ? 'border-r' : ''} px-4 py-2  text-left cursor-pointer select-none`}
                    >
                        <div className="flex items-center gap-2 text-nowrap">
                            {column.label}
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function TableRow({ rowData, columns }) {
    return (
        <tr className="border-b h-11">
            {columns.map((column, index) => (
                <td key={index} className={`px-4 py-2 text-gray-600 ${index !== columns.length - 1 ? 'border-r' : ''}`}>
                    <span>{rowData[column.key] !== null ? rowData[column.key] : "-"}</span>
                </td>
            ))}
        </tr>
    );
}

export function TableWithSorting({ register, setValue, name, columns = [], rowData = [] }) {
    const [sortKey, setSortKey] = useState("awbNo");
    const [sortOrder, setSortOrder] = useState("asc");

    useEffect(() => {
        setValue(`${name}Table`, rowData);
    }, [rowData]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const sortedData = [...rowData].sort((a, b) => {
        const valueA = a[sortKey];
        const valueB = b[sortKey];
        if (typeof valueA === "string" && typeof valueB === "string") {
            return sortOrder === "asc"
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        } else if (typeof valueA === "number" && typeof valueB === "number") {
            return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
        }
        return 0;
    });

    return (
        <div className="h-64 overflow-x-auto  table-scrollbar rounded-lg border border-battleship-gray text-xs">
            <table className="w-full">
                <TableHeaderWithSorting
                    columns={columns}
                    handleSort={handleSort}
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                />
                <tbody>
                    {sortedData.map((item, index) => (
                        <TableRowWithSorting key={index} rowData={item} columns={columns} />
                    ))}
                </tbody>
            </table>
            <input type="hidden" {...register(`${name}Table`)} />
        </div>
    );
}

function TableHeaderWithSorting({ columns, sortKey, sortOrder, handleSort }) {
    return (
        <thead className="sticky top-0 bg-white border-b text-dim-gray">
            <tr className="h-12">
                {columns.map((column, index) => (
                    <th
                        key={column.key}
                        onClick={() => handleSort(column.key)}
                        className={`${index !== columns.length - 1 ? "border-r" : "border-r"
                            } px-4 py-2 text-center cursor-pointer select-none`}
                    >
                        <div className="flex items-center gap-2 text-nowrap">
                            {column.label}
                            <span className="text-xs text-gray-500 hover:text-black">
                                {sortKey === column.key && (<div className={`${sortOrder === "asc" ? "rotate-180" : ""} w-4 h-4`}><Image src={`/arrow-sort-table.svg`} alt='arrow' width={16} height={16} /></div>)}
                            </span>
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function TableRowWithSorting({ rowData, columns }) {
    return (
        <tr className="border-b h-11">
            {columns.map((column, index) => (
                <td
                    key={index}
                    className={`px-4 py-2 text-eerie-black text-center ${index !== columns.length - 1 ? "border-r" : "border-r"
                        }`}
                >
                    <span>{column.key === "date" ? formatDate(rowData[column.key]) : rowData[column.key]}</span>
                </td>
            ))}
        </tr>
    );
}

export function TableWithCTA({ register, setValue, name, columns = [], rowData = [], handleDelete, handleEdit }) {
    useEffect(() => {
        setValue(`${name}Table`, rowData);
    }, [rowData]);

    return (
        <div className='h-64 w-full overflow-auto rounded-lg border border-[#EDEDED] text-xs bg-white'>
            <table className="w-full">
                <TableHeaderWithCTA columns={columns} />
                <tbody>
                    {rowData.map((item, index) => (
                        <TableRowWithCTA
                            key={index}
                            index={index}
                            rowData={item}
                            columns={columns}
                            handleDelete={handleDelete}
                            handleEdit={handleEdit}
                        />
                    ))}
                </tbody>
            </table>
            <input type="hidden" {...register(`${name}`)} />
        </div>
    );
}

function TableHeaderWithCTA({ columns }) {
    return (
        <thead className="sticky top-0 bg-white">
            <tr className="h-12 border-b border-alice-blue font-medium">
                {columns.map((column) => (
                    <th
                        key={column.key}
                        className="text-left pl-6 cursor-pointer select-none border-r"
                    >
                        <div className="flex items-center gap-2 text-nowrap">
                            {column.label}
                        </div>
                    </th>
                ))}
                <th className="text-center w-32">Actions</th>
            </tr>
        </thead>
    );
}

function TableRowWithCTA({ rowData, columns, handleDelete, handleEdit, index }) {
    return (
        <tr className="border-b border-alice-blue h-11 hover:bg-gray-50">
            {columns.map((column, colIndex) => (
                <td key={colIndex} className="text-gray-600 pl-6 border-r">
                    <span>{rowData[column.key]}</span>
                </td>
            ))}
            <td className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                        title="Edit item"
                    >
                        <Image
                            src="/Edit.svg"
                            alt="Edit"
                            width={16}
                            height={16}
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete item"
                    >
                        <Image
                            src="/addDelete.svg"
                            alt="Delete"
                            width={16}
                            height={16}
                        />
                    </button>
                </div>
            </td>
        </tr>
    );
}