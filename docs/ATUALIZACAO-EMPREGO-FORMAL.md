# Atualização do painel — Emprego formal (Contagem)

## Fonte primária
Ministério do Trabalho e Emprego (MTE), Programa de Disseminação das Estatísticas do Trabalho (PDET), microdados do Novo Caged.

- Página oficial e instruções de acesso: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/microdados-rais-e-caged
- Perfil do Município: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/perfil-do-municipio
- Painel mensal: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/novo-caged

O MTE disponibiliza microdados em TXT, delimitados por ponto e vírgula. A página oficial informa acesso ao diretório por FTP e alerta que navegadores podem não suportar esse protocolo. Portanto, o repositório não presume uma URL HTTPS direta nem inventa nomes de arquivos.

## Recorte territorial
- Município: Contagem — MG
- Código IBGE completo: 3118601.
- O código municipal dentro do TXT deve ser confirmado no leiaute oficial do arquivo antes do processamento. Não presumir que o campo use o código completo com dígito verificador.

## Processamento local assistido
Foi incluído `scripts/process_novo_caged.py`. Ele agrega um TXT mensal após a pessoa responsável conferir o leiaute oficial e informar os nomes exatos das colunas. Exemplo de execução (substitua os nomes entre aspas pelos cabeçalhos reais do arquivo):

```bash
python scripts/process_novo_caged.py "CAGEDMOV2026XXXX.txt" \
  --period 2026-XX \
  --municipality-column "NOME_EXATO_DA_COLUNA_MUNICIPIO" \
  --movement-column "NOME_EXATO_DA_COLUNA_TIPO_MOVIMENTACAO" \
  --municipality-code "CODIGO_EXATO_DE_CONTAGEM" \
  --admission-value "VALOR_EXATO_ADMISSAO" \
  --dismissal-value "VALOR_EXATO_DESLIGAMENTO"
```

O script:
- exige o mês de referência e os nomes exatos das colunas;
- filtra somente o código municipal informado;
- conta as linhas classificadas como admissão e desligamento usando os valores exatos informados por quem conferiu o leiaute;
- calcula o saldo como admissões menos desligamentos;
- mantém o estoque como `null`, pois estoque não pode ser inferido pela soma de movimentações;
- acrescenta/atualiza o mês no JSON, sem substituir os demais meses.

**Atenção:** antes de executar, conferir o leiaute e a codificação do TXT daquele período. Os códigos ou descrições que representam admissão e desligamento variam conforme o leiaute; por isso, o script exige que os valores exatos sejam informados após a conferência da documentação oficial. Categorias não mapeadas interrompem o processamento em vez de serem descartadas. O script não inclui ajustes fora do prazo ou exclusões automaticamente; isso precisa ser definido conforme o indicador e as notas metodológicas da competência.

## Estrutura de dados
Cada observação mensal em `data/emprego-formal.json` deve conter:
- `period`: mês de referência em `AAAA-MM`;
- `admissions`: admissões (movimentações);
- `dismissals`: desligamentos (movimentações);
- `balance`: saldo (admissões menos desligamentos);
- `stock`: estoque de vínculos, somente quando obtido de uma fonte oficial comparável; caso contrário, `null`.

O JSON também registra a fonte, URL, código territorial usado no arquivo e referência temporal.

## Regras de validação antes de publicar
1. Confirmar que o arquivo corresponde ao Novo Caged e registrar o mês/ano de referência.
2. Conferir o leiaute oficial e o código municipal exatamente como aparece no TXT.
3. Distinguir movimentações dentro do prazo, fora do prazo e excluídas; não misturar bases sem explicitar a metodologia.
4. Verificar se o saldo calculado corresponde a admissões menos desligamentos no mesmo recorte.
5. Não somar estoques entre meses; apresentar o estoque do último mês selecionado.
6. Preservar valores ausentes como ausentes — nunca substituir por zero.
7. Registrar URL da fonte, data de extração e referência temporal.

## Situação atual
A interface, filtros, tabela, gráficos e exportação CSV estão implementados. O JSON atualmente contém valores mensais (setembro/2026), setoriais e anuais (2021–2025) inseridos para desenvolvimento. Esses valores ainda não foram conferidos, linha a linha, com a extração oficial e as notas metodológicas do Novo Caged. Portanto, devem ser tratados como provisórios e não como série oficialmente validada. Antes da divulgação institucional, confirmar os totais, o recorte municipal, a classificação setorial, o estoque e a variação relativa diretamente nas fontes do MTE. O processamento assistido permanece disponível para consolidar microdados após a conferência do leiaute.

## Frequência
O MTE divulga o CAGED mensalmente. A atualização deve ocorrer após a publicação oficial e a validação do arquivo. O calendário de divulgação de 2026 está em: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho/o-pdet/calendario-de-divulgacao-do-novo-caged
