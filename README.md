# A Revolta dos Mendigos — RPG Carcaça

Jogo completo de estratégia narrativa e combate por turnos, construído como PWA offline para GitHub Pages. Interface exclusivamente vertical para celular (no PC a página fica com largura máxima de 460 px).

## Premissa

A revolta de Shadar-Riverie começa quando um paladino halfling de Grama-Cortada presenteia um mendigo com 18 moedas, suficientes para comprar uma espada de 12. Poucos dias depois, o mesmo paladino lança moedas de ouro sobre o Distrito Afogado enquanto voa numa vassoura. Armas aparecem, as assembleias se formam e os moradores da Cidade Baixa marcham para a Cidade Alta. Um cavaleiro demoníaco oferece seu poder contra a aristocracia e instiga represálias cruéis. No desfecho, Ulorian Uln-Shayr, Rei do Rio, tem uma proteção mágica que armas comuns não atravessam: somente o paladino ou o demônio podem rompê-la temporariamente.

## Sistemas

- **42 dias e 42 batalhas únicas**, com 6 atos e desfechos narrativos escritos individualmente.
- **8 integrantes possíveis** (Coto, Marga, Íria, Silas, Olmo, Dara, Vega e Lorena), níveis, XP, PV e Foco persistentes, fadiga e morte definitiva.
- **25 missões** com dilemas e consequências, incluindo missões pessoais.
- **12 operações diárias** de organização, alimentação, forja, recuperação, treinamento, informação e defesa.
- **6 projetos permanentes** de até três níveis (cozinha, oficina, enfermaria, imprensa, passagens e barricadas).
- **6 bairros** disputados e observáveis na aba Distrito.
- **8 grandes decisões** que alteram Bênção, Pacto, Esperança, Legitimidade e Crueldade.
- **Batalhas de turno clássico:** selecionar até quatro defensores, ataques, habilidades, cura, proteção e intervenção sobrenatural.
- **4 tipos principais de epílogo**, além de derrota por morte completa dos defensores.
- Salvamento automático, exportação/importação JSON e funcionamento offline após instalação.

## Publicar gratuitamente

1. Crie um repositório público no GitHub, por exemplo `revolta-dos-mendigos`.
2. **Extraia** todo o ZIP e envie `index.html`, `app.js`, `data.js`, `style.css`, `manifest.webmanifest`, `sw.js` e as pastas `assets/`, `icons/` **diretamente na raiz**.
3. Em `Settings > Pages`, defina `Deploy from a branch`, branch `main`, pasta `/(root)` e salve.
4. Acesse `https://SEU-USUARIO.github.io/revolta-dos-mendigos/` no navegador do celular.
5. Aguarde `PRONTO PARA JOGAR OFFLINE` e instale pelo menu do navegador (Chrome Android: `Instalar app` ou `Adicionar à tela inicial`).
6. Abra o ícone instalado uma vez com internet para confirmar a instalação e depois teste em modo avião.

O jogo não requer internet, servidores, bibliotecas ou imagens externas durante a partida. Salvos ficam no armazenamento local do navegador. Faça backups em `☰ > Exportar salvamento` antes de limpar os dados do navegador ou trocar de aparelho.

## Estrutura

- `index.html`: página e configurações da interface
- `style.css`: layout mobile-first
- `data.js`: 42 episódios de combate, heróis, inimigos, missões, dilemas e ações
- `app.js`: motor narrativo, economia, batalha, evolução, salvamento e telas
- `assets/`: arte vetorial original incluída localmente
- `icons/`: ícones de instalação
- `manifest.webmanifest`: instalação PWA
- `sw.js`: pré-cache offline

## Notas de adaptação e cânone

Os fatos fundadores da primeira espada, da chuva de ouro, da corrupção pelo cavaleiro e da invulnerabilidade final de Ulorian foram fornecidos pelo criador do cenário. Shadar-Riverie, a Casa Uln-Shayr e o vínculo de Ulorian com a Corte também são elementos da lore de Carcaça. Os nomes dos integrantes jogáveis, a sequência detalhada dos ataques, os projetos, os dilemas e as regras de combate desta versão são criações originais **deste jogo**, não afirmações de que esses acontecimentos já ocorreram no cânone da campanha de mesa.

## Licença do código

Arte e código originais deste pacote podem ser publicados e modificados pelo autor do projeto Carcaça. Nomes e elementos preexistentes de terceiros continuam sujeitos aos respectivos direitos de seus titulares. Não é necessário hospedar ou redistribuir livros de RPG com este jogo.
