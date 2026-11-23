# Situação do projeto — SINE Contagem | Observatório do Trabalho

Atualizado em 23/11/2026.

## Site e publicação

- Página inicial: https://laviniahott-commits.github.io/sine-contagem/
- Painel 01 — Emprego formal: https://laviniahott-commits.github.io/sine-contagem/emprego-formal.html
- Repositório: https://github.com/laviniahott-commits/sine-contagem
- Publicação por GitHub Pages.

## O que está implementado

- Página institucional do Observatório, navegação responsiva e rodapé padronizado.
- Painel de emprego formal com filtros de período e indicador, cartões de indicadores, tabela mensal, série anual, gráficos e exportação CSV.
- Separação entre a competência mensal mais recente e a série anual de 2021 a 2025.
- Mensagens de estado para carregamento e indisponibilidade da base.
- Links para consultas e microdados oficiais do Ministério do Trabalho e Emprego.
- Verificação automática da estrutura do JSON, períodos, tipos e consistência aritmética; verificação de sintaxe do processador Python.
- Fotografia do Itaú Power Shopping, em Contagem, com crédito ao autor Truu e licença CC BY-SA 3.0 na página inicial.

## Pendências que impedem considerar os dados oficiais validados

Os valores atualmente armazenados em data/emprego-formal.json foram inseridos para desenvolvimento e ainda precisam ser confrontados com a extração oficial e as notas metodológicas do MTE. A validação automática do GitHub confere estrutura e contas; ela **não** autentica a origem dos números.

Antes de divulgação institucional, conferir:
- código municipal exatamente como aparece nos microdados;
- competência e revisões da base;
- admissões, desligamentos e saldo;
- classificação setorial;
- estoque e variação relativa, com a metodologia correspondente;
- série anual e comparabilidade entre competências.

O processador scripts/process_novo_caged.py é assistido: exige que a pessoa responsável confira o leiaute e informe os nomes e códigos exatos das colunas e categorias. Ele não baixa os arquivos do MTE nem atualiza o painel sozinho. A automação de coleta só deve ser feita depois de confirmar um endereço de acesso estável e o leiaute oficial.

## Demais painéis

A página inicial apresenta os temas Mercado local, Empresas e atividades, Trabalho e renda, Trabalho decente e Território e desenvolvimento como frentes previstas. Eles ainda não possuem painéis de dados implementados. Não foram preenchidos com números ilustrativos.

## Identidade visual

O layout institucional e o rodapé estão padronizados. As imagens originais dos logotipos do SINE e da Prefeitura ainda precisam ser inseridas; não foram substituídas por versões genéricas. Para isso, utilizar os arquivos oficiais originais fornecidos pela equipe.

## Critério para concluir

O projeto estará pronto para divulgação institucional quando os dados do painel 01 forem validados diretamente no MTE, os logotipos oficiais forem aplicados e os demais painéis forem construídos com suas respectivas bases e fichas metodológicas.