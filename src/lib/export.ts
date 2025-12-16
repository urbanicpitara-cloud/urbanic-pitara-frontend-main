export function exportToCSV<T extends Record<string, string | number | boolean | null | undefined>>(
    data: T[],
    filename: string
) {
    if (!data.length) {
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(","),
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if necessary
                    const stringValue = value === null || value === undefined ? "" : String(value);
                    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                })
                .join(",")
        ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
