# Globo de neve

Diorama natalino em WebGL 2 e TWGL.js, com chão de neve, base decorativa e pinheiros. O Sawsbuck ocupa o centro do cenário.

## Recursos da rena

O modelo foi fornecido no arquivo `rena - #0586 Sawsbuck.zip`, na pasta de elementos do trabalho. A cena usa a variante de primavera `pm0586_11_00`, com flores rosas nos chifres e as texturas `rare_alb` da variante shiny, de pelagem mais clara. O MTL foi ajustado para referenciar essas texturas do pacote original. A variante de inverno `pm0586_14_00`, adicionada anteriormente, permanece disponível nos recursos.

Os arquivos da variante em uso estão em `assets/models/rena/`:

- `pm0586_11_00.obj`: geometria do personagem.
- `pm0586_11_00.mtl`: materiais e referências às texturas.
- `pm0586_11_00_alb.png`: textura referenciada pelos materiais dos olhos.
- `pm0586_11_00_body_a_rare_alb.png`: textura clara da primeira parte do corpo.
- `pm0586_11_00_body_b_rare_alb.png`: textura da segunda parte do corpo, incluindo as flores.

O personagem é carregado diretamente do OBJ e do MTL por `src/obj-loader.js`. Suas texturas são aplicadas por material, e `src/reindeer.js` ajusta a escala, a orientação e o posicionamento central sobre a neve.

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

As primeiras versões usaram três modelos Royal Present de Katamari Damacy, fornecidos na pasta de elementos: `PRE01_D` (azul com fita lilás), `PRE03_D` (vermelho com dourado) e `PRE04_D` (verde com dourado). Os arquivos OBJ, MTL, informações e texturas originais estão em `assets/models/presentes/`.

O script `tools/convert-gifts.py` converte essas malhas OBJ para JSON, preservando as faces, normais, proporções e coordenadas de textura. A conversão centraliza cada modelo no chão e normaliza sua altura para uma unidade. Para refazê-la, execute `python tools/convert-gifts.py`.

Origem dos arquivos: pacotes `PlayStation 2 - Katamari Damacy - Miscellaneous - Royal Present (PRE01_D).zip`, `(PRE03_D).zip` e `(PRE04_D).zip` fornecidos para o trabalho. O responsável pela extração e os links de origem ainda precisam ser confirmados para os créditos finais.

## Pedras com neve

As pedras usam o modelo e a textura originais do pacote `GameCube - Star Fox Adventures - Map Objects - Snow Rock.zip`, fornecido na pasta `elementos/paisagismo`. Os arquivos estão em `assets/models/pedra/`. O OBJ e o MTL são carregados diretamente; as três instâncias compartilham geometria e textura, com tamanhos e orientações diferentes. O responsável pela extração e o link de origem ainda precisam ser confirmados para os créditos finais.

## Matinhos com neve

Os modelos Snow Grass e Snow Horsetail, de Star Fox Adventures, foram fornecidos nos pacotes `GameCube - Star Fox Adventures - Map Objects - Snow Grass.zip` e `GameCube - Star Fox Adventures - Map Objects - Snow Horsetail.zip`, na pasta `elementos/paisagismo`. Os arquivos OBJ, MTL e texturas originais estão em `assets/models/matinhos/`. Sete pequenas moitas são distribuídas junto às pedras e aos pinheiros, compartilhando os recursos de cada modelo. O responsável pela extração e os links de origem ainda precisam ser confirmados para os créditos finais.

## Monte de neve

O monte de neve usa a malha OBJ e a textura de cor do pacote `PC _ Computer - Rec Room - Map Objects - Snow Mound.zip`, fornecido na pasta `elementos/paisagismo`. Duas instâncias foram distribuídas perto dos presentes à esquerda e junto aos pinheiros à direita, com escala uniforme e a base ligeiramente embutida no chão. Os recursos originais estão em `assets/models/monte-neve/`. O mapa de normais referenciado pelo MTL foi preservado, mas ainda não é aplicado pelo renderizador. O responsável pela extração e o link de origem ainda precisam ser confirmados para os créditos finais.

Os presentes atualmente exibidos usam as malhas `acc144` e `acc145` do pacote `PC _ Computer - Digimon Story Cyber Sleuth_ Complete Edition - Accessories - Present Box.zip`: branco com laço vermelho, vermelho com laço dourado e dourado. As posições, alturas e orientações anteriores foram preservadas. Os modelos e texturas originais estão em `assets/models/presentes/digimon/`. A conversão estática para JSON pode ser refeita com `python tools/convert-presents.py`, usando a rotina compartilhada `tools/collada_mesh.py`, que também atende à conversão dos pinheiros. As malhas sem coordenadas de textura usadas para contornos não são exportadas. O responsável pela extração e o link de origem ainda precisam ser confirmados.
