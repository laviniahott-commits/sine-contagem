#!/usr/bin/env python3
"""Aggregate one official Novo Caged monthly TXT into the panel JSON.

The official TXT layout must be checked before running. Pass the exact column
names from that month's official layout; this script deliberately does not
guess column names or calculate an employment stock.
"""
import argparse
import csv
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="Official monthly Novo Caged TXT file")
    parser.add_argument("--output", default="data/emprego-formal.json")
    parser.add_argument("--period", required=True, help="Reference month, YYYY-MM")
    parser.add_argument("--municipality-column", required=True, help="Exact municipality-code column name")
    parser.add_argument("--movement-column", required=True, help="Exact signed movement column name (+1 admission, -1 dismissal)")
    parser.add_argument("--municipality-code", required=True, help="Contagem code exactly as represented in the TXT")
    parser.add_argument("--encoding", default="utf-8-sig")
    args = parser.parse_args()

    if len(args.period) != 7 or args.period[4] != "-":
        parser.error("--period must use YYYY-MM")

    admissions = dismissals = 0
    seen = 0
    with open(args.input, "r", encoding=args.encoding, newline="") as source:
        reader = csv.DictReader(source, delimiter=";")
        if not reader.fieldnames:
            raise SystemExit("Arquivo sem cabeçalho.")
        missing = {args.municipality_column, args.movement_column} - set(reader.fieldnames)
        if missing:
            raise SystemExit("Colunas não encontradas no cabeçalho: " + ", ".join(sorted(missing)))
        for row in reader:
            if (row.get(args.municipality_column) or "").strip() != args.municipality_code:
                continue
            raw = (row.get(args.movement_column) or "").strip().replace(",", ".")
            try:
                movement = float(raw)
            except ValueError:
                raise SystemExit("Valor de movimentação inválido: " + repr(raw))
            if movement == 1:
                admissions += 1
            elif movement == -1:
                dismissals += 1
            else:
                raise SystemExit("Código de movimentação inesperado: " + repr(raw))
            seen += 1

    if seen == 0:
        raise SystemExit("Nenhuma linha encontrada para o código municipal informado.")

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
