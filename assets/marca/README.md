# assets/marca: marca da Janaina Souto Advocacia

Situação em 21/10/2026 (Etapa 12): **o logotipo oficial ainda não está nesta pasta.** Pendência C19 em `docs/pendencias.md`.

## Logotipo oficial (aguardando arquivo)

O logotipo foi visto nos posts do Instagram e na fachada do escritório. Para descrevê-lo, usamos as capturas transcritas em `docs/fontes/PERFIS_PUBLICOS_2026-10-21.md` e o PNG do site antigo:

- **Símbolo:** monograma "JS" em serifa clássica, com o J e o S entrelaçados, entre dois ramos de louro que se cruzam na base.
- **Nome:** abaixo do símbolo, "JANAINA SOUTO" em maiúsculas serifadas e, na linha seguinte, "– ADVOCACIA –" em maiúsculas espaçadas.
- **Cores:** azul-marinho (ou royal), dourado e branco. Na placa da fachada, o fundo é azul-marinho e o logo é dourado.
- **Raster disponível:** `assets/brand/logo-janaina.png`, com 1024x819 px. É branco, com relevo e sombra, sobre fundo transparente. Serve como referência, não para produção: tem efeitos, não é vetor e não fica legível em 32 px.

**O que pedir à cliente (C19):** o logo em vetor (SVG, PDF ou AI), as versões horizontal, vertical e só o símbolo, e os códigos HEX (ou Pantone ou CMYK) do azul e do dourado. A pergunta já está em `docs/PERGUNTAS_WHATSAPP_DRA_JANAINA.md`, item (a).

Por decisão do usuário, a agência **não redesenha nem imita o monograma.**

## Arquivos PROVISÓRIOS desta pasta

São só tipográficos. Servem para o método seguir e para documentos internos, e **não substituem o logotipo oficial**. O site continua usando o wordmark em HTML do header (`src/templates/site.mjs`), que já é tipográfico.

| Arquivo | Uso |
|---|---|
| `logo-horizontal-provisoria.svg` / `.png` | "Janaina Souto" em Cormorant Garamond 600 (`--ink-950`) + "ADVOCACIA" em Inter 600 espaçada (`--accent-on-light`), para fundo claro |
| `logo-branca-provisoria.svg` / `.png` | A mesma composição para fundo escuro: nome em `--text-on-dark` e legenda em `--champagne-400` |
| `logo-vertical-provisoria.svg` | Versão centralizada para fundo claro |
| `simbolo-provisorio.svg` e `simbolo-provisorio-512/32/16.png` | Iniciais "JS" lado a lado em Cormorant, douradas, sobre quadrado `--ink-950` com margem interna. Base de favicon só se o atual (`assets/icons/favicon.svg`) precisar ser trocado antes do vetor oficial. Não reproduz o monograma: sem entrelaçamento e sem louros |
| `paleta.json` | Paleta em HEX com os papéis da marca e a proposta de ajuste do azul-marinho, ainda não aplicada |

O texto dos SVGs foi convertido em contornos a partir das fontes auto-hospedadas do site (`assets/fonts/`), e cada arquivo leva no `<desc>` a marcação "PROVISÓRIA". Quando o vetor oficial chegar, apague todos os arquivos `*-provisori*` e gere `logo-horizontal.svg`, `logo-branca.svg`, `logo-vertical.svg` e `simbolo.svg` a partir dele.

## Paleta (aproximada; HEX oficiais pendentes)

| Papel | Token | HEX | Origem |
|---|---|---|---|
| Primária (azul-marinho) | `--ink-950` | `#0b1016` | Aproximada da fachada e dos posts |
| Secundária | `--ink-800` | `#182433` | Aproximada da fachada e dos posts |
| Destaque / botões (dourado) | `--champagne-500` | `#c6a15b` | Aproximada do logo dourado |
| Dourado sobre escuro | `--champagne-400` | `#d7b977` | Escala do dourado |
| Dourado para texto sobre claro | `--accent-on-light` | `#765322` | Escala do dourado, para contraste |
| Texto principal | `--text-dark` | `#20252b` | Design aprovado |
| Texto secundário | `--text-secondary` | `#4d5257` | Design aprovado |
| Fundo claro (branco quente) | `--ivory-50` | `#faf7f2` | Design aprovado |
| Fundo escuro | `--ink-950` | `#0b1016` | Aproximada da fachada |

Os contrastes WCAG calculados estão em `docs/07-design-system.json`, em `paleta_oficial.contrastes_wcag` e `tokens.colors`. A proposta de deixar o azul mais "marinho", sem mudar a luminosidade nem os contrastes, está em `proposta_ajuste_paleta`. Ela aguarda aprovação (D7) e não foi aplicada ao CSS.
