from __future__ import annotations

import csv
import io
import zipfile
import base64
from typing import Any
from xml.etree import ElementTree as ET

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.product import Category, Product

XML_NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkg": "http://schemas.openxmlformats.org/package/2006/relationships",
}

PRODUCT_IMPORT_HEADERS = [
    "name",
    "sku",
    "price",
    "barcode",
    "category_id",
    "category_name",
    "status",
    "weight",
    "depth",
    "width",
    "height",
]

PRODUCT_IMPORT_SAMPLE_ROW = {
    "name": "Banh quy bo",
    "sku": "BQ-001",
    "price": "45000",
    "barcode": "8931234567890",
    "category_id": "",
    "category_name": "Do an vat",
    "status": "ACTIVE",
    "weight": "0.25",
    "depth": "12",
    "width": "8",
    "height": "6",
}

HEADER_ALIASES = {
    "name": {
        "name",
        "product_name",
        "ten",
        "ten_san_pham",
        "tensanpham",
        "tenhang",
        "ten_hang",
    },
    "sku": {"sku", "ma_sku", "product_sku", "ma_hang", "ma_san_pham", "masp"},
    "price": {"price", "gia", "gia_ban", "don_gia", "giaban"},
    "barcode": {"barcode", "bar_code", "ma_vach", "mavach"},
    "category_id": {"category_id", "danh_muc_id", "loai_id"},
    "category_name": {"category_name", "category", "danh_muc", "loai", "ten_danh_muc"},
    "status": {"status", "trang_thai", "state"},
    "weight": {"weight", "can_nang", "khoi_luong"},
    "depth": {"depth", "chieu_dai", "dai"},
    "width": {"width", "chieu_rong", "rong"},
    "height": {"height", "chieu_cao", "cao"},
}


def import_products_from_file(
    session: Session,
    *,
    file_bytes: bytes,
    filename: str,
) -> dict[str, Any]:
    rows = _read_tabular_rows(file_bytes, filename)
    if not rows:
        raise HTTPException(status_code=400, detail="File khong co du lieu")

    created = 0
    updated = 0
    errors: list[dict[str, Any]] = []
    error_rows: list[dict[str, str]] = []

    for index, raw_row in enumerate(rows, start=2):
        try:
            payload = _normalize_product_row(session, raw_row, row_number=index)
            product = session.exec(
                select(Product).where(Product.sku == payload["sku"])
            ).first()

            if product:
                for key, value in payload.items():
                    setattr(product, key, value)
                product.is_deleted = False
                product.deleted_at = None
                updated += 1
            else:
                session.add(Product(**payload))
                created += 1
        except HTTPException as exc:
            message = str(exc.detail)
            errors.append({"row": index, "message": message})
            error_rows.append(_build_error_row(raw_row, index, message))
        except ValueError as exc:
            message = str(exc)
            errors.append({"row": index, "message": message})
            error_rows.append(_build_error_row(raw_row, index, message))

    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Khong the import file do du lieu trung lap hoac khong hop le: {exc.orig}",
        ) from exc

    error_report_base64 = None
    error_report_file_name = None
    if error_rows:
        error_report_file_name = _build_error_file_name(filename)
        error_report_base64 = base64.b64encode(
            _build_error_report_xlsx(error_rows)
        ).decode("ascii")

    return {
        "file_name": filename,
        "total_rows": len(rows),
        "created_count": created,
        "updated_count": updated,
        "error_count": len(errors),
        "errors": errors[:50],
        "error_report_file_name": error_report_file_name,
        "error_report_content_base64": error_report_base64,
    }


def build_product_import_template() -> bytes:
    rows = [PRODUCT_IMPORT_HEADERS, [PRODUCT_IMPORT_SAMPLE_ROW.get(header, "") for header in PRODUCT_IMPORT_HEADERS]]
    return _build_xlsx_bytes("Products", rows)


def _read_tabular_rows(file_bytes: bytes, filename: str) -> list[dict[str, str]]:
    lower_name = filename.lower()
    if lower_name.endswith(".csv"):
        return _read_csv_rows(file_bytes)
    if lower_name.endswith(".xlsx"):
        return _read_xlsx_rows(file_bytes)
    raise HTTPException(status_code=400, detail="Chi ho tro file .xlsx hoac .csv")


def _read_csv_rows(file_bytes: bytes) -> list[dict[str, str]]:
    text = file_bytes.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    return [_normalize_row_keys(row) for row in reader if row]


def _read_xlsx_rows(file_bytes: bytes) -> list[dict[str, str]]:
    with zipfile.ZipFile(io.BytesIO(file_bytes)) as archive:
        shared_strings = _read_shared_strings(archive)
        sheet_path = _resolve_first_sheet_path(archive)
        xml_root = ET.fromstring(archive.read(sheet_path))

    rows: list[dict[str, str]] = []
    header_map: dict[str, str] = {}

    for row_index, row_node in enumerate(xml_root.findall(".//main:sheetData/main:row", XML_NS), start=1):
        values_by_index: dict[int, str] = {}
        for cell in row_node.findall("main:c", XML_NS):
            ref = cell.attrib.get("r", "")
            column_letters = "".join(ch for ch in ref if ch.isalpha())
            column_index = _column_letters_to_index(column_letters)
            values_by_index[column_index] = _read_cell_value(cell, shared_strings).strip()

        if not values_by_index:
            continue

        max_index = max(values_by_index)
        row_values = [values_by_index.get(index, "") for index in range(1, max_index + 1)]

        if row_index == 1:
            header_map = {
                idx: header.strip().lower()
                for idx, header in enumerate(row_values, start=1)
                if header.strip()
            }
            continue

        row_data = {
            header_map[idx]: row_values[idx - 1]
            for idx in header_map
            if idx - 1 < len(row_values)
        }
        if any(value.strip() for value in row_data.values()):
            rows.append(_normalize_row_keys(row_data))

    return rows


def _read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    strings: list[str] = []
    for item in root.findall("main:si", XML_NS):
        texts = [node.text or "" for node in item.findall(".//main:t", XML_NS)]
        strings.append("".join(texts))
    return strings


def _resolve_first_sheet_path(archive: zipfile.ZipFile) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    first_sheet = workbook.find("main:sheets/main:sheet", XML_NS)
    if first_sheet is None:
        raise HTTPException(status_code=400, detail="File Excel khong co sheet")

    rel_id = first_sheet.attrib.get(f"{{{XML_NS['rel']}}}id")
    for rel in rels.findall("pkg:Relationship", XML_NS):
        if rel.attrib.get("Id") == rel_id:
            target = rel.attrib.get("Target", "")
            if target.startswith("/"):
                return target.lstrip("/")
            return f"xl/{target}" if not target.startswith("xl/") else target

    raise HTTPException(status_code=400, detail="Khong tim thay du lieu sheet trong file Excel")


def _read_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//main:t", XML_NS))

    value_node = cell.find("main:v", XML_NS)
    if value_node is None or value_node.text is None:
        return ""

    raw_value = value_node.text
    if cell_type == "s":
        index = int(raw_value)
        return shared_strings[index] if index < len(shared_strings) else ""
    if cell_type == "b":
        return "TRUE" if raw_value == "1" else "FALSE"
    return raw_value


def _normalize_row_keys(row: dict[str, Any]) -> dict[str, str]:
    normalized: dict[str, str] = {}
    for key, value in row.items():
        if key is None:
            continue
        normalized[_canonicalize_header(str(key))] = "" if value is None else str(value).strip()
    return normalized


def _canonicalize_header(key: str) -> str:
    compact = (
        key.strip()
        .lower()
        .replace("\n", " ")
        .replace("-", "_")
        .replace("/", "_")
        .replace("\\", "_")
        .replace(".", "_")
        .replace(" ", "_")
    )
    compact = compact.strip("_")
    for canonical, aliases in HEADER_ALIASES.items():
        if compact in aliases:
            return canonical
    return compact


def _normalize_product_row(
    session: Session,
    row: dict[str, str],
    *,
    row_number: int,
) -> dict[str, Any]:
    name = _require_value(row, "name", row_number)
    sku = _require_value(row, "sku", row_number)
    price = _parse_float(row.get("price"), "price", row_number, required=True)
    status = (row.get("status") or "ACTIVE").strip().upper()
    if status not in {"ACTIVE", "INACTIVE"}:
        raise ValueError(f"Dong {row_number}: status phai la ACTIVE hoac INACTIVE")

    category_id = _parse_int(row.get("category_id"), "category_id", row_number, required=False)
    category_name = (row.get("category_name") or "").strip()

    if category_id is not None:
        category = session.get(Category, category_id)
        if not category or category.is_deleted:
            raise ValueError(f"Dong {row_number}: category_id khong ton tai")
    elif category_name:
        category = session.exec(
            select(Category).where(
                Category.name.ilike(category_name),
                Category.is_deleted.is_(False),
            )
        ).first()
        if not category:
            raise ValueError(f"Dong {row_number}: category_name khong ton tai")
        category_id = category.id

    dimensions = {
        "depth": _parse_float(row.get("depth"), "depth", row_number, required=False),
        "width": _parse_float(row.get("width"), "width", row_number, required=False),
        "height": _parse_float(row.get("height"), "height", row_number, required=False),
    }
    dimensions = {key: value for key, value in dimensions.items() if value is not None} or None

    weight = _parse_float(row.get("weight"), "weight", row_number, required=False)
    barcode = (row.get("barcode") or "").strip() or None

    return {
        "name": name,
        "sku": sku,
        "price": price,
        "barcode": barcode,
        "category_id": category_id,
        "status": status,
        "weight": weight,
        "dimensions": dimensions,
    }


def _require_value(row: dict[str, str], key: str, row_number: int) -> str:
    value = (row.get(key) or "").strip()
    if not value:
        raise ValueError(f"Dong {row_number}: cot {key} la bat buoc")
    return value


def _parse_float(value: str | None, field_name: str, row_number: int, *, required: bool) -> float | None:
    if value is None or str(value).strip() == "":
        if required:
            raise ValueError(f"Dong {row_number}: cot {field_name} la bat buoc")
        return None
    try:
        return float(str(value).replace(",", "").strip())
    except ValueError as exc:
        raise ValueError(f"Dong {row_number}: cot {field_name} phai la so") from exc


def _parse_int(value: str | None, field_name: str, row_number: int, *, required: bool) -> int | None:
    if value is None or str(value).strip() == "":
        if required:
            raise ValueError(f"Dong {row_number}: cot {field_name} la bat buoc")
        return None
    try:
        return int(float(str(value).strip()))
    except ValueError as exc:
        raise ValueError(f"Dong {row_number}: cot {field_name} phai la so nguyen") from exc


def _build_error_row(raw_row: dict[str, str], row_number: int, message: str) -> dict[str, str]:
    row = {header: raw_row.get(header, "") for header in PRODUCT_IMPORT_HEADERS}
    row["row_number"] = str(row_number)
    row["import_error"] = message
    return row


def _build_error_report_xlsx(error_rows: list[dict[str, str]]) -> bytes:
    headers = ["row_number", *PRODUCT_IMPORT_HEADERS, "import_error"]
    rows = [headers]
    for item in error_rows:
        rows.append([item.get(header, "") for header in headers])
    return _build_xlsx_bytes("ImportErrors", rows)


def _build_error_file_name(filename: str) -> str:
    if "." in filename:
        base_name = filename.rsplit(".", 1)[0]
    else:
        base_name = filename
    return f"{base_name}-import-errors.xlsx"


def _column_letters_to_index(letters: str) -> int:
    index = 0
    for char in letters.upper():
        index = index * 26 + (ord(char) - 64)
    return index


def _build_xlsx_bytes(sheet_name: str, rows: list[list[Any]]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", _content_types_xml())
        archive.writestr("_rels/.rels", _root_rels_xml())
        archive.writestr("xl/workbook.xml", _workbook_xml(sheet_name))
        archive.writestr("xl/_rels/workbook.xml.rels", _workbook_rels_xml())
        archive.writestr("xl/styles.xml", _styles_xml())
        archive.writestr("xl/worksheets/sheet1.xml", _worksheet_xml(rows))
    return buffer.getvalue()


def _worksheet_xml(rows: list[list[Any]]) -> str:
    row_xml: list[str] = []
    for row_index, row_values in enumerate(rows, start=1):
        cells: list[str] = []
        for col_index, value in enumerate(row_values, start=1):
            cell_ref = f"{_index_to_column_letters(col_index)}{row_index}"
            text = _escape_xml("" if value is None else str(value))
            cells.append(
                f'<c r="{cell_ref}" t="inlineStr"><is><t>{text}</t></is></c>'
            )
        row_xml.append(f'<row r="{row_index}">{"".join(cells)}</row>')

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        "<sheetData>"
        f'{"".join(row_xml)}'
        "</sheetData>"
        "</worksheet>"
    )


def _content_types_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        '<Override PartName="/xl/styles.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        "</Types>"
    )


def _root_rels_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
        'Target="xl/workbook.xml"/>'
        "</Relationships>"
    )


def _workbook_xml(sheet_name: str) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        "<sheets>"
        f'<sheet name="{_escape_xml(sheet_name)}" sheetId="1" r:id="rId1"/>'
        "</sheets>"
        "</workbook>"
    )


def _workbook_rels_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
        'Target="worksheets/sheet1.xml"/>'
        '<Relationship Id="rId2" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
        'Target="styles.xml"/>'
        "</Relationships>"
    )


def _styles_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
        '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
        '<borders count="1"><border/></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        "</styleSheet>"
    )


def _index_to_column_letters(index: int) -> str:
    letters = ""
    while index > 0:
        index, remainder = divmod(index - 1, 26)
        letters = chr(65 + remainder) + letters
    return letters


def _escape_xml(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )
