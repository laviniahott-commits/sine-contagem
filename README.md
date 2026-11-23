# SINE Contagem | Observatório do Trabalho

Portal de indicadores públicos sobre emprego, renda e condições de trabalho em Contagem (MG), com identidade visual institucional e prioridade para fontes oficiais.

## Acesso

- **Portal:** https://laviniahott-commits.github.io/sine-contagem/
- **Painel de emprego formal:** https://laviniahott-commits.github.io/sine-contagem/emprego-formal.html

## Estrutura

- `index.html`: página inicial e navegação temática.
- `emprego-formal.html`: painel de emprego formal.
- `emprego-formal.js`: filtros, indicadores, gráficos e exportação CSV.
- `data/emprego-formal.json`: dados estruturados do painel.
- `styles.css`: identidade visual e responsividade.
- `scripts/process_novo_caged.py`: apoio à consolidação dos microdados.
- `.github/workflows/validate-employment-data.yml`: validação automática da estrutura dos dados.

## Critérios de publicação

1. Informar fonte, período de referência, unidade e abrangência territorial.
2. Não criar estimativas para preencher lacunas.
3. Preservar dados ausentes como `null`, sem convertê-los em zero.
4. Separar séries com metodologias diferentes.
5. Distinguir dados conferidos de dados ainda pendentes de validação.

## Situação do painel de emprego formal

A interface contém filtros de período e indicador, cartões-resumo, gráficos, tabelas e exportação CSV. A base contém uma competência mensal (setembro de 2026) e um quadro anual de 2021 a 2025, além de recorte setorial.

**Validação parcial:** os totais municipais de setembro de 2026 — 14.778 admissões, 11.872 desligamentos e saldo de 2.906 vínculos — foram corroborados por publicação da Prefeitura de Contagem que atribui os números ao Caged/MTE.

**Pendente de conferência na base primária:** estoque, variação relativa, quadro anual e distribuição setorial. Até essa conferência, esses campos não devem ser tratados como série oficialmente validada nem usados em divulgação institucional.

Consulte:
- [Procedimento de atualização](docs/ATUALIZACAO-EMPREGO-FORMAL.md)
- [Status e pendências do projeto](docs/STATUS-PROJETO.md)
- [Painel Novo Caged do MTE](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho/novo-caged)

## Publicação

O site é publicado pelo GitHub Pages a partir do branch `main`. Alterações em arquivos do site são publicadas após a conclusão do fluxo de implantação.
