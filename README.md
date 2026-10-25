# Globo de neve

Diorama natalino em WebGL 2 e TWGL.js, com chão de neve, base decorativa e pinheiros. O centro do cenário está reservado para o Sawsbuck.

## Recursos da rena

O modelo foi fornecido no arquivo `rena - #0586 Sawsbuck.zip`, na pasta de elementos do trabalho. Foi selecionada a variante de inverno `pm0586_14_00`.

Os arquivos necessários estão em `assets/models/rena/`:

- `pm0586_14_00.obj`: geometria do personagem.
- `pm0586_14_00.mtl`: materiais e referências às texturas.
- `pm0586_11_00_alb.png`: textura referenciada pelos materiais dos olhos.
- `pm0586_14_00_body_a_alb.png`: textura da primeira parte do corpo.
- `pm0586_14_00_body_b_alb.png`: textura da segunda parte do corpo.

O carregamento do personagem na cena será implementado na próxima etapa correspondente do planejamento.

## Créditos

- Sawsbuck (#0586): personagem da franquia Pokémon. Modelo e texturas recebidos no pacote fornecido para o trabalho. O pacote não contém identificação do responsável pela extração, licença ou link de origem; esses dados ainda precisam ser confirmados para os créditos finais.
- Pinheiros com neve: modelo e textura do pacote `Mobile - Digimon ReArise - Decorations - Snow-covered Tree.zip`, fornecido na pasta de elementos. O autor da extração e o link de origem ainda precisam ser confirmados. A geometria DAE e a textura original estão em `assets/models/pinheiro/`.
- [TWGL.js](https://twgljs.org/): biblioteca de apoio à renderização WebGL.

## Modelo dos pinheiros

As três árvores usam o modelo fornecido, com sua textura original, em tamanhos e orientações diferentes. A malha estática foi convertida de `deco0057.dae` para `pinheiro.json` pelo script `tools/convert-tree.py`, usando apenas a biblioteca padrão do Python. O DAE original foi preservado. A conversão mantém os vértices, normais e coordenadas de textura da árvore, normaliza a altura para uma unidade e omite o plano de sombra do chão que acompanha o recurso.

Para refazer a conversão, execute `python tools/convert-tree.py` na raiz do projeto.

## Executar localmente

O carregamento dos modelos precisa de um servidor HTTP local. No VS Code, abra `index.html` com a extensão Live Server. Também é possível executar `python -m http.server 8000` na raiz do projeto e abrir `http://localhost:8000`.

## Presentes

Foram selecionados três modelos Royal Present de Katamari Damacy, fornecidos na pasta de elementos: `PRE01_D` (azul com fita lilás), `PRE03_D` (vermelho com dourado) e `PRE04_D` (verde com dourado). Os arquivos OBJ, MTL, informações e texturas originais estão em `assets/models/presentes/`.

O script `tools/convert-gifts.py` converte essas malhas OBJ para JSON, preservando as faces, normais, proporções e coordenadas de textura. A conversão centraliza cada modelo no chão e normaliza sua altura para uma unidade. Para refazê-la, execute `python tools/convert-gifts.py`.

Origem dos arquivos: pacotes `PlayStation 2 - Katamari Damacy - Miscellaneous - Royal Present (PRE01_D).zip`, `(PRE03_D).zip` e `(PRE04_D).zip` fornecidos para o trabalho. O responsável pela extração e os links de origem ainda precisam ser confirmados para os créditos finais.
