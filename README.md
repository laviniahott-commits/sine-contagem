# SINE Contagem | Observatório do Trabalho

Painéis temáticos e indicadores públicos sobre o mercado de trabalho de Contagem (MG).

## Acesso ao site

- Site: https://laviniahott-commits.github.io/sine-contagem/
- Painel de Emprego formal: https://laviniahott-commits.github.io/sine-contagem/emprego-formal.html

## Critérios do projeto

- Priorizar fontes oficiais e verificáveis.
- Identificar fonte, período de referência e unidade de medida em cada indicador.
- Não preencher lacunas com estimativas ou números ilustrativos.
- Preservar valores ausentes como `null`, nunca convertê-los automaticamente em zero.
- Manter separadas séries com metodologias diferentes.

## Painel 01 — Emprego formal

Fonte principal: Ministério do Trabalho e Emprego (MTE), Novo Caged.

A base municipal será consolidada em `data/emprego-formal.json`. O painel apresenta admissões, desligamentos, saldo, estoque quando houver dado oficial comparável, filtros de período, gráfico, tabela e exportação CSV.

### Processamento

O script `scripts/process_novo_caged.py` foi preparado para agregar um arquivo TXT mensal depois que o leiaute oficial e os nomes exatos das colunas forem conferidos. Não execute com nomes de colunas presumidos: o código municipal e a variável de movimentação precisam corresponder ao arquivo e à documentação da competência.

Consulte `docs/ATUALIZACAO-EMPREGO-FORMAL.md` para o procedimento e as regras de validação.

### Validação automática

O GitHub Actions verifica a estrutura do JSON, o código territorial, os períodos, os tipos numéricos e a consistência do saldo sempre que a base é alterada.

## Situação da integração

A interface do painel está implementada. A série municipal ainda depende da extração e validação dos dados oficiais do Novo Caged. Até lá, os indicadores permanecem vazios intencionalmente.
