#!/usr/bin/env python3
"""Aggregate one official Novo Caged monthly TXT into the panel JSON.

This script does not assume the official movement codes. The operator must
inspect the layout for the selected competence and pass the exact values that
represent admission and dismissal. Each accepted row is counted as one movement.
"""
import argparse
import csv
import json
import re
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="Official monthly Novo Caged TXT file")
    parser.add_argument("--output", default="data/emprego-formal.json")
    parser.add_argument("--period", required=True, help="Reference month, YYYY-MM")
    parser.add_argument("--municipality-column", required=True, help="Exact municipality-code column name")
    parser.add_argument("--movement-column", required=True, help="Exact movement-type column name")
    parser.add_argument("--municipality-code", required=True, help="Contagem code exactly as represented in the TXT")
    parser.add_argument("--admission-value", required=True, help="Exact value in the TXT that means admission")
    parser.add_argument("--dismissal-value", required=True, help="Exact value in the TXT that means dismissal")
    parser.add_argument("--encoding", default="utf-8-sig")
    args = parser.parse_args()

    if not re.fullmatch(r"\\d{4}-(0[1-9]|1[0-2])", args.period):
        parser.error("--period must use YYYY-MM")
    if args.admission_value == args.dismissal_value:
        parser.error("Admission and dismissal values must be different")

    admissions = dismissals = 0
    with open(args.input, "r", encoding=args.encoding, newline="") as source:
        reader = csv.DictReader(source, delimiter=";")
        if not reader.fieldnames:
            raise SystemExit("Arquivo sem cabeçalho.")
        required = {args.municipality_column, args.movement_column}
        missing = required - set(reader.fieldnames)
        if missing:
            raise SystemExit("Colunas não encontradas no cabeçalho: " + ", ".join(sorted(missing)))

        for line_number, row in enumerate(reader, start=2):
            if (row.get(args.municipality_column) or "").strip() != args.municipality_code:
                continue
            movement = (row.get(args.movement_column) or "").strip()
            if movement == args.admission_value:
                admissions += 1
            elif movement == args.dismissal_value:
                dismissals += 1
            else:
                raise SystemExit(
                    f"Tipo de movimentação não mapeado na linha {line_number}: {movement!r}. "
                    "Confira o leiaute; não descarte categorias silenciosamente."
                )

    if admissions + dismissals == 0:
        raise SystemExit("Nenhuma movimentação encontrada para o código municipal informado.")

    output = Path(args.output)
    payload = {
        "source": "Ministério do Trabalho e Emprego — Novo Caged",
        "source_url": "https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/microdados-rais-e-caged",
        "municipality": "Contagem",
        "ibge_code": "3118601",
        "source_municipality_code": args.municipality_code,
        "unit": "movimentações/vínculos",
        "reference": args.period,
        "data": [{
            "period": args.period,
            "admissions": admissions,
            "dismissals": dismissals,
            "balance": admissions - dismissals,
            "stock": None
        }]
    }

    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        existing = json.loads(output.read_text(encoding="utf-8"))
        previous = [r for r in existing.get("data", []) if r.get("period") != args.period]
        payload["data"] = sorted(previous + payload["data"], key=lambda item: item["period"])
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\\n", encoding="utf-8")
    print(f"{args.period}: {admissions} admissões, {dismissals} desligamentos, saldo {admissions-dismissals}.")
    print(f"Arquivo atualizado: {output}")


if __name__ == "__main__":
    main()
