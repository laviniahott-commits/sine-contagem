# Atualização do painel — Emprego formal (Contagem)

## Fonte primária
Ministério do Trabalho e Emprego (MTE), Programa de Disseminação das Estatísticas do Trabalho (PDET), microdados do Novo Caged.

- Página oficial de microdados: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/microdados-rais-e-caged
- Perfil do Município: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/perfil-do-municipio
- Painel mensal: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/novo-caged

## Recorte territorial
- Município: Contagem — MG
- Código IBGE: 3118601

## Variáveis esperadas no arquivo publicado pelo site
O arquivo `data/emprego-formal.json` é a camada de dados consumida pelo painel. Cada observação mensal deve conter:
- `period`: mês de referência no formato `AAAA-MM`;
- `admissions`: admissões (vínculos);
- `dismissals`: desligamentos (vínculos);
- `balance`: saldo de movimentações (vínculos);
- `stock`: estoque de vínculos, somente quando a fonte e a metodologia fornecerem essa medida para o mesmo recorte.

## Regras de validação antes de publicar
1. Confirmar que o arquivo corresponde ao Novo Caged e registrar o mês/ano de referência.
2. Filtrar exclusivamente o município de código 3118601.
3. Distinguir dados ajustados e não ajustados; não concatenar séries com metodologias diferentes sem nota.
4. Verificar se o saldo publicado corresponde a admissões menos desligamentos para o mesmo recorte.
5. Não somar estoques entre meses; apresentar o estoque do último mês selecionado.
6. Preservar valores ausentes como ausentes — nunca substituir por zero.
7. Registrar no JSON a URL da fonte, data de extração e referência temporal.

## Situação atual
A interface, filtros, tabela, gráfico e exportação CSV estão implementados. A série municipal ainda não foi carregada: o JSON permanece vazio intencionalmente para impedir a publicação de números não verificados.

## Frequência
O MTE divulga o CAGED mensalmente, normalmente na segunda quinzena do mês seguinte ao período de referência. A atualização do painel deve ocorrer após a publicação oficial e a validação do arquivo.
